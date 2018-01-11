const remoteExplorers = require('../../config').explorers;
const _electrumServers = require('../../config').electrumServers;
const komodoParams = require('../../config').komodoParams;
const txDecoder = require('./txDecoder');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');

const OVERVIEW_UPDATE_INTERVAL = 30000; // every 30s
const SUMMARY_UPDATE_INTERVAL = 600000; // every 10 min
let remoteExplorersArray = [];
let electrumServers = [];

for (let key in remoteExplorers) {
  remoteExplorersArray.push(key);
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
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.explorer.summary,
    }));
  });

  shepherd.getSummary = () => {
    const _getSummary = () => {
      Promise.all(remoteExplorersArray.map((coin, index) => {
        return new Promise((resolve, reject) => {
          const options = {
            url: `${remoteExplorers[coin]}/ext/summary`,
            method: 'GET',
          };

          request(options, (error, response, body) => {
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
          });
        });
      }))
      .then(result => {
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
      });
    }

    _getSummary();
    setInterval(() => {
      _getSummary();
    }, SUMMARY_UPDATE_INTERVAL);
  }

  shepherd.get('/explorer/overview', (req, res, next) => {
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.explorer.overview,
    }));
  });

  shepherd.getOverview = (test) => {
    const _getOverview = () => {
      Promise.all(remoteExplorersArray.map((coin, index) => {
        return new Promise((resolve, reject) => {
          const options = {
            url: `${remoteExplorers[coin]}/ext/getlasttxs/0.00000001`,
            method: 'GET',
          };

          request(options, (error, response, body) => {
            if (response &&
                response.statusCode &&
                response.statusCode === 200) {
              resolve({
                coin,
                result: body,
              });
            } else {
              resolve({
                coin,
                result: 'unable to get lasttx',
              });
            }
          });
        });
      }))
      .then(result => {
        const overviewFileLocation = path.join(__dirname, '../../overview.json');

        fs.writeFile(overviewFileLocation, JSON.stringify({ result }), (err) => {
          if (err) {
            console.log(`error updating overview cache file ${err}`);
          } else {
            const overviewFile = fs.readJsonSync(overviewFileLocation, { throws: false });
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
                    vout: _parseData[j].vout,
                    vin: _parseData[j].vin,
                  });
                }
              } catch (e) {}
            }

            items = sortByDate(items, 'timestamp');
            items = items.slice(0, resSizeLimit + 1);

            shepherd.explorer.overview = items;

            console.log('explorer overview updated');
          }
        });
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

            if (JSON.stringify(_rawtxJSON).indexOf("'code':") === -1) {
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

          res.end(JSON.stringify(successObj));
        } else {
          const successObj = {
            msg: 'success',
            result: coin,
          };

          res.end(JSON.stringify(successObj));
        }
      });
    } else {
      // pub address
      let errorCount = 0;
      Promise.all(electrumServers.map((electrumServerData, index) => {
        return new Promise((resolve, reject) => {
          const _server = electrumServerData.serverList[getRandomIntInclusive(0, 1)].split(':');
          const ecl = new shepherd.electrumJSCore(_server[1], _server[0], 'tcp');

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
                  confirmed: Number((json.confirmed * 0.00000001).toFixed(8)),
                  unconfirmed: Number((json.unconfirmed * 0.00000001).toFixed(8)),
                },
              });
            } else {
              errorCount++;
              resolve('error');
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

          res.end(JSON.stringify(successObj));
        } else {
          const _balance = result;
          let _transactions = [];

          Promise.all(electrumServers.map((electrumServerData, index) => {
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
          }))
          .then(result => {
            const successObj = {
              msg: 'success',
              result: {
                balance: _balance,
                transactions: _transactions,
              }
            };

            res.end(JSON.stringify(successObj));
          });
        }
      });
    }
  });

  shepherd.kmdCalcInterest = (locktime, value) => { // value in sats
    const timestampDiff = Math.floor(Date.now() / 1000) - locktime - 777;
    const hoursPassed = Math.floor(timestampDiff / 3600);
    const minutesPassed = Math.floor((timestampDiff - (hoursPassed * 3600)) / 60);
    const secondsPassed = timestampDiff - (hoursPassed * 3600) - (minutesPassed * 60);
    let timestampDiffMinutes = timestampDiff / 60;
    let interest = 0;

    // calc interest
    if (timestampDiffMinutes >= 60) {
      if (timestampDiffMinutes > 365 * 24 * 60) {
        timestampDiffMinutes = 365 * 24 * 60;
      }
      timestampDiffMinutes -= 59;

      interest = ((Number(value) * 0.00000001) / 10512000) * timestampDiffMinutes;
    }

    return interest;
  }

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
              if (Number(utxoList[i].value) * 0.00000001 >= 10) {
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
                      interestTotal += shepherd.kmdCalcInterest(decodedTx.format.locktime, _utxoItem.value);
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
                    balance: Number((0.00000001 * json.confirmed).toFixed(8)),
                    unconfirmed: Number((0.00000001 * json.unconfirmed).toFixed(8)),
                    unconfirmedSats: json.unconfirmed,
                    balanceSats: json.confirmed,
                    interest: Number(interestTotal.toFixed(8)),
                    interestSats: Math.floor(interestTotal * 100000000),
                    total: interestTotal > 0 ? Number((0.00000001 * json.confirmed + interestTotal).toFixed(8)) : 0,
                    totalSats: interestTotal > 0 ?json.confirmed + Math.floor(interestTotal * 100000000) : 0,
                  },
                };

                res.end(JSON.stringify(successObj));
              });
            } else {
              const successObj = {
                msg: 'success',
                result: {
                  balance: Number((0.00000001 * json.confirmed).toFixed(8)),
                  unconfirmed: Number((0.00000001 * json.unconfirmed).toFixed(8)),
                  unconfirmedSats: json.unconfirmed,
                  balanceSats: json.confirmed,
                  interest: 0,
                  interestSats: 0,
                  total: 0,
                  totalSats: 0,
                },
              };

              res.end(JSON.stringify(successObj));
            }
          } else {
            const successObj = {
              msg: 'success',
              result: {
                balance: Number((0.00000001 * json.confirmed).toFixed(8)),
                unconfirmed: Number((0.00000001 * json.unconfirmed).toFixed(8)),
                unconfirmedSats: json.unconfirmed,
                balanceSats: json.confirmed,
                interest: 0,
                interestSats: 0,
                total: 0,
                totalSats: 0,
              },
            };

            res.end(JSON.stringify(successObj));
          }
        });
      } else {
        const successObj = {
          msg: 'error',
          result: json,
        };

        res.end(JSON.stringify(successObj));
      }
    });
  });

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

          ecl.blockchainNumblocksSubscribe()
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
                resolve({ code: -777, result: 'no valid utxo' });
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

                        if (Number(_utxoItem.value) * 0.00000001 >= 10 &&
                            decodedTx.format.locktime > 0) {
                          interest = shepherd.kmdCalcInterest(decodedTx.format.locktime, _utxoItem.value);
                        }

                        let _resolveObj = {
                          txid: _utxoItem['tx_hash'],
                          vout: _utxoItem['tx_pos'],
                          address,
                          amount: Number(_utxoItem.value) * 0.00000001,
                          amountSats: _utxoItem.value,
                          locktime: decodedTx.format.locktime,
                          interest: Number(interest.toFixed(8)),
                          interestSats: Math.floor(interest * 100000000),
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
    ).then((json) => {
      const successObj = {
        msg: json.code ? 'error' : 'success',
        result: json,
      };

      res.end(JSON.stringify(successObj));
    });
  });

  return shepherd;
};