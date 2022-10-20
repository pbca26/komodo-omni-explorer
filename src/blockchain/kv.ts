// TODO: refactor, add types
import { ITrollboxMessage } from '../types';
import log from '../helpers/logger';

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
const KV_OPRETURN_MAX_SIZE_BYTES: number = KV_MAX_CONTENT_SIZE + KV_MAX_CONTENT_SIZE / 2;

const validateEncoderData = (data: ITrollboxMessage) => {
  /*if (!data.tag) {
    throw new Error('missing tag prop');
  } else if (!data.content) {
    throw new Error('missing content prop');
  } else if (data.content && !data.content.title) {
    throw new Error('missing content title prop');
  } else if (data.content && !data.content.body) {
    throw new Error('missing content body prop');
  } else */
  if (!data.tag.length) {
    throw new Error('tag length cannot be zero');
  } else if (data.tag.length > KV_HEADER_SIZE[2]) {
    throw new Error(`tag length cannot exceed ${KV_HEADER_SIZE[2]}`);
  } else if (data.content.version.toString().length > KV_CONTENT_HEADER_SIZE[0]) {
    throw new Error(`content version length cannot exceed ${KV_CONTENT_HEADER_SIZE[0]}`);
  } else if (!data.content.body.length) {
    throw new Error('content body length cannot be zero');
  } else if (!data.content.title.length) {
    throw new Error('content title length cannot be zero');
  } else if (data.content.body.length > KV_MAX_CONTENT_SIZE) {
    throw new Error(`content body length cannot exceed ${KV_MAX_CONTENT_SIZE}`);
  } else if (data.content.title.length > KV_CONTENT_HEADER_SIZE[2]) {
    throw new Error(`content title length cannot exceed ${KV_CONTENT_HEADER_SIZE[2]}`);
  }
};

export const encode = (data: ITrollboxMessage) => {
  validateEncoderData(data);

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

  log('kv', 'kv data');
  log('kv', data.content.body.length, 'kv');
  log('kv', data.content.body, 'kv');
  log('kv', kvBuf[6], 'kv');
  log('kv', kvBuf[6].toString(), 'kv');

  log('kv', 'kv buf', kvBuf.toString());

  const out = Buffer.concat(kvBuf);

  log('kv', 'concat kv buf');
  log('kv', out, 'kv');
  log('kv', out.toString('hex'), 'kv');
  log('kv', out.toString('hex').length, 'kv');
  log('kv', `kv max allowed size ${KV_MAX_CONTENT_SIZE + KV_CONTENT_HEADER_SIZE[0] + KV_CONTENT_HEADER_SIZE[1] + KV_CONTENT_HEADER_SIZE[2]}`);

  if (out.toString('hex').length > KV_OPRETURN_MAX_SIZE_BYTES || 
      (out.toString('hex').length > KV_MAX_CONTENT_SIZE + KV_CONTENT_HEADER_SIZE[0] + KV_CONTENT_HEADER_SIZE[1] + KV_CONTENT_HEADER_SIZE[2])) {
    throw new Error(`total kv opreturn length cannot exceed ${KV_OPRETURN_MAX_SIZE_BYTES}`);
  }

  return out.toString('hex');
}

export const decode = (hex, fromTx?: boolean) => {
  log('kv', Buffer.from(hex, 'hex').toString(), 'kv');

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

  log('kv', 'kv buffer', 'kv');
  log('kv', kvBuf, 'kv');

  for (let i = 0; i < kvBuf.length; i++) {
    log('kv', `kv buffer ${i}, ${kvBuf[i].length} bytes`, 'kv');
    log('kv', `kv buffer -> string ${kvBuf[i].length} bytes`, 'kv');
    log('kv', kvBuf[i].toString(), 'kv');
  }

  const out = {
    version: parseInt(kvBuf[0].toString().replace(/\0/g, '')),
    encrypted: parseInt(kvBuf[1].toString().replace(/\0/g, '')),
    tag: kvBuf[2].toString().replace(/\0/g, ''),
    content: {
      version: parseInt(kvBuf[3].toString().replace(/\0/g, '')),
      parent: kvBuf[4].toString().replace(/\0/g, ''),
      title: kvBuf[5].toString().replace(/\0/g, ''),
      body: kvBuf[6].toString().replace(/\0/g, ''),
    },
  };

  log(out)

  if (out.hasOwnProperty('version') &&
      Number(out.version) >= 0 && out.version.toString().length &&
      out.hasOwnProperty('encrypted') &&
      Number(out.encrypted) >= 0 && out.encrypted.toString().length &&
      out.hasOwnProperty('content') &&
      out.content.hasOwnProperty('version') &&
      Number(out.content.version) >= 0 && out.content.version.toString().length) {
    return out;
  } else {
    return false;
  }
}