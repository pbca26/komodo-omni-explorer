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

const SYNC_INTERVAL = 10; // seconds
const MEMPOOL_SYNC_INTERVAL = 2; // seconds
const CACHE_FILE_NAME = 'tokens_cache.json';
//const ccId = '98b9b5f291988f8292842636a68781fd30e0b2521a0d426914f8eb748a4a5fb9';

// 2nd vin 24 chars offset 66 chars = sender pubkey
// TODO: - cc token address balance check
//       - cc token address transactions
//       - mempool
//       - get min height to scan txs from across available token ids
//       - sync chain tip

const minHeight = (tokensData) => {
  let min = tokensData[Object.keys(tokensData)[0]].height;

  for (let x in tokensData) {
    console.log(tokensData[x]);
    if (tokensData[x].height < min) min = tokensData[x].height;
  }

  console.log(`min height ${min}`);

  return min;
};

module.exports = (api) => {
  api.syncTokenOrders = async(chain) => {
    const tokenOrders = JSON.parse(await api.callCli(chain, 'tokenorders'));

    if (!api.tokenOrdersFlat[chain]) api.tokenOrdersFlat[chain] = [];
    
    if (tokenOrders.hasOwnProperty('result')) {
      console.log('[tokenorders]');
      console.log(JSON.stringify(tokenOrders, null, 2));

      for (let i = 0; i < tokenOrders.result.length; i++) {
        if (tokenOrders.result[i].funcid === 'b' &&
            api.tokenOrdersFlat[chain].indexOf(tokenOrders.result[i].txid) === -1) {
          api.tokenOrdersFlat[chain].push(tokenOrders.result[i].txid);
        }
      }
    }

    console.log(JSON.stringify(api.tokenOrdersFlat, null, 2));
  };
    
  api.syncMempool = async(chain) => {
    const rawMempool = JSON.parse(await api.callCli(chain, 'getrawmempool'));

    if (!api.tokensMempool[chain]) api.tokensMempool[chain] = {};
    
    if (rawMempool.hasOwnProperty('result')) {
      console.log('[mempool]');
      console.log(JSON.stringify(rawMempool, null, 2));

      for (let i = 0; i < rawMempool.result.length; i++) {
        if (!api.tokensMempool[chain].hasOwnProperty(rawMempool.result[i])) {
          api.tokensMempool[chain][rawMempool.result[i]] = false;
        }
      }

      api.syncTransactions(chain, true);
    }
  };

  api.syncTransactions = async(chain, syncMempool) => {    
    try {
      const getInfo = JSON.parse(await api.callCli(chain, 'getinfo'));
      let start = api.tokens[chain][Object.keys(api.tokens[chain])[0]].syncedHeight || minHeight(api.tokens[chain]), end;
      // start = 544000;
      // in case of a restart resync starting from last 2 blocks
      if (isRestarted && api.tokens[chain][Object.keys(api.tokens[chain])[0]].syncedHeight) start = start - RESTART_PAST_BLOCKS_LOOKUP;
      
      if (getInfo.hasOwnProperty('result')) {
        //console.log(JSON.stringify(getInfo.result, null, 2));
        end = getInfo.result.blocks;
      }

      console.log(`${chain} sync all txs, startheight = ${start}, endheight = ${end}`);
      
      const processTransactions = async(_start, blocks) => {
        let mempoolTxs = [];

        if (syncMempool) {
          for (let mempoolTxid in api.tokensMempool[chain]) {
            if (api.tokensMempool[chain][mempoolTxid] === false) {
              mempoolTxs.push(mempoolTxid);
            }
          }

          console.log('process mempool txs = ' + mempoolTxs.length);
        }
        
        const txids = blocks ? blocks.result.tx : mempoolTxs;
        
        for (let j = 0; j < txids.length; j++) {
          //console.log('get raw tx ' + txids[j]);
          const rawtx = JSON.parse(await api.callCli(chain, 'getrawtransaction', [txids[j], 1]));

          if (rawtx.hasOwnProperty('result')) {
            //console.log(JSON.stringify(rawtx.result, null, 2));

            if (JSON.stringify(rawtx.result).indexOf('OP_CHECKCRYPTOCONDITION') > -1) {
              //console.log('CC TX');
              for (let cc = 0; cc < Object.keys(api.tokens[chain]).length; cc++) {
                const ccId = Object.keys(api.tokens[chain])[cc];
                let isCCTransfer = false, isCCOnChainDexOrder = false;
                let value = [], receiver = [], sender, fundingTx; // TODO: append funging tx to tx history

                if (!api.tokens[chain]) api.tokens[chain] = {};
                if (!api.tokens[chain][ccId]) api.tokens[chain][ccId] = {};
                if (!api.tokens[chain][ccId].addresses) api.tokens[chain][ccId]['addresses'] = {};
                if (!api.tokens[chain][ccId].balances) api.tokens[chain][ccId]['balances'] = {};
                if (!api.tokens[chain][ccId].transactions) api.tokens[chain][ccId]['transactions'] = {};
                if (!api.tokens[chain][ccId].transactionsAll) api.tokens[chain][ccId]['transactionsAll'] = {};
                if (!api.tokens[chain][ccId].dexTrades) api.tokens[chain][ccId]['dexTrades'] = {};
                
                for (let a = 0; a < rawtx.result.vout.length; a++) {
                  if (JSON.stringify(rawtx.result.vout[a]).indexOf('"cryptocondition"') > -1) {
                    console.log('CC VOUT n=' + rawtx.result.vout[a].n);
                    console.log('CC VOUT val=' + rawtx.result.vout[a].valueSat);
                    value.push(rawtx.result.vout[a].valueSat);
                    console.log('CC VOUT ccaddress=' + rawtx.result.vout[a].scriptPubKey.addresses[0]);
                    receiver.push(rawtx.result.vout[a].scriptPubKey.addresses[0]);
                  }

                  if (rawtx.result.vout[a].scriptPubKey.hex.indexOf(ccId) > -1) {
                    isCCTransfer = true;
                    console.log('CC token transfer ' + ccId);
                    console.log('CC token transfer destpub=' + (rawtx.result.vout[a].scriptPubKey.hex.substr(rawtx.result.vout[a].scriptPubKey.hex.length - 66, 66)));
                    console.log('CC token transfer destpubaddress=' + pubkeyToAddress(rawtx.result.vout[a].scriptPubKey.hex.substr(rawtx.result.vout[a].scriptPubKey.hex.length - 66, 66), kmd));
                  }
                }

                if (rawtx.result.vin.length === 2 || (rawtx.result.vin.length === 3 && rawtx.result.vout[0].value === 0 && rawtx.result.vout.length >= 4)) {
                  isCCOnChainDexOrder = false;
                } else {
                  isCCOnChainDexOrder = true;
                }

                if (isCCTransfer) {
                  if (!isCCOnChainDexOrder &&
                      rawtx.result.vin[1] &&
                      rawtx.result.vin[1].hasOwnProperty('address') &&
                      (process.argv.indexOf('reindex') > -1 || (process.argv.indexOf('reindex') === -1 && api.tokenOrdersFlat[chain] && api.tokenOrdersFlat[chain].indexOf(txids[j]) === -1))) {
                    if (rawtx.result.vin.length === 3 && rawtx.result.vout[0].value === 0 && rawtx.result.vout.length >= 4) {
                      console.log('CC DEX buy from ' + rawtx.result.vin[2].address + ' at price ' + rawtx.result.vin[1].value + ' ' + chain + ', tokens received ' + rawtx.result.vout[2].valueSat + ' to address ' + rawtx.result.vout[2].scriptPubKey.addresses[0]);
                      sender = rawtx.result.vin[2].address;
                      receiver[0] = rawtx.result.vout[2].scriptPubKey.addresses[0];
                      value[0] = rawtx.result.vout[2].valueSat;

                      if (Object.keys(api.tokens[chain][ccId].dexTrades).indexOf(txids[j]) === -1) {
                        api.tokens[chain][ccId].dexTrades[txids[j]] = {
                          from: sender,
                          to: receiver[0],
                          value: value[0],
                          confirmations: rawtx.result.confirmations,
                          rawconfirmations: rawtx.result.rawconfirmations,
                          height: rawtx.result.height,
                          blockhash: rawtx.result.blockhash,
                          txid: txids[j],
                          time: rawtx.result.blocktime,
                          price: rawtx.result.vin[1].value,
                        };
                      }
                    } else {
                      console.log('CC token transfer from ' + rawtx.result.vin[1].address);
                      sender = rawtx.result.vin[1].address;
                    }

                    if (Object.keys(api.tokens[chain][ccId].addresses).indexOf(sender) === -1) api.tokens[chain][ccId].addresses[sender] = [];
                    if (Object.keys(api.tokens[chain][ccId].addresses).indexOf(receiver[0]) === -1) api.tokens[chain][ccId].addresses[receiver[0]] = [];
                    if (Object.keys(api.tokens[chain][ccId].balances).indexOf(sender) === -1) api.tokens[chain][ccId].balances[sender] = 0;
                    if (Object.keys(api.tokens[chain][ccId].balances).indexOf(receiver[0]) === -1) api.tokens[chain][ccId].balances[receiver[0]] = 0;
                    
                    if (sender !== receiver[0] && Object.keys(api.tokens[chain][ccId].transactionsAll).indexOf(txids[j]) === -1) {
                      api.tokens[chain][ccId].balances[sender] -= Number(value[0]);
                      api.tokens[chain][ccId].balances[receiver[0]] += Number(value[0]);
                    }

                    api.tokens[chain][ccId].transactionsAll[txids[j]] = {
                      from: sender,
                      to: receiver[0],
                      value: value[0],
                      confirmations: rawtx.result.confirmations,
                      rawconfirmations: rawtx.result.rawconfirmations,
                      height: rawtx.result.height,
                      blockhash: rawtx.result.blockhash,
                      txid: txids[j],
                      time: rawtx.result.blocktime,
                    };

                    if (!api.tokens[chain][ccId].transactions[sender]) api.tokens[chain][ccId].transactions[sender] = [];
                    if (api.tokens[chain][ccId].addresses[sender].indexOf(txids[j]) === -1) {
                      api.tokens[chain][ccId].addresses[sender].push(txids[j]);
                    }

                    api.tokens[chain][ccId].transactions[sender].push({
                      from: sender,
                      to: receiver[0],
                      value: value[0],
                      confirmations: rawtx.result.confirmations,
                      rawconfirmations: rawtx.result.rawconfirmations,
                      height: rawtx.result.height,
                      blockhash: rawtx.result.blockhash,
                      txid: txids[j],
                      time: rawtx.result.blocktime,
                    });

                    if (!api.tokens[chain][ccId].transactions[receiver[0]]) api.tokens[chain][ccId].transactions[receiver[0]] = [];
                    if (sender !== receiver[0] && api.tokens[chain][ccId].addresses[receiver[0]].indexOf(txids[j]) === -1) {
                      api.tokens[chain][ccId].addresses[receiver[0]].push(txids[j]);
                    }

                    if (sender !== receiver[0]) {
                      api.tokens[chain][ccId].transactions[receiver[0]].push({
                        to: receiver[0],
                        from: sender,
                        value: value[0],
                        confirmations: rawtx.result.confirmations,
                        rawconfirmations: rawtx.result.rawconfirmations,
                        height: rawtx.result.height,
                        blockhash: rawtx.result.blockhash,
                        txid: txids[j],
                        time: rawtx.result.blocktime,
                      });
                    }
                  } else {
                    console.log('CC token onchain exchange');
                    // TODO: collect and process such transactions
                  }
                } else {
                  if (ccId === txids[j]) {
                    console.log('CC contract ' + ccId + ' funding tx = ' + rawtx.result.vout[1].valueSat + ' tokens' + ', funding address ' + rawtx.result.vout[1].scriptPubKey.addresses[0]);
                    api.tokens[chain][ccId].balances[rawtx.result.vout[1].scriptPubKey.addresses[0]] = Number(rawtx.result.vout[1].valueSat);
                  }
                }
              }
            }
          }

          if (api.tokensMempool[chain] && api.tokensMempool[chain].hasOwnProperty(txids[j])) api.tokensMempool[chain][txids[j]] = true;
        }

        if (_start) {
          for (let xc = 0; xc < Object.keys(api.tokens[chain]).length; xc++) {
            api.tokens[chain][Object.keys(api.tokens[chain])[xc]].syncedHeight = _start;
          }
        }

        fs.writeFile(CACHE_FILE_NAME, JSON.stringify(api.tokens), (err) => {
          if (err) {
            api.log(`error updating tokens cache file ${err}`);
          }
        });
      };

      if (!syncMempool) {
        for (let i = 0; i <= Math.abs(start - end); i++) {
          console.log('get block ' + (start + i));
          const blocks = JSON.parse(await api.callCli(chain, 'getblock', [(start + i).toString()]));
          
          if (blocks.hasOwnProperty('result')) {
            processTransactions(start + i, blocks);
          }
        }
      } else {
        processTransactions();
      }
    } catch (e) {
      console.log(e);
    }
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

  api.syncTokensInfo = async(chain) => {
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
              }
            }
          }
        }

        // keep in mem obj with tokens info
        let tokensInfo = JSON.parse(JSON.stringify(api.tokens));
        
        for (let key1 in tokensInfo) {
          for (let key2 in tokensInfo[key1]) {
            delete tokensInfo[key1][key2].addresses;
            delete tokensInfo[key1][key2].balances;
            delete tokensInfo[key1][key2].transactions;
            delete tokensInfo[key1][key2].transactionsAll;
          }
        }

        api.tokensInfo = tokensInfo;
      }
    } catch (e) {
      console.log(e);
    }
  };

  api.get('/tokens', (req, res, next) => {
    const chain = req.query.chain ? req.query.chain.toUpperCase() : null;
    const ccTokenId = req.query.cctxid;

    if (chain && !ccTokenId) {
      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        msg: 'success',
        result: api.tokensInfo[chain] ? api.tokensInfo[chain] : 'No tokens found on this chain',
      }));
    } else if (
      chain && ccTokenId
    ) {
      let tokenInfo;

      for (let chains in api.tokensInfo) {
        if (api.tokensInfo[chains][ccTokenId]) tokenInfo = api.tokensInfo[chains][ccTokenId];
      }

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        msg: 'success',
        result: tokenInfo || 'No such token exists',
      }));
    } else {
      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        msg: 'success',
        result: api.tokensInfo,
      }));
    }
  });

  api.get('/tokens/all', (req, res, next) => {
    res.set({ 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      msg: 'success',
      result: api.tokens,
    }));
  });

  api.get('/tokens/richlist', (req, res, next) => {
    const ccTokenId = req.query.cctxid;

    if (!ccTokenId) {
      const retObj = {
        msg: 'error',
        result: 'Missing token ID param',
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(retObj));
    } else {
      let tokenData;
      let chain;
      
      for (let chains in api.tokens) {
        if (api.tokens[chains][ccTokenId]) {
          chain = chains;
          tokenData = api.tokens[chains][ccTokenId];
        }
      }

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        msg: 'success',
        result: tokenData && tokenData.balances ? {chain, balances: tokenData.balances} : 'No such token exists',
      }));
    }
  });

  api.get('/tokens/transactions', (req, res, next) => {
    const ccTokenId = req.query.cctxid;

    if (!ccTokenId) {
      const retObj = {
        msg: 'error',
        result: 'Missing token ID param',
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(retObj));
    } else {
      let tokenData;
      let chain;
      
      for (let chains in api.tokens) {
        if (api.tokens[chains][ccTokenId]) {
          chain = chains;
          tokenData = api.tokens[chains][ccTokenId];
        }
      }

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        msg: 'success',
        result: tokenData && tokenData.transactionsAll ? {chain, transactions: tokenData.transactionsAll} : 'No such token exists',
      }));
    }
  });

  api.get('/tokens/address/balance', (req, res, next) => {
    if (!req.query.address) {
      const retObj = {
        msg: 'error',
        result: 'Missing address param',
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(retObj));
    } else if (!req.query.chain) {
      const retObj = {
        msg: 'error',
        result: 'Missing chain param',
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(retObj));
    } else if (!req.query.cctxid) {
      const retObj = {
        msg: 'error',
        result: 'Missing token ID param',
      };

      res.set({ 'Content-Type': 'application/json' });
      res.end(JSON.stringify(retObj));
    } else if (
      req.query.address &&
      req.query.chain &&
      req.query.cctxid
    ) {
      const address = req.query.address;
      const chain = req.query.chain;
      const ccTokenId = req.query.cctxid;
      const addressCheck = addressVersionCheck(kmd, address);

      if (addressCheck === true) {
        if (api.tokens[chain.toUpperCase()][ccTokenId]) {
          const retObj = {
            msg: 'success',
            result: api.tokens[chain.toUpperCase()][ccTokenId].balances[address] ? api.tokens[chain.toUpperCase()][ccTokenId].balances[address] : 0,
          };
    
          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        } else {
          const retObj = {
            msg: 'error',
            result: 'No such token ID exists',
          };
    
          res.set({ 'Content-Type': 'application/json' });
          res.end(JSON.stringify(retObj));
        }
      } else {
        const retObj = {
          msg: 'error',
          result: 'Incorrect smart chain address',
        };
  
        res.set({ 'Content-Type': 'application/json' });
        res.end(JSON.stringify(retObj));
      }
    }
  });

  api.initTokens = async() => {
    const cacheFileData = fs.readJsonSync(CACHE_FILE_NAME, { throws: false });
    
    if (cacheFileData) {
      api.tokens = cacheFileData;
    }

    api.pathsDaemons();
    console.log(JSON.stringify(api.paths, null, 2));
  
    const sync_tokens = async() => {
      for (let i = 0; i < config.tokens.length; i++) {
        const chain = config.tokens[i];
        api.confFileIndex[chain] = `${api.paths.kmdDir}/${chain}/${chain}.conf`;
        console.log(api.confFileIndex);
        console.log(api.getConf(chain));
        console.log(api.rpcConf);

        if (process.argv.indexOf('reindex') === -1) {
          await api.syncTokenOrders(chain);
        }
        await api.syncTokensInfo(chain);
        await api.syncTransactions(chain);
        if (process.argv.indexOf('reindex') === -1) {
          api.syncMempool(chain);
        }
        console.log(`${chain} finished syncing tokens`);
      }
      
      isRestarted = false;
      
      setTimeout(() => {
        sync_tokens();
      }, SYNC_INTERVAL * 1000);
    }

    const sync_mempool = async() => {
      for (let i = 0; i < config.tokens.length; i++) {
        const chain = config.tokens[i];
        api.confFileIndex[chain] = `${api.paths.kmdDir}/${chain}/${chain}.conf`;
        api.syncTokenOrders(chain);
        api.syncMempool(chain);
        
        console.log(`${chain} finished syncing mempool`);
      }
    }

    sync_tokens();
    if (process.argv.indexOf('reindex') === -1) {
      sync_mempool();
      setInterval(() => {
        sync_mempool();
      }, MEMPOOL_SYNC_INTERVAL * 1000);
    }
  };

  return api;
};