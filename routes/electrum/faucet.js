const config = require('../../config');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const async = require('async');
const bitcoin = require('bitcoinjs-lib');
const coinSelect = require('coinselect');
const { checkTimestamp } = require('agama-wallet-lib/src/time');
const {
  toSats,
  fromSats,
} = require('agama-wallet-lib/src/utils');

let minRemaining = 0;

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min; // the maximum is inclusive and the minimum is inclusive
}

module.exports = (shepherd) => {
  shepherd.checkFaucetOutAddress = (coin, address) => {
    let faucetFundedList;

    if (!config.faucet[coin]) {
      return 777;
    }

    try {
      faucetFundedList = fs.readFileSync(`faucetFundedList-${coin}.log`, 'utf-8');
    } catch (e) {
      faucetFundedList = '';
    }

    if (config.faucet[coin].resetTimeout) {
      const faucetFundedListItems = faucetFundedList.split('\n');
      let addressNotFound = true;

      for (let i = 0; i < faucetFundedListItems.length; i++) {
        if (faucetFundedListItems[i].indexOf(address + ':') > -1) {
          const _timestamp = faucetFundedListItems[i].substr(faucetFundedListItems[i].indexOf(':') + 1, faucetFundedListItems[i].length);
          const seconds = checkTimestamp(_timestamp);

          addressNotFound = false;

          minRemaining = Math.floor((config.faucet[coin].resetTimeout - seconds) / 60);

          if (seconds < config.faucet[coin].resetTimeout) {
            return 777;
          } else {
            faucetFundedListItems.splice(i, 1);
            fs.writeFileSync(`faucetFundedList-${coin}.log`, faucetFundedListItems.join('\n'));

            try {
              const _b58check = bitcoin.address.fromBase58Check(address);

              if (_b58check.version === config.komodoParams.pubKeyHash ||
                  _b58check.version === config.komodoParams.scriptHash) {
                return true;
              } else {
                return false;
              }
            } catch(e) {
              return -777;
            }
          }
        }
      }

      if (addressNotFound) {
        try {
          const _b58check = bitcoin.address.fromBase58Check(address);

          if (_b58check.version === config.komodoParams.pubKeyHash ||
              _b58check.version === config.komodoParams.scriptHash) {
            return true;
          } else {
            return false;
          }
        } catch(e) {
          return -777;
        }
      }
    } else {
      if (faucetFundedList.indexOf(address) === -1) {
        try {
          const _b58check = bitcoin.address.fromBase58Check(address);

          if (_b58check.version === config.komodoParams.pubKeyHash ||
              _b58check.version === config.komodoParams.scriptHash) {
            return true;
          } else {
            return false;
          }
        } catch(e) {
          return -777;
        }
      } else {
        return 777;
      }
    }
  };

  shepherd.get('/faucet', (req, res, next) => {
    // ref: https://codeforgeek.com/2016/03/google-recaptcha-node-js-tutorial/
    if (req.query['grecaptcha'] === undefined ||
        req.query['grecaptcha'] === '' ||
        req.query['grecaptcha'] === null) {
      const successObj = {
        msg: 'error',
        result: 'Failed captcha verification',
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(successObj));
    } else {
      // Put your secret key here.
      const secretKey = config.recaptchaKey;
      const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.query['grecaptcha']}&remoteip=${req.connection.remoteAddress}`;
      request(verificationUrl, (error, response, body) => {
        body = JSON.parse(body);

        if (body.success !== undefined &&
            !body.success) {
          const successObj = {
            msg: 'error',
            result: 'Failed captcha verification',
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(successObj));
        } else {
          const coin = req.query.coin || 'beer';
          const addressCheck = shepherd.checkFaucetOutAddress(coin, req.query.address);

          if (addressCheck === true) {
            const network = 'komodo';
            const outputAddress = req.query.address;
            const randomServer = config.electrumServers[coin].serverList[getRandomIntInclusive(0, 1)].split(':');
            const ecl = new shepherd.electrumJSCore(randomServer[1], randomServer[0], 'tcp');

            const keyPair = bitcoin.ECPair.fromWIF(config.faucet[coin].wif, config.komodoParams);
            const keys = {
              priv: keyPair.toWIF(),
              pub: keyPair.getAddress(),
            };

            ecl.connect();
            ecl.blockchainAddressListunspent(keys.pub)
            .then((json) => {
              if (json &&
                  json.length) {
                const _utxo = json;
                let _formattedUtxoList = [];

                for (let i = 0; i < _utxo.length; i++) {
                  _formattedUtxoList.push({
                    txid: _utxo[i]['tx_hash'],
                    vout: _utxo[i]['tx_pos'],
                    value: _utxo[i]['value'],
                  });
                }

                let targets = [];

                if (typeof config.faucet[coin].outSize === 'object') {
                  const _outSizes = config.faucet[coin].outSize;

                  for (let i = 0; i < _outSizes.length; i++) {
                    if (i === _outSizes.length - 1) {
                      targets.push({
                        address: outputAddress,
                        value: Math.floor(toSats(_outSizes[i]) + toSats(config.faucet[coin].fee)),
                      });
                    } else {
                      targets.push({
                        address: outputAddress,
                        value: Math.floor(toSats(_outSizes[i])),
                      });
                    }
                  }
                } else {
                  targets = [{
                    address: outputAddress,
                    value: Math.floor(toSats(config.faucet[coin].outSize) + toSats(config.faucet[coin].fee)),
                  }];
                }

                /*console.log('targets');
                console.log(targets);*/

                let {
                  fee,
                  inputs,
                  outputs,
                } = coinSelect(_formattedUtxoList, targets, 0);

                /*console.log('coinselect');
                console.log('fee');
                console.log(fee);
                console.log('inputs');
                console.log(inputs);
                console.log('outputs');
                console.log(outputs);*/

                let _vinSum = 0;
                let _voutSum = 0;

                for (let i = 0; i < inputs.length; i++) {
                  _vinSum += inputs[i].value;
                }

                for (let i = 0; i < outputs.length; i++) {
                  _voutSum += outputs[i].value;
                }

                /*console.log(`vin sum ${_vinSum}`);
                console.log(`vout sum ${_voutSum}`);
                console.log(`fee ${_vinSum - _voutSum}`);*/

                if ((_vinSum - _voutSum) === 0) {
                  const tx = new bitcoin.TransactionBuilder(config.komodoParams);

                  for (let i = 0; i < inputs.length; i++) {
                    tx.addInput(inputs[i].txid, inputs[i].vout);
                  }

                  if (typeof config.faucet[coin].outSize === 'object') {
                    for (i = 0; i < outputs.length - 1; i++) {
                      if (i === outputs.length - 2) {
                        tx.addOutput(outputAddress, Number(outputs[i].value - toSats(config.faucet[coin].fee)));
                      } else {
                        tx.addOutput(outputAddress, Number(outputs[i].value));
                      }
                    }

                    if (outputs[typeof config.faucet[coin].outSize === 'object' ? outputs.length - 1 : 1].value > 1000) {
                      tx.addOutput(keys.pub, Number(outputs[typeof config.faucet[coin].outSize === 'object' ? outputs.length - 1 : 1].value));
                    }
                  } else {
                    tx.addOutput(outputAddress, Number(outputs[0].value - toSats(config.faucet[coin].fee)));

                    if (outputs[1].value > 1000) {
                      tx.addOutput(keys.pub, Number(outputs[1].value));
                    }
                  }

                  for (let i = 0; i < inputs.length; i++) {
                    tx.sign(i, keyPair);
                  }

                  const rawtx = tx.build().toHex();

                  // console.log(tx.build());

                  // console.log('buildSignedTx signed tx hex');
                  // console.log(rawtx);

                  ecl.blockchainTransactionBroadcast(rawtx)
                  .then((txid) => {
                    ecl.close();

                    // console.log(txid);

                    if (txid &&
                        txid.indexOf('bad-txns-inputs-spent') > -1) {
                      const successObj = {
                        msg: 'error',
                        result: 'Bad transaction inputs spent',
                      };

                      res.set({ 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(successObj));
                    } else {
                      if (txid &&
                          txid.length === 64) {
                        if (txid.indexOf('bad-txns-in-belowout') > -1) {
                          const successObj = {
                            msg: 'error',
                            result: 'Bad transaction inputs spent',
                          };

                          res.set({ 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(successObj));
                        } else {
                          const successObj = {
                            msg: 'success',
                            result: txid,
                          };

                          res.set({ 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(successObj));

                          try {
                            fs.appendFileSync(`faucetFundedList-${coin}.log`, `${outputAddress + (config.faucet[coin].resetTimeout ? (':' + Date.now()) : '')}\n`);
                            console.log(`new faucet address added ${outputAddress}`);
                          } catch (err) {
                            try {
                              fs.appendFileSync(`faucetFundedList-${coin}.log`, `${outputAddress + (config.faucet[coin].resetTimeout ? (':' + Date.now()) : '')}\n`);
                              console.log(`new faucet address added ${outputAddress}`);
                            } catch (err) {
                              console.log('fubar!');
                            }
                          }
                        }
                      } else {
                        if (txid &&
                            txid.indexOf('bad-txns-in-belowout') > -1) {
                          const successObj = {
                            msg: 'error',
                            result: 'Bad transaction inputs spent',
                          };

                          res.set({ 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(successObj));
                        } else {
                          const successObj = {
                            msg: 'error',
                            result: 'Can\'t broadcast transaction',
                          };

                          res.set({ 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(successObj));
                        }
                      }
                    }
                  });
                } else {
                  ecl.close();

                  const successObj = {
                    msg: 'error',
                    result: 'tx error',
                  };

                  res.set({ 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(successObj));
                }
              } else {
                ecl.close();

                const successObj = {
                  msg: 'error',
                  result: 'no valid utxo',
                };

                res.set({ 'Content-Type': 'application/json' });
                res.end(JSON.stringify(successObj));
              }
            });
          } else if (!addressCheck || addressCheck === -777) {
            const successObj = {
              msg: 'error',
              result: 'Invalid pub address',
            };

            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(successObj));
          } else if (addressCheck === 777) {
            const successObj = {
              msg: 'error',
              result: 'You had enough already. ' + (minRemaining > 0 ? `Come back in ${minRemaining} min(s)` : 'Go home.'),
            };

            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(successObj));
          }
        }
      });
    }
  });

  return shepherd;
};