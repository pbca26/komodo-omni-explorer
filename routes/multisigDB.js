/* 
 *  Purpose: multisig proposal storage
 *  Proposal format: JSON object { id, coin, redeemscript, content}
 *  Content format: encrypted JSON object { title, creator = pubkey hash, raw tx, comment }
 *  Comment format: JSON object { id, pubkey hash, text }
 */

const config = require('../config');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const crypto = require('crypto');
const signature = require('agama-wallet-lib/src/message');
const { pubkeyToAddress } = require('agama-wallet-lib/src/keys');
const networks = require('agama-wallet-lib/src/bitcoinjs-networks');
const {
  encrypt,
  decrypt,
} = require('agama-wallet-lib/src/crypto/cryptstr');

const checkParams = (paramsList, obj) => {
  let _items = [];
  
  for (let i = 0; i < paramsList.length; i++) {
    if (!obj.hasOwnProperty(paramsList[i])) _items.push(paramsList[i]);
  }

  return _items;
};

module.exports = (api) => {
  api.multisig = {};

  api.post('/multisig/storage/list', (req, res, next) => {
    const paramsList = [
      'coin',
      'pubkey',
      'message',
      'sig',
      'encryptkey',
    ];
    const {
      coin,
      pubkey,
      message,
      sig,
      iszcash,
      encryptkey,
    } = req.body;

    const queryParamsCheck = checkParams(paramsList, req.body);
    
    if (!queryParamsCheck.length) {
      // TODO: wrong network
      const signature = signature.btc.verify(
        pubkeyToAddress(pubkey, networks[coin] || networks.btc),
        message,
        sig,
        isZcash ? true : false
      );

      if (signature) {
        const retObj = {
          msg: 'error',
          result: `missing param${queryParamsCheck.length > 1 ? 's' : ''} ${queryParamsCheck.join(', ')}`,
        };
        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(retObj));
      } else {
        const retObj = {
          msg: 'error',
          result: 'signature mismatch',
        };
        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(retObj));
      }
    } else {
      const retObj = {
        msg: 'error',
        result: `missing param${queryParamsCheck.length > 1 ? 's' : ''} ${queryParamsCheck.join(', ')}`,
      };
      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(retObj));
    }
  });

  api.get('/multisig/storage', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: {},
    }));
  });

  return api;
};