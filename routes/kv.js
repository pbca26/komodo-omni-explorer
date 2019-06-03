const config = require('../config');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const async = require('async');
const bitcoin = require('bitcoinjs-lib');
const {
  toSats,
  fromSats,
  getRandomIntInclusive,
} = require('agama-wallet-lib/src/utils');
const electrumJSCore = require('./electrumjs.core.js');
const transactionBuilder = require('agama-wallet-lib/src/transaction-builder');
const transactionDecoder = require('agama-wallet-lib/src/transaction-decoder');
const { pubToElectrumScriptHashHex } = require('agama-wallet-lib/src/keys');
const {
  parseBlock,
  electrumMerkleRoot,
} = require('agama-wallet-lib/src/block');

const KV_HISTORY_UPDATE_INTERVAL = 240000; // every 4 min

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
  api.kv = {
    txs: [],
    cache: {},
  };

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
        api.log(`title len ${req.body.title.length} vs max ${KV_CONTENT_HEADER_SIZE[2]}`);
        api.log(`content len ${req.body.content.length} vs max ${config.kv.contentLimit}`);

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
          const randomServer = config.electrumServers[coin].serverList.length > 1 ? config.electrumServers[coin].serverList[getRandomIntInclusive(0, 1)].split(':') : config.electrumServers[coin].serverList[0].split(':');
          const ecl = new electrumJSCore(randomServer[1], randomServer[0], 'tcp');

          const keyPair = bitcoin.ECPair.fromWIF(config.kv.wif, config.komodoParams);
          const keys = {
            priv: keyPair.toWIF(),
            pub: keyPair.getAddress(),
          };
          const outputAddress = keys.pub;

          ecl.connect();
          
          (async function() {
            const serverProtocolVersion = await api.getServerVersion(ecl);
            const _address = ecl.protocolVersion && Number(ecl.protocolVersion) >= 1.2 ? pubToElectrumScriptHashHex(keys.pub, config.komodoParams) : keys.pub;
            
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

                let _data = transactionBuilder.data(
                  config.komodoParams,
                  toSats(0.0001),
                  toSats(0.00008), // account for 1000 sats opreturn + a 1000 sats margin
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
                  { opreturn: _encodedContent }
                );

                api.log('send data rawtx', _tx);

                ecl.blockchainTransactionBroadcast(_tx)
                .then((txid) => {
                  ecl.close();

                  api.log(`txid ${JSON.stringify(txid)}`);

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

                        setTimeout(() => {
                          api.kvLoop();
                        }, 1000 * 3);
                        setTimeout(() => {
                          api.kvLoop();
                        }, 1000 * 10);
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
          })();
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

  api.kvLoop = (skipInterval) => {
    const network = 'kv';
    const keyPair = bitcoin.ECPair.fromWIF(config.kv.wif, config.komodoParams);
    const keys = {
      priv: keyPair.toWIF(),
      pub: keyPair.getAddress(),
    };
    const randomServer = config.electrumServers[network].serverList[getRandomIntInclusive(0, 1)].split(':');
    const ecl = new electrumJSCore(randomServer[1], randomServer[0], 'tcp');
    const MAX_TX = 300;

    const _kvLoop = () => {
      api.log('kv history');

      ecl.connect();
      
      (async function() {
        const serverProtocolVersion = await api.getServerVersion(ecl);
        const _address = ecl.protocolVersion && Number(ecl.protocolVersion) >= 1.2 ? pubToElectrumScriptHashHex(keys.pub, config.komodoParams) : keys.pub;
        
        ecl.blockchainHeadersSubscribe()
        .then((currentHeight) => {
          currentHeight = currentHeight.block_height || currentHeight.height;

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
                  api.getBlockHeader(transaction.height, network, ecl)
                  .then((blockInfo) => {
                    if (blockInfo &&
                        blockInfo.timestamp) {
                      api.getTransaction(transaction.tx_hash, network, ecl)
                      .then((_rawtxJSON) => {
                        api.log('electrum gettransaction ==>');
                        api.log((ind + ' | ' + (_rawtxJSON.length - 1)));
                        // api.log(_rawtxJSON);

                        // decode tx
                        const _network = config.komodoParams;
                        let decodedTx;

                        if (api.getTransactionDecoded(transaction.tx_hash, network)) {
                          decodedTx = api.getTransactionDecoded(transaction.tx_hash, network);
                        } else {
                          decodedTx = transactionDecoder(_rawtxJSON, _network);
                          api.getTransactionDecoded(transaction.tx_hash, network, decodedTx);
                        }

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

                          if (_rawtx) {
                            api.kv.cache.txs = _rawtx;
                          }
                        } else {
                          callback();
                        }
                      });
                    }
                  });
                });
              } else {
                ecl.close();

                api.kv.cache.txs = [];
              }
            });
          } else {
            // api.kv = 'can\'t get current height';
            api.log('kv error: can\'t get current height');
          }
        });
      })();
    };

    _kvLoop();

    if (!skipInterval) {
      setInterval(() => {
        _kvLoop();
      }, KV_HISTORY_UPDATE_INTERVAL);
    }
  };

  api.get('/kv/history', (req, res, next) => {
    const retObj = {
      msg: 'success',
      result: api.kv.cache.txs,
    };

    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify(retObj));
  });

  api.getTransaction = (txid, network, ecl) => {
    return new Promise((resolve, reject) => {
      if (!api.kv.cache[network]) {
        api.kv.cache[network] = {};
      }
      if (!api.kv.cache[network].tx) {
        api.kv.cache[network].tx = {};
      }

      if (!api.kv.cache[network].tx[txid]) {
        api.log(`kv electrum raw input tx ${txid}`);

        ecl.blockchainTransactionGet(txid)
        .then((_rawtxJSON) => {
          api.kv.cache[network].tx[txid] = _rawtxJSON;
          resolve(_rawtxJSON);
        });
      } else {
        api.log(`kv electrum cached raw input tx ${txid}`);
        resolve(api.kv.cache[network].tx[txid]);
      }
    });
  }

  api.getTransactionDecoded = (txid, network, data) => {
    if (!api.kv.cache[network].txDecoded) {
      api.kv.cache[network].txDecoded = {};
    }

    if (api.kv.cache[network].txDecoded[txid]) {
      api.log(`kv electrum raw input tx decoded ${txid}`);
      return api.kv.cache[network].txDecoded[txid];
    } else {
      if (data) {
        api.kv.cache[network].txDecoded[txid] = data;
      } else {
        return false;
      }
    }
  }

  api.getBlockHeader = (height, network, ecl) => {
    return new Promise((resolve, reject) => {
      if (!api.kv.cache[network]) {
        api.kv.cache[network] = {};
      }
      if (!api.kv.cache[network].blockHeader) {
        api.kv.cache[network].blockHeader = {};
      }

      if (!api.kv.cache[network].blockHeader[height]) {
        api.log(`kv electrum raw block ${height}`);

        ecl.blockchainBlockGetHeader(height)
        .then((_rawtxJSON) => {
          if (typeof _rawtxJSON === 'string') {            
            _rawtxJSON = parseBlock(_rawtxJSON, config.komodoParams);

            if (_rawtxJSON.merkleRoot) {
              _rawtxJSON.merkle_root = electrumMerkleRoot(_rawtxJSON);
            }
          }

          api.kv.cache[network].blockHeader[height] = _rawtxJSON;
          resolve(_rawtxJSON);
        });
      } else {
        api.log(`kv electrum cached raw block ${height}`);
        resolve(api.kv.cache[network].blockHeader[height]);
      }
    });
  }

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