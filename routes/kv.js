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

  return api;
};