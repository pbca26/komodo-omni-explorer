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

const KV_MAX_CONTENT_SIZE = config.kv.contentLimit;

module.exports = (api) => {
  api.kvEncode = (data) => {
    let kvBuf = [
      new Buffer(KV_HEADER_SIZE[0]),
      new Buffer(KV_HEADER_SIZE[1]),
      new Buffer(KV_HEADER_SIZE[2]),
      new Buffer(KV_CONTENT_HEADER_SIZE[0]),
      new Buffer(KV_CONTENT_HEADER_SIZE[1]),
      new Buffer(KV_CONTENT_HEADER_SIZE[2]),
      new Buffer(data.content.body.length)
    ];

    kvBuf[0].write(KV_VERSION.current);
    kvBuf[1].write('0');
    kvBuf[2].write(data.tag);
    kvBuf[3].write(data.content.version.toString());
    kvBuf[4].write(data.content.parent ? data.content.parent : '0000000000000000000000000000000000000000000000000000000000000000');
    kvBuf[5].write(data.content.title);
    kvBuf[6].write(data.content.body);

    api.log(data.content.body.length, 'kv');
    api.log(data.content.body, 'kv');
    api.log(kvBuf[6], 'kv');
    api.log(kvBuf[6].toString(), 'kv');

    const out = Buffer.concat(kvBuf);

    api.log(out, 'kv');
    api.log(out.toString('hex'), 'kv');
    api.log(out.toString('hex').length, 'kv');

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

  api.get('/kv/send', (req, res, next) => {
    const _content = req.query.content;
    const _encodedContent = api.kvEncode(_content);

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
            0.0001,
            0.0001,
            keys.pub,
            keys.pub,
            utxoList
          );

          api.log('tx data');
          api.log('buildSignedTx signed tx hex');
          api.log(rawtx);

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

            api.log(txid);

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
        result: `Content exceeds max size ${KV_MAX_CONTENT_SIZE} chars`,
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(retObj));
    }
  });

  return api;
};