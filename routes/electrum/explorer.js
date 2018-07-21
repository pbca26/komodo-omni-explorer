const config = require('../../config');
const remoteExplorers = require('../../config').explorers;
const remoteExplorersInsight = require('../../config').insight;
const _electrumServers = require('../../config').electrumServers;
const { komodoParams } = require('../../config');
const txDecoder = require('agama-wallet-lib/src/transaction-decoder');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const { komodoInterest } = require('agama-wallet-lib');
const {
  toSats,
  fromSats,
} = require('agama-wallet-lib/src/utils');
const acSupply = require('./acSupply');

const OVERVIEW_UPDATE_INTERVAL = 180000; // every 3 min
const SUMMARY_UPDATE_INTERVAL = 600000; // every 10 min
const MAX_REMOTE_EXPLORER_TIMEOUT = 10000;
const SOCKET_MAX_TIMEOUT = 20000;

// TODO: add search one time caching, per request basis

let remoteExplorersArray = [];
let remoteExplorersArrayInsight = [];
let electrumServers = [];

for (let key in remoteExplorers) {
  remoteExplorersArray.push(key);
}

for (let key in remoteExplorersInsight) {
  if (key !== 'maxTxLength') {
    remoteExplorersArrayInsight.push(key);
  }
}

for (let key in _electrumServers) {
  electrumServers.push({
    coin: key,
    serverList: _electrumServers[key].serverList,
  });
}

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min; // the maximum is inclusive and the minimum is inclusive
}

const sortByDate = (data, sortKey) => {
  return data.sort((b, a) => {
    if (a[sortKey] < b[sortKey]) {
      return -1;
    }

    if (a[sortKey] > b[sortKey]) {
      return 1;
    }

    return 0;
  });
}

const sortTransactions = (transactions) => {
  return transactions.sort((b, a) => {
    if (a.height < b.height) {
      return -1;
    }

    if (a.height > b.height) {
      return 1;
    }

    return 0;
  });
}

