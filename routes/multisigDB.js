/* 
 *  Purpose: multisig proposal storage
 *  Proposal format: JSON object { id: int, coin: string, pubkey, redeemscript: string, content: object, contentBackup: initial content copy, comments: array, history, archived: boolean }
 *  Content format: encrypted JSON object { timestamp, type, pubkey }
 *    type: 0 - created, 1 - sig added, 2 - comment added, 4 - archived, 5 - restored, 6 - published (locked)
 *  Content format: encrypted JSON object { timestamp, title: string, pubkey hash: string, raw tx }
 *  Comment format: encrypted JSON object { id: int, pubkey hash: string, text: string, edited: false }
 */

 // TODO: compare hashes

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
const md5 = require('agama-wallet-lib/src/crypto/md5');

const findItemIndexById = (obj, id) => {
  for (let i = 0; i < obj.length; i++) {
    if (Number(obj[i].id) === id) {
      return i;
    }
  }
};

const checkParams = (paramsList, obj) => {
  let _items = [];
  
  for (let i = 0; i < paramsList.length; i++) {
    if (!obj.hasOwnProperty(paramsList[i])) _items.push(paramsList[i]);
  }

  return _items;
};

module.exports = (api) => {
  api.multisig = {};

  api.get('/multisig/storage/list', (req, res, next) => {
    const paramsList = [
      'coin',
      'pubkey',
      'message',
      'sig',
      'redeemscript',
      'iszcash',
    ];
    const {
      coin,
      pubkey,
      message,
      sig,
      redeemscript,
      iszcash,
      id,
    } = req.query;

    const queryParamsCheck = checkParams(paramsList, req.query);
    
    if (!queryParamsCheck.length) {
      // TODO: wrong network
      const signature = true || signature.btc.verify(
        pubkeyToAddress(pubkey, networks[coin] || networks.btc),
        message,
        sig,
        iszcash ? true : false
      );

      if (signature) {
        fs.readdir('./multisigDB', (err, items) => {
          let files = [];

          for (let i = 0; i < items.length; i++) {
            if (items[i].substr(items[i].length - 5, 5) === '.msig') {
              files.push(items[i].substr(0, items[i].length - 5));
            }
          }

          if (files.indexOf(md5(redeemscript)) === -1) {
            const retObj = {
              msg: 'error',
              result: 'file not found',
            };
            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(retObj));
          } else {
            if (fs.existsSync(`./multisigDB/${md5(redeemscript)}.msig`)) {
              fs.readFile(`./multisigDB/${md5(redeemscript)}.msig`, 'utf8', (err, data) => {
                if (err) {
                  const retObj = {
                    msg: 'error',
                    result: 'unable to read file',
                  };
    
                  res.end(JSON.stringify(retObj));
                } else {
                  data = JSON.parse(data);
                  
                  const arrayIndex = id ? findItemIndexById(data, Number(id)) : 0;
                  
                  if (Number(id) >= 0 &&
                      data[arrayIndex]) {
                    data = data[arrayIndex];
                  } else if (
                    Number(id) >= 0 &&
                    !data[arrayIndex]) {
                    data = null;
                  }
                  
                  const retObj = {
                    msg: data ? 'success' : 'error',
                    result: data ? data : `unable to find proposal with id ${id}`,
                  };
                  res.set({ 'Content-Type': 'application/json' });
                  res.end(JSON.stringify(retObj));
                }
              });
            } else {
              const retObj = {
                msg: 'error',
                result: 'file not found',
              };
              res.set({ 'Content-Type': 'application/json' });
              res.end(JSON.stringify(retObj));
            }
          }
        });
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

  api.get('/multisig/storage/new', (req, res, next) => {
    const paramsList = [
      'coin',
      'pubkey',
      'message',
      'sig',
      'redeemscript',
      'content',
      'iszcash',
    ];
    const {
      coin,
      pubkey,
      message,
      sig,
      redeemscript,
      content,
      iszcash,
      comment,
    } = req.query;

    const queryParamsCheck = checkParams(paramsList, req.query);
    
    if (!queryParamsCheck.length) {
      // TODO: wrong network
      const signature = true || signature.btc.verify(
        pubkeyToAddress(pubkey, networks[coin] || networks.btc),
        message,
        sig,
        iszcash ? true : false
      );

      if (signature) {
        fs.readdir('./multisigDB', (err, items) => {
          let files = [];

          for (let i = 0; i < items.length; i++) {
            if (items[i].substr(items[i].length - 5, 5) === '.msig') {
              files.push(items[i].substr(0, items[i].length - 5));
            }
          }

          if (files.indexOf(md5(redeemscript)) === -1) {
            const fileData = JSON.stringify([{
              id: 0,
              coin,
              redeemscript,
              content,
              contentBackup: content,
              comments: comment ? [comment] : [],
              history: [{
                timestamp: Math.floor(Date.now() / 1000),
                pubkey,
                type: 0,
              }, {
                timestamp: Math.floor(Date.now() / 1000),
                pubkey,
                type: 1,
              }],
              archived: false,
            }]);
            fs.writeFileSync(`./multisigDB/${md5(redeemscript)}.msig`, fileData);

            const retObj = {
              msg: 'success',
              result: 'file created',
            };
            res.set({ 'Content-Type': 'application/json' });
            res.end(JSON.stringify(retObj));
          } else {
            // modify old file
          }
        });
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