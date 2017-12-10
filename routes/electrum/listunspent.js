const config = require('../../config');
const txDecoder = require('./txDecoder');

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min; // the maximum is inclusive and the minimum is inclusive
}

module.exports = (shepherd) => {
  shepherd.get('/listunspent', (req, res, next) => {
    if (shepherd.checkServerData(req.query.port, req.query.ip, res)) {
      const ecl = new shepherd.electrumJSCore(req.query.port, req.query.ip, 'tcp');

      ecl.connect();
      ecl.blockchainAddressListunspent(req.query.address)
      .then((json) => {
        ecl.close();

        const successObj = {
          msg: json.code ? 'error' : 'success',
          result: json,
        };

        res.end(JSON.stringify(successObj));
      });
    }
  });

  shepherd.listunspent = (ecl, address, network, full, verify, txid) => {
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
                      const decodedTx = txDecoder(_rawtxJSON, config.btcjsNetwork.komodo);

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
                    if (txid) {
                      promiseResult = promiseResult.filter(res => res.txid === txid);
                    }

                    resolve(promiseResult);
                  } else {
                    resolve({ code: -777, result: 'decode error' });
                  }
                });
              }
            } else {
              resolve({ code: -777, result: 'cant get current height' });
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
    const randomServer = config.btcjsNetwork.komodo.serverList[getRandomIntInclusive(0, 1)].split(':');
    const ecl = new shepherd.electrumJSCore(randomServer[1], randomServer[0], 'tcp');

    shepherd.listunspent(
      ecl,
      req.query.address,
      network,
      true,
      req.query.verify,
      req.query.txid
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