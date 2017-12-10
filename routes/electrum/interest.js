const config = require('../../config');
const txDecoder = require('./txDecoder');

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min; // the maximum is inclusive and the minimum is inclusive
}

module.exports = (shepherd) => {
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
    const network = 'komodo';
    const randomServer = config.btcjsNetwork.komodo.serverList[getRandomIntInclusive(0, 1)].split(':');
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
                    const decodedTx = txDecoder(_rawtxJSON, config.btcjsNetwork.komodo);

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

  return shepherd;
}