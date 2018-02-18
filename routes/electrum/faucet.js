const config = require('../../config');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const Promise = require('bluebird');
const async = require('async');
const bitcoin = require('bitcoinjs-lib');
const coinSelect = require('coinselect');

const getRandomIntInclusive = (min, max) => {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min; // the maximum is inclusive and the minimum is inclusive
}

module.exports = (shepherd) => {
  shepherd.checkFaucetOutAddress = (address) => {
    const faucetFundedList = fs.readFileSync('faucetFundedList.log', 'utf-8');

    if (faucetFundedList.indexOf(address) === -1) {
      try {
        const _b58check = bitcoin.address.fromBase58Check(address);

        if (_b58check.version === config.komodoParams.pubKeyHash) {
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
  };

  shepherd.get('/faucet', (req, res, next) => {
    const addressCheck = shepherd.checkFaucetOutAddress(req.query.address);

    if (addressCheck === true) {
      const network = 'komodo';
      const coin = 'beer';// req.query.coin;
      const outputAddress = req.query.address;
      const randomServer = config.electrumServers[coin].serverList[getRandomIntInclusive(0, 1)].split(':');
      const ecl = new shepherd.electrumJSCore(randomServer[1], randomServer[0], 'tcp');

      const keyPair = bitcoin.ECPair.fromWIF(config.faucet.coins[coin], config.komodoParams);
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

          let targets = [{
            address: outputAddress,
            value: Math.floor((config.faucet.outSize * 100000000) + (config.faucet.fee * 100000000)),
          }];

          // console.log('targets');
          // console.log(targets);

          let { fee, inputs, outputs } = coinSelect(_formattedUtxoList, targets, 0);

          // console.log('coinselect');
          // console.log('fee');
          // console.log(fee);
          // console.log('inputs');
          // console.log(inputs);
          // console.log('outputs');
          // console.log(outputs);

          let _vinSum = 0;
          let _voutSum = 0;

          for (let i = 0; i < inputs.length; i++) {
            _vinSum += inputs[i].value;
          }

          for (let i = 0; i < outputs.length; i++) {
            _voutSum += outputs[i].value;
          }

          // console.log(`vin sum ${_vinSum}`);
          // console.log(`vout sum ${_voutSum}`);
          // console.log(`fee ${_vinSum - _voutSum}`);

          if ((_vinSum - _voutSum) === 0) {
            const tx = new bitcoin.TransactionBuilder(config.komodoParams);

            for (let i = 0; i < inputs.length; i++) {
              tx.addInput(inputs[i].txid, inputs[i].vout);
            }

            tx.addOutput(outputAddress, Number(outputs[0].value - (config.faucet.fee * 100000000)));

            if (outputs[1].value > 1000) {
              tx.addOutput(keys.pub, Number(outputs[1].value));
            }

            for (let i = 0; i < inputs.length; i++) {
              tx.sign(i, keyPair);
            }

            const rawtx = tx.build().toHex();

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

                res.end(JSON.stringify(successObj));
              } else {
                if (txid &&
                    txid.length === 64) {
                  if (txid.indexOf('bad-txns-in-belowout') > -1) {
                    const successObj = {
                      msg: 'error',
                      result: 'Bad transaction inputs spent',
                    };

                    res.end(JSON.stringify(successObj));
                  } else {
                    const successObj = {
                      msg: 'success',
                      result: txid,
                    };

                    res.end(JSON.stringify(successObj));

                    try {
                      fs.appendFileSync('faucetFundedList.log', `${outputAddress}\n`);
                      console.log(`new faucet address added ${outputAddress}`);
                    } catch (err) {
                      try {
                        fs.appendFileSync('faucetFundedList.log', `${outputAddress}\n`);
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

                    res.end(JSON.stringify(successObj));
                  } else {
                    const successObj = {
                      msg: 'error',
                      result: 'Can\'t broadcast transaction',
                    };

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

            res.end(JSON.stringify(successObj));
          }
        } else {
          ecl.close();

          const successObj = {
            msg: 'error',
            result: 'no valid utxo',
          };

          res.end(JSON.stringify(successObj));
        }
      });
    } else if (!addressCheck || addressCheck === -777) {
      const successObj = {
        msg: 'error',
        result: 'Invalid pub address',
      };

      res.end(JSON.stringify(successObj));
    } else if (addressCheck === 777) {
      const successObj = {
        msg: 'error',
        result: 'You had enough already. Go home.',
      };

      res.end(JSON.stringify(successObj));
    }
  });

  return shepherd;
};