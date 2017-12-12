const remoteExplorers = require('../../config').explorers;
const _electrumServers = require('../../config').electrumServers;
const komodoParams = require('../../config').komodoParams;
// const txDecoder = require('./txDecoder');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');

const OVERVIEW_UPDATE_INTERVAL = 30000;
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

const sortByDate = (data, sortKey) => {
  return data.sort(function(b, a) {
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
      result: {
        coins: remoteExplorers,
      },
    }));
  });

  shepherd.get('/explorer/overview', (req, res, next) => {
    res.end(JSON.stringify({
      msg: 'success',
      result: shepherd.explorer.overview,
    }));
  });

  shepherd.getOverview = () => {
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
                result: 'unable to get lasttx'
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
            console.log(overviewFile.result.length);

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

    /*const overviewFileLocation = path.join(__dirname, '../../overview.json');
    const overviewFile = fs.readJsonSync(overviewFileLocation, { throws: false });
    const resSizeLimit = 1000;
    let items = [];
    console.log(overviewFile.result.length);

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

    console.log('explorer overview updated');*/
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
          const _server = electrumServerData.serverList[0].split(':');
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
              const _server = electrumServerData.serverList[0].split(':');
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

  return shepherd;
};