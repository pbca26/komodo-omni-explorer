const config = require('../config');
const request = require('request');
const fs = require('fs-extra');
const path = require('path');
const async = require('async');
const {kmd} = require('agama-wallet-lib/src/bitcoinjs-networks');
const {
  pubkeyToAddress,
  addressVersionCheck,
} = require('agama-wallet-lib/src/keys');

const CACHE_FILE_NAME = 'tokens_cache.json';
//const ccId = '98b9b5f291988f8292842636a68781fd30e0b2521a0d426914f8eb748a4a5fb9';

// 2nd vin 24 chars offset 66 chars = sender pubkey
// TODO: - cc token address balance check
//       - cc token address transactions
//       - mempool
//       - get min height to scan txs from across available token ids
//       - sync chain tip

module.exports = (api) => {
  api.syncTransactions = async(chain, ccId, start, end) => {
    if (!api.tokens[chain]) api.tokens[chain] = {};
    if (!api.tokens[chain][ccId]) api.tokens[chain][ccId] = {};
    if (!api.tokens[chain][ccId].addresses) api.tokens[chain][ccId]['addresses'] = {};
    if (!api.tokens[chain][ccId].balances) api.tokens[chain][ccId]['balances'] = {};
    if (!api.tokens[chain][ccId].transactions) api.tokens[chain][ccId]['transactions'] = {};
    if (!api.tokens[chain][ccId].transactionsAll) api.tokens[chain][ccId]['transactionsAll'] = {};
  };

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
              api.tokens[chain][tokensList.result[i]].ownerAddress = pubkeyToAddress(tokenInfo.result.owner, kmd);
              // request additional cctx data
              const txInfo = JSON.parse(await api.callCli(chain, 'getrawtransaction', [tokensList.result[i], 1]));
              
              if (txInfo.hasOwnProperty('result')) {
                console.log(JSON.stringify(txInfo.result, null, 2));
                api.tokens[chain][tokensList.result[i]].blocktime = txInfo.result.blocktime;
                api.tokens[chain][tokensList.result[i]].height = txInfo.result.height;
                api.tokens[chain][tokensList.result[i]].confirmations = txInfo.result.confirmations;
                api.tokens[chain][tokensList.result[i]].rawconfirmations = txInfo.result.rawconfirmations;
                api.tokens[chain][tokensList.result[i]].blockhash = txInfo.result.blockhash;
                api.tokens[chain][tokensList.result[i]].syncedHeight = 0;
                
                fs.writeFile(CACHE_FILE_NAME, JSON.stringify(api.tokens), (err) => {
                  if (err) {
                    api.log(`error updating tokens cache file ${err}`);
                  }
                });

                let startHeight, endHeight;
                
                if (!api.tokens[chain][tokensList.result[i]].syncedHeight) {
                  startHeight = api.tokens[chain][tokensList.result[i]].height;
                } else {
                  startHeight = api.tokens[chain][tokensList.result[i]].syncedHeight;
                }
    
                const getInfo = JSON.parse(await api.callCli(chain, 'getinfo'));
                
                if (getInfo.hasOwnProperty('result')) {
                  //console.log(JSON.stringify(getInfo.result, null, 2));
                  endHeight = getInfo.result.blocks;
    
                  console.log(`${chain} sync all txs for token ID ${tokensList.result[i]}, startheight = ${startHeight}, endheight = ${endHeight}`);
                  api.syncTransactions(chain, tokensList.result[i], startHeight, endHeight);
                }
              }
            }
          } else {
            let startHeight, endHeight;

            if (!api.tokens[chain][tokensList.result[i]].syncedHeight) {
              startHeight = api.tokens[chain][tokensList.result[i]].height;
            } else {
              startHeight = api.tokens[chain][tokensList.result[i]].syncedHeight;
            }

            const getInfo = JSON.parse(await api.callCli(chain, 'getinfo'));
            
            if (getInfo.hasOwnProperty('result')) {
              //console.log(JSON.stringify(getInfo.result, null, 2));
              endHeight = getInfo.result.blocks;

              console.log(`${chain} sync all txs for token ID ${tokensList.result[i]}, startheight = ${startHeight}, endheight = ${endHeight}`);
              api.syncTransactions(chain, tokensList.result[i], startHeight, endHeight);
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

  api.initTokens = () => {
    const cacheFileData = fs.readJsonSync(CACHE_FILE_NAME, { throws: false });
    
    if (cacheFileData) {
      api.tokens = cacheFileData;
    }
  };

  return api;
};