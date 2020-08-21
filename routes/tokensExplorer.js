const config = require('../config');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const async = require('async');
const {kmd} = require('agama-wallet-lib/src/bitcoinjs-networks');

const CACHE_FILE_NAME = 'tokens_cache.json';
//const ccId = '98b9b5f291988f8292842636a68781fd30e0b2521a0d426914f8eb748a4a5fb9';

// 2nd vin 24 chars offset 66 chars = sender pubkey
// TODO: - cc token address balance check
//       - cc token address transactions
//       - mempool
//       - get min height to scan txs from across available token ids
//       - sync chain tip

module.exports = (api) => {
  api.syncTokenChain = async(chain) => {
    try {
      const tokensList = JSON.parse(await api.callCli(chain, 'tokenlist'));

      if (tokensList.hasOwnProperty('result')) {
        if (!api.tokens[chain]) api.tokens[chain] = {};

        console.log(JSON.stringify(tokensList.result, null, 2));

        for (let i = 0; i < tokensList.result.length; i++) {
          if (!api.tokens[chain][tokensList.result[i]]) {
            const tokenInfo = JSON.parse(await api.callCli(chain, 'tokeninfo', [tokensList.result[i]]));

            if (tokenInfo.hasOwnProperty('result')) {
              console.log(JSON.stringify(tokenInfo.result, null, 2));
              api.tokens[chain][tokensList.result[i]] = tokenInfo.result;
            }
          }
        }
      }
    } catch (e) {
      console.log(e);
    }
  };

  api.get('/tokens', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: api.tokens,
    }));
  });

  return api;
};