module.exports = (shepherd) => {
  shepherd.get('/explorer/summary', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.explorer.summary,
    }));
  });

  shepherd.getSummary = () => {
    const _getSummary = () => {
      let remoteExplorersFinished = {};

      Promise.all(remoteExplorersArray.map((coin, index) => {
        return new Promise((resolve, reject) => {
          const options = {
            url: `${remoteExplorers[coin]}/ext/summary`,
            method: 'GET',
          };

          setTimeout(() => {
            if (!remoteExplorersFinished[coin]) {
              console.log(`summary ${coin} is stuck, cancel req`);
              resolve({
                coin,
                result: 'unable to get summary',
              });
            }
          }, MAX_REMOTE_EXPLORER_TIMEOUT);

          request(options, (error, response, body) => {
            remoteExplorersFinished[coin] = true;

            try {
              if (response &&
                  response.statusCode &&
                  response.statusCode === 200) {
                resolve({
                  coin,
                  data: JSON.parse(body).data,
                });
              } else {
                resolve({
                  coin,
                  data: 'unable to get summary',
                });
              }
            } catch (e) {
              resolve({
                coin,
                data: 'unable to get summary',
              });
            }
          });
        });
      }))
      .then(_result => {
        let result = _result;
        let _remoteExplorersFinished = {};

        // run insight explorers
        Promise.all(remoteExplorersArrayInsight.map((coin, index) => {
          return new Promise((resolve, reject) => {
            console.log(`insight summary ${coin}`);

            const options = {
              url: `${remoteExplorersInsight[coin].url}/status?q=getInfo`,
              method: 'GET',
            };

            setTimeout(() => {
              if (!_remoteExplorersFinished[coin]) {
                console.log(`summary ${coin} is stuck, cancel req`);
                resolve({
                  coin,
                  result: 'unable to get summary',
                });
              }
            }, MAX_REMOTE_EXPLORER_TIMEOUT);

            request(options, (error, response, body) => {
              _remoteExplorersFinished[coin] = true;

              if (response &&
                  response.statusCode &&
                  response.statusCode === 200) {
                const {
                  difficulty,
                  blocks,
                  connections,
                } = JSON.parse(body).info;
                let data = [{
                  difficulty,
                  connections,
                  blockcount: blocks,
                  supply: acSupply[coin.toUpperCase()] || '',
                }];
                result.push({
                  coin: coin.toUpperCase(),
                  data,
                });
                resolve();
              } else {
                resolve({
                  coin,
                  data: 'unable to get summary',
                });
              }
            });
          });
        }))
        .then(__result => {
          if (result &&
              result.length) {
            const summaryFileLocation = path.join(__dirname, '../../summary.json');

            fs.writeFile(summaryFileLocation, JSON.stringify(result), (err) => {
              if (err) {
                console.log(`error updating summary cache file ${err}`);
              } else {
                const summaryFile = fs.readJsonSync(summaryFileLocation, { throws: false });
                let items = [];

                shepherd.explorer.summary = summaryFile;

                console.log('explorer summary updated');
              }
            });
          }
        });
      });
    }

    _getSummary();
    setInterval(() => {
      _getSummary();
    }, SUMMARY_UPDATE_INTERVAL);
  }

  shepherd.get('/explorer/overview', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.explorer.overview,
    }));
  });

  shepherd.insightLastTransactions = (coin) => {
    return new Promise((resolveMain, rejectMain) => {
      const options = {
        url: `${config.insight[coin].url}/blocks?limit=${config.insight.maxTxLength}`,
        method: 'GET',
      };
      // console.log(`${config.insight[coin].url}/blocks?limit=${config.insight.maxTxLength}`);

      request(options, (error, response, body) => {
        if (response &&
            response.statusCode &&
            response.statusCode === 200) {
          try {
            const _blocks = JSON.parse(body).blocks;
            let _txs = [];
            // console.log(JSON.stringify(_blocks));

            if (_blocks &&
                _blocks.length) {
              Promise.all(_blocks.map((block, index) => {
                return new Promise((resolve, reject) => {
                  setTimeout(() => {
                    // console.log(`insight ${index}`);
                    // console.log(`${config.insight[coin].url}/api/txs?block=${block.hash}`);

                    const options = {
                      url: `${config.insight[coin].url}/txs?block=${block.hash}`,
                      method: 'GET',
                    };

                    request(options, (error, response, body) => {
                      if (response &&
                          response.statusCode &&
                          response.statusCode === 200) {
                        try {
                          let txs = JSON.parse(body);

                          if (txs &&
                              txs.txs) {
                            txs = txs.txs;
                            // console.log(txs);

                            for (let i = 0; i < txs.length; i++) {
                              _txs.push({
                                txid: txs[i].txid,
                                blockhash: block.hash,
                                blockindex: block.height,
                                timestamp: txs[i].time,
                                total: config.insight[coin].float ? toSats(txs[i].valueOut) : txs[i].valueOut,
                                vout: txs[i].vout,
                                vin: txs[i].vin,
                              });
                              resolve(true);
                            }
                          } else {
                            console.log(`unable to get txs in ${coin} block ${block.height}`);
                            resolve(false);
                          }
                        } catch (e) {
                          console.log(`unable to get txs in ${coin} block ${block.height}`);
                          resolve(false);
                        }
                      } else {
                        console.log(`unable to get txs in ${coin} block ${block.height}`);
                        resolve(false);
                      }
                    });
                  }, index * 1500);
                });
              }))
              .then(result => {
                console.log(`insight ${coin} last txs is finished, total txs ${_txs.length}`);
                // console.log(JSON.stringify(_txs));

                resolveMain({
                  coin,
                  result: JSON.stringify({
                    data: _txs,
                  }),
                });
              });
              // resolve(true);
            } else {
              resolveMain({
                coin,
                result: 'unable to get lasttx',
              });
              console.log(`unable to get insight last blocks for ${coin}`);
            }
          } catch (e) {
            resolveMain({
              coin,
              result: 'unable to get lasttx',
            });
            console.log(`unable to get insight last blocks for ${coin}`);
          }
        } else {
          resolveMain({
            coin,
            result: 'unable to get lasttx',
          });
          console.log(`unable to get insight last blocks for ${coin}`);
        }
      });
    });
  };

  shepherd.getOverview = () => {
    const _getOverview = () => {
      let remoteExplorersFinished = {};

      Promise.all(remoteExplorersArray.map((coin, index) => {
        return new Promise((resolve, reject) => {
          const options = {
            url: `${remoteExplorers[coin]}/ext/getlasttxs/0.00000001`,
            method: 'GET',
          };

          setTimeout(() => {
            if (!remoteExplorersFinished[coin]) {
              console.log(`overview ${coin} is stuck, cancel req`);
              resolve({
                coin,
                result: 'unable to get lasttx',
              });
            }
          }, MAX_REMOTE_EXPLORER_TIMEOUT);

          request(options, (error, response, body) => {
            remoteExplorersFinished[coin] = true;

            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              console.log(`overview got lasttx for ${coin}`);
              resolve({
                coin,
                result: body,
              });
            } else {
              console.log(`overview unable to get lasttx for ${coin}`);
              resolve({
                coin,
                result: 'unable to get lasttx',
              });
            }
          });
        });
      }))
      .then(_result => {
        console.log('overview executed');
        let result = _result;

        if (result &&
            result.length) {
          const overviewFileLocation = path.join(__dirname, '../../overview.json');

          // run insight explorers
          Promise.all(remoteExplorersArrayInsight.map((coin, index) => {
            return new Promise((resolve, reject) => {
              console.log(`insight overview ${coin}`);

              shepherd.insightLastTransactions(coin)
              .then((res) => {
                result.push(res);
                resolve();
              });
            });
          }))
          .then(__result => {
            fs.writeFile(overviewFileLocation, JSON.stringify({ result }), (err) => {
              if (err) {
                console.log(`error updating overview cache file ${err}`);
              } else {
                const overviewFile = fs.readJsonSync(overviewFileLocation, { throws: false });

                if (overviewFile &&
                    overviewFile.result) {
                  const resSizeLimit = 1000;
                  let items = [];
                  console.log(`tracking ${overviewFile.result.length} coin explorers`);

                  for (let i = 0; i < overviewFile.result.length; i++) {
                    try {
                      const _parseData = JSON.parse(overviewFile.result[i].result).data;

                      for (let j = 0; j < _parseData.length; j++) {
                        items.push({
                          coin: overviewFile.result[i].coin,
                          txid: _parseData[j].txid,
                          blockhash: _parseData[j].blockhash,
                          blockindex: _parseData[j].blockindex,
                          timestamp: _parseData[j].timestamp,
                          total: _parseData[j].total,
                        });
                      }
                    } catch (e) {}
                  }

                  items = sortByDate(items, 'timestamp');
                  items = items.slice(0, resSizeLimit + 1);

                  shepherd.explorer.overview = items;

                  console.log(`explorer overview updated at ${Date.now()}`);
                }
              }
            });
          });
        }
      });
    }

    _getOverview();
    setInterval(() => {
      _getOverview();
    }, OVERVIEW_UPDATE_INTERVAL);
  }

  shepherd.get('/explorer/search', (req, res, next) => {
    const _searchTerm = req.query.term;

    if (_searchTerm.length === 64) {
      // txid redirect
      let errorCount = 0;
      let coin;

      Promise.all(electrumServers.map((electrumServerData, index) => {
        return new Promise((resolve, reject) => {
          const _server = electrumServerData.serverList[0].split(':');
          const ecl = new shepherd.electrumJSCore(_server[1], _server[0], 'tcp');

          ecl.connect();
          ecl.blockchainTransactionGet(req.query.term)
          .then((_rawtxJSON) => {
            ecl.close();

            // console.log(`search ${req.query.term} in ${electrumServerData.coin}`);
            // console.log(_rawtxJSON);

            if (_rawtxJSON &&
                !_rawtxJSON.status &&
                !_rawtxJSON.code) {
              coin = electrumServerData.coin.toUpperCase();
            }
            resolve();
          });
        });
      }))
      .then(result => {
        if (!coin) {
          const successObj = {
            msg: 'error',
            result: 'txid not found',
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(successObj));
        } else {
          const successObj = {
            msg: 'success',
            result: coin,
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(successObj));
        }
      });
    } else {
      // TODO: switch tx history to be queried first, add pub address validation check
      // pub address
      let errorCount = 0;
      let _finishedBalanceCalls = {};

      Promise.all(electrumServers.map((electrumServerData, index) => {
        return new Promise((resolve, reject) => {
          const _server = electrumServerData.serverList[getRandomIntInclusive(0, 1)].split(':');
          const ecl = new shepherd.electrumJSCore(_server[1], _server[0], 'tcp');

          setTimeout(() => {
            if (!_finishedBalanceCalls[electrumServerData.coin.toUpperCase()]) {
              errorCount++;
              resolve('error');
              _finishedBalanceCalls[electrumServerData.coin.toUpperCase()] = 'error';
            }
          }, SOCKET_MAX_TIMEOUT);

          ecl.connect();
          ecl.blockchainAddressGetBalance(_searchTerm)
          .then((json) => {
            ecl.close();

            if (json &&
                json.hasOwnProperty('confirmed') &&
                json.hasOwnProperty('unconfirmed')) {
              resolve({
                coin: electrumServerData.coin.toUpperCase(),
                balanceSats: {
                  confirmed: json.confirmed,
                  unconfirmed: json.unconfirmed,
                },
                balance: {
                  confirmed: Number(fromSats(json.confirmed).toFixed(8)),
                  unconfirmed: Number(fromSats(json.unconfirmed).toFixed(8)),
                },
              });
              _finishedBalanceCalls[electrumServerData.coin.toUpperCase()] = true;
            } else {
              errorCount++;
              resolve('error');
              _finishedBalanceCalls[electrumServerData.coin.toUpperCase()] = 'error';
            }
          });
        });
      }))
      .then(result => {
        if (errorCount === electrumServers.length) {
          const successObj = {
            msg: 'error',
            result: 'wrong address',
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(successObj));
        } else {
          const _balance = result;
          let _transactions = [];

          Promise.all(electrumServers.map((electrumServerData, index) => {
            if (_finishedBalanceCalls[electrumServerData.coin.toUpperCase()] !== 'error') {
              return new Promise((resolve, reject) => {
                const _server = electrumServerData.serverList[getRandomIntInclusive(0, 1)].split(':');
                const ecl = new shepherd.electrumJSCore(_server[1], _server[0], 'tcp');
                const MAX_TX = 20;

                ecl.connect();
                ecl.blockchainAddressGetHistory(req.query.term)
                .then((json) => {
                  if (!json.code) {
                    if (json &&
                        json.length) {
                      json = sortTransactions(json);
                      json = json.slice(0, MAX_TX);

                      Promise.all(json.map((transaction, index) => {
                        return new Promise((resolve, reject) => {
                          ecl.blockchainBlockGetHeader(transaction.height)
                          .then((blockInfo) => {
                            if (blockInfo &&
                                blockInfo.timestamp) {
                              ecl.blockchainTransactionGet(transaction['tx_hash'])
                              .then((_rawtxJSON) => {
                                _transactions.push({
                                  coin: electrumServerData.coin.toUpperCase(),
                                  blockindex: transaction.height,
                                  txid: transaction['tx_hash'],
                                  timestamp: Number(transaction.height) === 0 ? Math.floor(Date.now() / 1000) : blockInfo.timestamp,
                                });
                                resolve();
                              });
                            } else {
                              resolve();
                            }
                          });
                        });
                      }))
                      .then(promiseResult => {
                        ecl.close();
                        resolve();
                      });
                    } else {
                      ecl.close();
                      resolve();
                    }
                  } else {
                    resolve();
                    ecl.close();
                  }
                });
              });
            }
          }))
          .then(result => {
            const successObj = {
              msg: 'success',
              result: {
                balance: _balance,
                transactions: _transactions,
              }
            };

            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(successObj));
          });
        }
      });
    }
  });

  shepherd.get('/kmd/interest', (req, res, next) => {
    const randomServer = _electrumServers.kmd.serverList[getRandomIntInclusive(0, 1)].split(':');
    const ecl = new shepherd.electrumJSCore(randomServer[1], randomServer[0], 'tcp');

    ecl.connect();
    ecl.blockchainAddressGetBalance(req.query.address)
    .then((json) => {
      if (json &&
          json.hasOwnProperty('confirmed') &&
          json.hasOwnProperty('unconfirmed')) {
        ecl.connect();
        ecl.blockchainAddressListunspent(req.query.address)
        .then((utxoList) => {
          if (utxoList &&
              utxoList.length) {
            // filter out < 10 KMD amounts
            let _utxo = [];

            for (let i = 0; i < utxoList.length; i++) {
              if (fromSats(Number(utxoList[i].value)) >= 10) {
                _utxo.push(utxoList[i]);
              }
            }

            if (_utxo &&
                _utxo.length) {
              let interestTotal = 0;

              Promise.all(_utxo.map((_utxoItem, index) => {
                return new Promise((resolve, reject) => {
                  ecl.blockchainTransactionGet(_utxoItem['tx_hash'])
                  .then((_rawtxJSON) => {
                    // decode tx
                    const decodedTx = txDecoder(_rawtxJSON, komodoParams);

                    if (decodedTx &&
                        decodedTx.format &&
                        decodedTx.format.locktime > 0) {
                      interestTotal += Number(komodoInterest(decodedTx.format.locktime, _utxoItem.value, _utxoItem.height));
                    }

                    resolve(true);
                  });
                });
              }))
              .then(promiseResult => {
                ecl.close();
                const successObj = {
                  msg: 'success',
                  result: {
                    balance: Number(fromSats(json.confirmed).toFixed(8)),
                    unconfirmed: Number(fromSats(json.unconfirmed).toFixed(8)),
                    unconfirmedSats: json.unconfirmed,
                    balanceSats: json.confirmed,
                    interest: Number(interestTotal.toFixed(8)),
                    interestSats: Math.floor(toSats(interestTotal)),
                    total: interestTotal > 0 ? Number((fromSats(json.confirmed) + interestTotal).toFixed(8)) : 0,
                    totalSats: interestTotal > 0 ? json.confirmed + Math.floor(toSats(interestTotal)) : 0,
                  },
                };

                res.set({ 'Content-Type': 'application/json' });
                res.end(JSON.stringify(successObj));
              });
            } else {
              const successObj = {
                msg: 'success',
                result: {
                  balance: Number(fromSats(json.confirmed).toFixed(8)),
                  unconfirmed: Number(fromSats(json.unconfirmed).toFixed(8)),
                  unconfirmedSats: json.unconfirmed,
                  balanceSats: json.confirmed,
                  interest: 0,
                  interestSats: 0,
                  total: 0,
                  totalSats: 0,
                },
              };

              res.set({ 'Content-Type': 'application/json' });
              res.end(JSON.stringify(successObj));
            }
          } else {
            const successObj = {
              msg: 'success',
              result: {
                balance: Number(fromSats(json.confirmed).toFixed(8)),
                unconfirmed: Number(fromSats(json.unconfirmed).toFixed(8)),
                unconfirmedSats: json.unconfirmed,
                balanceSats: json.confirmed,
                interest: 0,
                interestSats: 0,
                total: 0,
                totalSats: 0,
              },
            };

            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(successObj));
          }
        });
      } else {
        const successObj = {
          msg: 'error',
          result: json,
        };

        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(successObj));
      }
    });
  });

  shepherd.electrumGetCurrentBlock = (ecl) => {
    return new Promise((resolve, reject) => {
      ecl.blockchainHeadersSubscribe()
      .then((json) => {
        if (json['block_height']) {
          resolve(json['block_height']);
        } else {
          resolve(json);
        }
      });
    });
  }

  shepherd.listunspent = (ecl, address, network) => {
    let _atLeastOneDecodeTxFailed = false;

    return new Promise((resolve, reject) => {
      ecl.connect();
      ecl.blockchainAddressListunspent(address)
      .then((_utxoJSON) => {
        if (_utxoJSON &&
            _utxoJSON.length) {
          let formattedUtxoList = [];
          let _utxo = [];

          shepherd.electrumGetCurrentBlock(ecl)
          .then((currentHeight) => {
            if (currentHeight &&
                Number(currentHeight) > 0) {
              // filter out unconfirmed utxos
              for (let i = 0; i < _utxoJSON.length; i++) {
                if (Number(currentHeight) - Number(_utxoJSON[i].height) !== 0) {
                  _utxo.push(_utxoJSON[i]);
                }
              }

              if (!_utxo.length) { // no confirmed utxo
                resolve({
                  code: -777,
                  result: 'no valid utxo',
                });
              } else {
                Promise.all(_utxo.map((_utxoItem, index) => {
                  return new Promise((resolve, reject) => {
                    ecl.blockchainTransactionGet(_utxoItem['tx_hash'])
                    .then((_rawtxJSON) => {
                      // decode tx
                      const decodedTx = txDecoder(_rawtxJSON, komodoParams);

                      if (!decodedTx) {
                        _atLeastOneDecodeTxFailed = true;
                        resolve('cant decode tx');
                      } else {
                        let interest = 0;

                        if (Number(fromSats(_utxoItem.value)) >= 10 &&
                            decodedTx.format.locktime > 0) {
                          interest = Number(komodoInterest(decodedTx.format.locktime, _utxoItem.value, _utxoItem.height));
                        }

                        let _resolveObj = {
                          txid: _utxoItem['tx_hash'],
                          vout: _utxoItem['tx_pos'],
                          address,
                          amount: Number(fromSats(_utxoItem.value)),
                          amountSats: _utxoItem.value,
                          locktime: decodedTx.format.locktime,
                          interest: Number(interest.toFixed(8)),
                          interestSats: Math.floor(toSats(interest)),
                          confirmations: Number(_utxoItem.height) === 0 ? 0 : currentHeight - _utxoItem.height,
                        };

                        resolve(_resolveObj);
                      }
                    });
                  });
                }))
                .then(promiseResult => {
                  ecl.close();

                  if (!_atLeastOneDecodeTxFailed) {
                    resolve(promiseResult);
                  } else {
                    resolve({
                      code: -777,
                      result: 'decode error',
                    });
                  }
                });
              }
            } else {
              ecl.close();
              resolve({
                code: -777,
                result: 'cant get current height',
              });
            }
          });
        } else {
          ecl.close();
          resolve(_utxoJSON);
        }
      });
    });
  }

  shepherd.get('/kmd/listunspent', (req, res, next) => {
    const network = 'komodo';
    const randomServer = _electrumServers.kmd.serverList[getRandomIntInclusive(0, 1)].split(':');
    const ecl = new shepherd.electrumJSCore(randomServer[1], randomServer[0], 'tcp');

    shepherd.listunspent(
      ecl,
      req.query.address,
      network
    )
    .then((json) => {
      const successObj = {
        msg: json.code ? 'error' : 'success',
        result: json,
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(successObj));
    });
  });

  shepherd.get('/timestamp/now', (req, res, next) => {
    const successObj = {
      msg: 'success',
      result: Date.now(),
    };

    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify(successObj));
  });

  return shepherd;
};