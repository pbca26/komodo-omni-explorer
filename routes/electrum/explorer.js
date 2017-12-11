const remoteExplorers = require('../../config').explorers;
const _electrumServers = require('../../config').electrumServers;
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
  }

  shepherd.get('/explorer/search', (req, res, next) => {
    const _searchTerm = req.query.term;

    if (_searchTerm.length === 64) {
      // txid redirect
    } else {
      // pub address
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
              resolve('error');
            }
          });
        });
      }))
      .then(result => {
        const successObj = {
          msg: 'success',
          result: result,
        };

        res.end(JSON.stringify(successObj));
      });
    }
  });

  return shepherd;
};