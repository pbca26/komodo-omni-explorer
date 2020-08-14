const config = require('../config');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const async = require('async');
const bitcoin = require('bitgo-utxo-lib');
const coinSelect = require('coinselect');
const { checkTimestamp } = require('agama-wallet-lib/src/time');
const {
  toSats,
  fromSats,
  getRandomIntInclusive,
} = require('agama-wallet-lib/src/utils');
const electrumJSCore = require('./electrumjs.core.js');
const {
  pubToElectrumScriptHashHex,
  addressVersionCheck,
} = require('agama-wallet-lib/src/keys');
const btcnetworks = require('agama-wallet-lib/src/bitcoinjs-networks');

let minRemaining = 0;

module.exports = (api) => {
  api.checkFaucetOutAddress = (coin, address) => {
    let faucetFundedList;
    const addressCheck = addressVersionCheck(btcnetworks.kmd, address);
    
    if (!config.faucet[coin]) {
      return 777;
    }

    try {
      faucetFundedList = fs.readFileSync(`faucetFundedList-${coin}.log`, 'utf-8');
    } catch (e) {
      fs.writeFileSync(`faucetFundedList-${coin}.log`, '');
      faucetFundedList = '';
    }

    if (config.faucet[coin].resetTimeout && (!config.faucet[coin].hasOwnProperty('freeLeechFrom') || (config.faucet[coin].hasOwnProperty('freeLeechFrom') && Number(config.faucet[coin].freeLeechFrom) * 1000 < Date.now() && Number(config.faucet[coin].freeLeechTo) * 1000 > Date.now()))) {
      const faucetFundedListItems = faucetFundedList.split('\n');
      let addressNotFound = true;

      for (let i = 0; i < faucetFundedListItems.length; i++) {        
        if (faucetFundedListItems[i].indexOf(address + ':') > -1 ||
            faucetFundedListItems[i].indexOf(address) > -1) {
          const _timestamp = config.faucet[coin].allowedTimesToRepeat ? faucetFundedList.substr(faucetFundedList.lastIndexOf(':') + 1, faucetFundedList.lastIndexOf(':') + 32) : faucetFundedListItems[i].substr(faucetFundedListItems[i].indexOf(':') + 1, faucetFundedListItems[i].length);
          const seconds = checkTimestamp(_timestamp) || 77777777;

          api.log('faucet allowed to repeat: ' + config.faucet[coin].allowedTimesToRepeat);
          api.log('faucet address repeated match: ' + faucetFundedList.match(RegExp(address, 'gi')));
          api.log('faucet address repeated: ' + (faucetFundedList.match(RegExp(address, 'gi')) && faucetFundedList.match(RegExp(address, 'gi')).length));
          api.log('faucet seconds passed: ' + seconds);
          
          addressNotFound = false;

          if (config.faucet[coin].allowedTimesToRepeat &&
              faucetFundedList.match(RegExp(address, 'gi')) &&
              faucetFundedList.match(RegExp(address, 'gi')).length >= config.faucet[coin].allowedTimesToRepeat) {
            return 777;
          }

          minRemaining = Math.floor((config.faucet[coin].resetTimeout - seconds) / 60);

          if (seconds < config.faucet[coin].resetTimeout) {
            return 777;
          } else {
            if (!config.faucet[coin].allowedTimesToRepeat) {
              faucetFundedListItems.splice(i, 1);
              fs.writeFileSync(`faucetFundedList-${coin}.log`, faucetFundedListItems.join('\n'));
            }

            return addressCheck !== true ? false : true;
          }
        }
      }

      if (addressNotFound) {
        return addressCheck !== true ? false : true;
      }
    } else {
      if (config.faucet[coin].allowedTimesToRepeat) {
        api.log(`faucet allowed to repeat: ${config.faucet[coin].allowedTimesToRepeat}`);
        api.log(`faucet address repeated: ${faucetFundedList.match(RegExp(address, 'gi')).length}`);
      }

      if (faucetFundedList.indexOf(address) === -1 ||
          (config.faucet[coin].allowedTimesToRepeat && faucetFundedList.match(RegExp(address, 'gi')).length < config.faucet[coin].allowedTimesToRepeat)) {
        return addressCheck !== true ? false : true;
      } else {
        return 777;
      }
    }
  };

  api.get('/faucet', (req, res, next) => {
    // ref: https://codeforgeek.com/2016/03/google-recaptcha-node-js-tutorial/
    if (config.faucetCaptcha &&
        (req.query.grecaptcha === undefined ||
        req.query.grecaptcha === '' ||
        req.query.grecaptcha === null)) {
      const retObj = {
        msg: 'error',
        result: 'Failed captcha verification',
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(retObj));
    } else {
      const _faucet = () => {
        const coin = req.query.coin || 'beer';
        const addressCheck = api.checkFaucetOutAddress(coin, req.query.address);

        if (addressCheck === true) {
          (async function() {
            const network = 'komodo';
            const outputAddress = req.query.address;
            const randomServer = config.electrumServers[coin].serverList.length > 1 ? config.electrumServers[coin].serverList[getRandomIntInclusive(0, 1)].split(':') : config.electrumServers[coin].serverList[0].split(':');
            const ecl = await api.ecl.getServer(coin);
  
            const keyPair = bitcoin.ECPair.fromWIF(config.faucet[coin].wif, config.komodoParams);
            const keys = {
              priv: keyPair.toWIF(),
              pub: keyPair.getAddress(),
            };
            const _address = ecl.protocolVersion && Number(ecl.protocolVersion) >= 1.2 ? pubToElectrumScriptHashHex(keys.pub, config.komodoParams) : keys.pub;
                      
            ecl.blockchainAddressListunspent(_address)
            .then((json) => {
              if (json &&
                  json.length) {
                const _utxo = json;
                let _formattedUtxoList = [];

                for (let i = 0; i < _utxo.length; i++) {
                  _formattedUtxoList.push({
                    txid: _utxo[i].tx_hash,
                    vout: _utxo[i].tx_pos,
                    value: _utxo[i].value,
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

                api.log('targets');
                api.log(targets);

                let {
                  fee,
                  inputs,
                  outputs,
                } = coinSelect(_formattedUtxoList, targets, 0);

                api.log('coinselect');
                api.log('fee');
                api.log(fee);
                api.log('inputs');
                api.log(inputs);
                api.log('outputs');
                api.log(outputs);

                let _vinSum = 0;
                let _voutSum = 0;

                for (let i = 0; i < inputs.length; i++) {
                  _vinSum += inputs[i].value;
                }

                for (let i = 0; i < outputs.length; i++) {
                  _voutSum += outputs[i].value;
                }

                api.log(`vin sum ${_vinSum}`);
                api.log(`vout sum ${_voutSum}`);
                api.log(`fee ${_vinSum - _voutSum}`);

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

                  tx.setVersion(4);
                  
                  for (let i = 0; i < inputs.length; i++) {
                    tx.sign(i, keyPair, '', null, inputs[i].value);
                  }

                  const rawtx = tx.build().toHex();

                  api.log(tx.build());
                  api.log('buildSignedTx signed tx hex');
                  api.log(rawtx);

                  ecl.blockchainTransactionBroadcast(rawtx)
                  .then((txid) => {
                    api.log(txid);

                    if (JSON.stringify(txid) &&
                        JSON.stringify(txid).indexOf('bad-txns-inputs-spent') > -1) {
                      const retObj = {
                        msg: 'error',
                        result: 'Bad transaction inputs spent',
                      };

                      res.set({ 'Content-Type': 'application/json' });
                      res.end(JSON.stringify(retObj));
                    } else {
                      if (txid &&
                          txid.length === 64) {
                        if (txid.indexOf('bad-txns-in-belowout') > -1) {
                          const retObj = {
                            msg: 'error',
                            result: 'Bad transaction inputs spent',
                          };

                          res.set({ 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(retObj));
                        } else {
                          const retObj = {
                            msg: 'success',
                            result: txid,
                          };

                          res.set({ 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(retObj));

                          try {
                            fs.appendFileSync(`faucetFundedList-${coin}.log`, `${outputAddress + (config.faucet[coin].resetTimeout ? (':' + Date.now()) : '')}\n`);
                            api.log(`new faucet address added ${outputAddress}`);
                          } catch (err) {
                            try {
                              fs.appendFileSync(`faucetFundedList-${coin}.log`, `${outputAddress + (config.faucet[coin].resetTimeout ? (':' + Date.now()) : '')}\n`);
                              api.log(`new faucet address added ${outputAddress}`);
                            } catch (err) {
                              api.log('fubar!');
                            }
                          }
                        }
                      } else {
                        if (JSON.stringify(txid) &&
                            JSON.stringify(txid).indexOf('bad-txns-in-belowout') > -1) {
                          const retObj = {
                            msg: 'error',
                            result: 'Bad transaction inputs spent',
                          };

                          res.set({ 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(retObj));
                        } else {
                          const retObj = {
                            msg: 'error',
                            result: 'Can\'t broadcast transaction',
                          };

                          res.set({ 'Content-Type': 'application/json' });
                          res.end(JSON.stringify(retObj));
                        }
                      }
                    }
                  });
                } else {
                  const retObj = {
                    msg: 'error',
                    result: 'tx error',
                  };

                  res.set({ 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(retObj));
                }
              } else {
                const retObj = {
                  msg: 'error',
                  result: 'no valid utxo',
                };

                res.set({ 'Content-Type': 'application/json' });
                res.end(JSON.stringify(retObj));
              }
            });
          })();
        } else if (
          !addressCheck ||
          addressCheck === -777
        ) {
          const retObj = {
            msg: 'error',
            result: 'Invalid pub address',
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        } else if (addressCheck === 777) {
          const retObj = {
            msg: 'error',
            result: 'You had enough already. ' + (minRemaining > 0 ? `Come back in ${minRemaining} min(s)` : 'Go home.'),
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        }
      };

      if (config.captcha) {
        // put your secret key here
        const secretKey = config.recaptchaKey;
        const verificationUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.query['grecaptcha']}&remoteip=${req.connection.remoteAddress}`;
        request(verificationUrl, (error, response, body) => {
          body = JSON.parse(body);

          if (body.success !== undefined &&
              !body.success) {
            const retObj = {
              msg: 'error',
              result: 'Failed captcha verification',
            };

            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(retObj));
          } else {
            _faucet();
          }
        });
      } else {
        _faucet();
      }
    }
  });

  return api;
};