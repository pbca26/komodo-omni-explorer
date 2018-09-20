const config = require('../config');
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
  getRandomIntInclusive,
} = require('agama-wallet-lib/src/utils');
const electrumJSCore = require('./electrumjs.core.js');
const transactionBuilder = require('agama-wallet-lib/src/transaction-builder');
const transactionDecoder = require('agama-wallet-lib/src/transaction-decoder');

const KV_HISTORY_UPDATE_INTERVAL = 10000; // every 10s

const KV_OPRETURN_MAX_SIZE_BYTES = 8192;

const KV_VERSION = {
  current: '01',
  minSupported: '01',
};

// fixed size
const KV_HEADER_SIZE = [
  2, // kv version
  1, // encrypted
  64 // tag
];

// variable size
const KV_CONTENT_HEADER_SIZE = [
  3, // content version
  64, // previous txid
  128, // title
];

const KV_MAX_CONTENT_SIZE = 4096;

module.exports = (api) => {
  api.kv = [];

  api.kvEncode = (data) => {
    let kvBuf = [
      Buffer.alloc(KV_HEADER_SIZE[0]),
      Buffer.alloc(KV_HEADER_SIZE[1]),
      Buffer.alloc(KV_HEADER_SIZE[2]),
      Buffer.alloc(KV_CONTENT_HEADER_SIZE[0]),
      Buffer.alloc(KV_CONTENT_HEADER_SIZE[1]),
      Buffer.alloc(KV_CONTENT_HEADER_SIZE[2]),
      Buffer.alloc(data.content.body.length)
    ];

    kvBuf[0].write(KV_VERSION.current);
    kvBuf[1].write('0');
    kvBuf[2].write(data.tag);
    kvBuf[3].write(data.content.version.toString() || '1');
    kvBuf[4].write(data.content.parent ? data.content.parent : '0000000000000000000000000000000000000000000000000000000000000000');
    kvBuf[5].write(data.content.title);
    kvBuf[6].write(data.content.body);

    api.log('kv data');
    api.log(data.content.body.length, 'kv');
    api.log(data.content.body, 'kv');
    api.log(kvBuf[6], 'kv');
    api.log(kvBuf[6].toString(), 'kv');

    api.log('kv buf', kvBuf.toString());

    const out = Buffer.concat(kvBuf);

    api.log('concat kv buf');
    api.log(out, 'kv');
    api.log(out.toString('hex'), 'kv');
    api.log(out.toString('hex').length, 'kv');
    api.log(`kv max allowed size ${KV_MAX_CONTENT_SIZE + KV_CONTENT_HEADER_SIZE[0] + KV_CONTENT_HEADER_SIZE[1] + KV_CONTENT_HEADER_SIZE[2]}`);

    if (out.toString('hex').length > KV_MAX_CONTENT_SIZE + KV_CONTENT_HEADER_SIZE[0] + KV_CONTENT_HEADER_SIZE[1] + KV_CONTENT_HEADER_SIZE[2]) {
      return -1;
    }

    return out.toString('hex');
  }

  api.kvDecode = (hex, fromTx) => {
    api.log(Buffer.from(hex, 'hex').toString(), 'kv');

    if (fromTx) {
      hex = Buffer.from(hex, 'hex').toString();
    }

    const _kvBuf = Buffer.from(hex, 'hex');

    const kvBuf = [
      _kvBuf.slice(0, KV_HEADER_SIZE[0]),
      _kvBuf.slice(KV_HEADER_SIZE[0], KV_HEADER_SIZE[0] + KV_HEADER_SIZE[1]),
      _kvBuf.slice(KV_HEADER_SIZE[0] + KV_HEADER_SIZE[1], KV_HEADER_SIZE[0] + KV_HEADER_SIZE[1] + KV_HEADER_SIZE[2]),
      _kvBuf.slice(KV_HEADER_SIZE[0] + KV_HEADER_SIZE[1] + KV_HEADER_SIZE[2], KV_HEADER_SIZE[0] + KV_HEADER_SIZE[1] + KV_HEADER_SIZE[2] + KV_CONTENT_HEADER_SIZE[0]),
      _kvBuf.slice(KV_HEADER_SIZE[0] + KV_HEADER_SIZE[1] + KV_HEADER_SIZE[2] + KV_CONTENT_HEADER_SIZE[0], KV_HEADER_SIZE[0] + KV_HEADER_SIZE[1] + KV_HEADER_SIZE[2] + KV_CONTENT_HEADER_SIZE[0] + KV_CONTENT_HEADER_SIZE[1]),
      _kvBuf.slice(KV_HEADER_SIZE[0] + KV_HEADER_SIZE[1] + KV_HEADER_SIZE[2] + KV_CONTENT_HEADER_SIZE[0] + KV_CONTENT_HEADER_SIZE[1], KV_HEADER_SIZE[0] + KV_HEADER_SIZE[1] + KV_HEADER_SIZE[2] + KV_CONTENT_HEADER_SIZE[0] + KV_CONTENT_HEADER_SIZE[1] + KV_CONTENT_HEADER_SIZE[2]),
      _kvBuf.slice(KV_HEADER_SIZE[0] + KV_HEADER_SIZE[1] + KV_HEADER_SIZE[2] + KV_CONTENT_HEADER_SIZE[0] + KV_CONTENT_HEADER_SIZE[1] + KV_CONTENT_HEADER_SIZE[2], _kvBuf.length)
    ];

    api.log('kv buffer', 'kv');
    api.log(kvBuf, 'kv');

    for (let i = 0; i < kvBuf.length; i++) {
      api.log(`kv buffer ${i}, ${kvBuf[i].length} bytes`, 'kv');
      api.log(`kv buffer -> string ${kvBuf[i].length} bytes`, 'kv');
      api.log(kvBuf[i].toString(), 'kv');
    }

    const out = {
      version: kvBuf[0].toString().replace(/\0/g, ''),
      encrypted: kvBuf[1].toString().replace(/\0/g, ''),
      tag: kvBuf[2].toString().replace(/\0/g, ''),
      content: {
        version: kvBuf[3].toString().replace(/\0/g, ''),
        parent: kvBuf[4].toString().replace(/\0/g, ''),
        title: kvBuf[5].toString().replace(/\0/g, ''),
        body: kvBuf[6].toString().replace(/\0/g, ''),
      },
    };

    if (out.version &&
        out.encrypted &&
        out.content.version) {
      return out;
    } else {
      return false;
    }
  }

  api.post('/kv/send', (req, res, next) => {
    if (!req.body.content) {
      const retObj = {
        msg: 'error',
        result: 'content cannot be an empty string',
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(retObj));
    } else {
      if (req.body.content.length > config.kv.contentLimit ||
          (req.body.title && req.body.title > KV_CONTENT_HEADER_SIZE[2])) {
        console.log(`title len ${req.body.title.length} vs max ${KV_CONTENT_HEADER_SIZE[2]}`);
        console.log(`content len ${req.body.content.length} vs max ${config.kv.contentLimit}`);

        const retObj = {
          msg: 'error',
          result: `Please verify your data. Content cannot exceed max size of ${config.kv.contentLimit} chars. Name cannot exceed max size of ${KV_CONTENT_HEADER_SIZE[2]} chars`,
        };

        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(retObj));
      } else {
        const _content = req.body.content;
        const _kvData = {
          tag: 'trollbox',
          content: {
            title: req.body.title || 'Anonymous troll',
            version: 1,
            body: _content,
          },
        };
        const _encodedContent = api.kvEncode(_kvData);

        api.log('kvEncode', _encodedContent);
        api.log('kvDecode', api.kvDecode(_encodedContent));

        if (_encodedContent) {
          const coin = 'kv';
          const randomServer = config.electrumServers[coin].serverList[getRandomIntInclusive(0, 1)].split(':');
          const ecl = new electrumJSCore(randomServer[1], randomServer[0], 'tcp');

          const keyPair = bitcoin.ECPair.fromWIF(config.kv.wif, config.komodoParams);
          const keys = {
            priv: keyPair.toWIF(),
            pub: keyPair.getAddress(),
          };
          const outputAddress = keys.pub;

          ecl.connect();
          ecl.blockchainAddressListunspent(keys.pub)
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

              const _data = transactionBuilder.data(
                config.komodoParams,
                toSats(0.0001),
                toSats(0.0001),
                keys.pub,
                keys.pub,
                _formattedUtxoList
              );

              api.log('tx data');
              api.log('buildSignedTx signed tx hex');

              api.log('send data', _data);

              const _tx = transactionBuilder.transaction(
                keys.pub,
                keys.pub,
                keys.priv,
                config.komodoParams,
                _data.inputs,
                _data.change,
                _data.value,
                _encodedContent
              );

              api.log('send data rawtx', _tx);

              ecl.blockchainTransactionBroadcast(_tx)
              .then((txid) => {
                ecl.close();

                api.log(`txid ${txid}`);

                if (txid &&
                    txid.indexOf('bad-txns-inputs-spent') > -1) {
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
                    }
                  } else {
                    if (txid &&
                        txid.indexOf('bad-txns-in-belowout') > -1) {
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
              ecl.close();

              const retObj = {
                msg: 'error',
                result: 'no valid utxo',
              };

              res.set({ 'Content-Type': 'application/json' });
              res.end(JSON.stringify(retObj));
            }
          });
        } else {
          const retObj = {
            msg: 'error',
            result: 'Unable to encode kv',
          };

          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        }
      }
    }
  });

  api.kvLoop = () => {
    const network = 'kv';
    const keyPair = bitcoin.ECPair.fromWIF(config.kv.wif, config.komodoParams);
    const keys = {
      priv: keyPair.toWIF(),
      pub: keyPair.getAddress(),
    };
    const randomServer = config.electrumServers[network].serverList[getRandomIntInclusive(0, 1)].split(':');
    const ecl = new electrumJSCore(randomServer[1], randomServer[0], 'tcp');
    const _address = keys.pub;
    const MAX_TX = 300;

    const _kvLoop = () => {
      api.log('kv history');

      ecl.connect();

      ecl.blockchainHeadersSubscribe()
      .then((currentHeight) => {
        currentHeight = currentHeight.block_height;

        if (currentHeight &&
            Number(currentHeight) > 0) {
          ecl.blockchainAddressGetHistory(_address)
          .then((json) => {
            if (json &&
                json.length) {
              let _rawtx = [];

              json = api.sortTransactions(json);
              json = json.length > MAX_TX ? json.slice(0, MAX_TX) : json;

              api.log(json.length);

              async.eachOfSeries(json, (transaction, ind, callback) => {
                ecl.blockchainBlockGetHeader(transaction.height)
                .then((blockInfo) => {
                  if (blockInfo &&
                      blockInfo.timestamp) {
                    ecl.blockchainTransactionGet(transaction.tx_hash)
                    .then((_rawtxJSON) => {
                      api.log('electrum gettransaction ==>');
                      api.log((ind + ' | ' + (_rawtxJSON.length - 1)));
                      // api.log(_rawtxJSON);

                      // decode tx
                      const _network = config.komodoParams;
                      const decodedTx = transactionDecoder(_rawtxJSON, _network);

                      let txInputs = [];
                      let opreturn = false;

                      api.log(`decodedtx network ${network}`);

                      api.log('decodedtx =>');
                      // api.log(decodedTx.outputs);

                      if (decodedTx &&
                          decodedTx.outputs &&
                          decodedTx.outputs.length) {
                        for (let i = 0; i < decodedTx.outputs.length; i++) {
                          if (decodedTx.outputs[i].scriptPubKey.type === 'nulldata') {
                            opreturn = {
                              kvHex: decodedTx.outputs[i].scriptPubKey.hex,
                              kvAsm: decodedTx.outputs[i].scriptPubKey.asm,
                              kvDecoded: api.kvDecode(decodedTx.outputs[i].scriptPubKey.asm.substr(10, decodedTx.outputs[i].scriptPubKey.asm.length), true),
                            };
                          }
                        }
                      }

                      if (opreturn &&
                          opreturn.kvDecoded &&
                          Number(opreturn.kvDecoded.content.version)) {
                        const _parsedTx = {
                          timestamp: Number(transaction.height) === 0 || Number(transaction.height) === -1 ? Math.floor(Date.now() / 1000) : blockInfo.timestamp,
                          title: opreturn.kvDecoded.content.title,
                          content: opreturn.kvDecoded.content.body,
                          txid: transaction.tx_hash,
                        };

                        _rawtx.push(_parsedTx);
                      }

                      if (ind === json.length - 1) {
                        ecl.close();

                        api.kv = _rawtx;
                      } else {
                        callback();
                      }
                    });
                  }
                });
              });
            } else {
              ecl.close();

              api.kv = [];
            }
          });
        } else {
          api.kv = 'can\'t get current height';
        }
      });
    };

    _kvLoop();
    setInterval(() => {
      _kvLoop();
    }, KV_HISTORY_UPDATE_INTERVAL);
  };

  api.get('/kv/history', (req, res, next) => {
    const retObj = {
      msg: 'success',
      result: api.kv,
    };

    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify(retObj));
  });

  api.sortTransactions = (transactions, sortBy) => {
    return transactions.sort((b, a) => {
      if (a[sortBy ? sortBy : 'height'] < b[sortBy ? sortBy : 'height']) {
        return -1;
      }

      if (a[sortBy ? sortBy : 'height'] > b[sortBy ? sortBy : 'height']) {
        return 1;
      }

      return 0;
    });
  }

  return api;
};