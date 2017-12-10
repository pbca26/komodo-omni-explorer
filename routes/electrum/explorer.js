const remoteExplorers = require('../../config').explorers;
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');

const OVERVIEW_UPDATE_INTERVAL = 30000;
let remoteExplorersArray = [];

for (let key in remoteExplorers) {
  remoteExplorersArray.push(key);
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
        console.log(`explorer ${coin} overview`);

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

  return shepherd;
};