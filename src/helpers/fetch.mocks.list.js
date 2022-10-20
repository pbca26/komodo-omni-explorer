/*
 *  Mock JSON files for fetch URL
 */
let fetchMocksList = {};

if (process.env.NODE_ENV === 'JEST') {
  const kmdInsightAddressHistory = require('./fetch.mocks/insight.address.history.json');
  const kmdInsightGetInfo = require('./fetch.mocks/insight.getinfo.json');
  const kmdInsightBlockTxs = require('./fetch.mocks/insight.block.txs.json');
  const kmdInsightBlocksLimit = require('./fetch.mocks/insight.blocks.limit.json');
  const kmdInsightAddressUtxo = require('./fetch.mocks/insight.address.utxo.json');
  const kmdInsightTx = require('./fetch.mocks/insight.tx.json');
  const kmdInsightBestBlockhash = require('./fetch.mocks/insight.bestblockhash.json');
  const kmdInsightTxSend = require('./fetch.mocks/insight.tx.send.json');
  const kmdInsightAddressUtxoMisc = require('./fetch.mocks/insight.address.utxo.misc.json');
  const btcFeesBasic = require('./fetch.mocks/btc.fees.basic.json');
  const btcFeesAll = require('./fetch.mocks/btc.fees.all.json');
  const ethFeesAll = require('./fetch.mocks/eth.fees.json');
  const kmdInsightBlockTxsOverview1 = require('./fetch.mocks/insight.block.txs.overview1.json');
  const kmdInsightBlockTxsOverview2 = require('./fetch.mocks/insight.block.txs.overview2.json');
  const kmdRewardsBlock = require('./fetch.mocks/insight.block.rewards.json');
  const kmdRewardsTx = require('./fetch.mocks/insight.tx.rewards.json');
  const trollboxTxHistory = require('./fetch.mocks/insight.address.history.trollbox.json');
  const faucetAxoUtxo = require('./fetch.mocks/insight.faucet.axo.utxo.json');
  const faucetKoinUtxo = require('./fetch.mocks/insight.faucet.koin.utxo.json');
  const faucetPgtUtxo = require('./fetch.mocks/insight.faucet.pgt.utxo.json');
  const coingeckoPricesPage1 = require('./fetch.mocks/coingecko.prices.page1.json');
  const cryptocomparePrices = require('./fetch.mocks/cryptocompare.prices.json');
  const searchKmdInsightAddressHistory = require('./fetch.mocks/insight.address.history.search.json');

  fetchMocksList = {
    'https://kmd.explorer.dexstats.info/insight-api-komodo/status?q=getInfo': kmdInsightGetInfo,
    'https://kmd.explorer.dexstats.info/insight-api-komodo/blocks?limit=3': kmdInsightBlocksLimit,
    'https://kmd.explorer.dexstats.info/insight-api-komodo/blocks?limit=2': kmdInsightBlocksLimit,
    'https://kmd.explorer.dexstats.info/insight-api-komodo/txs?block=05c623197bb2604ad4deefd1c8ba074a903244ef253c7c1b34813b520e12010b': kmdInsightBlockTxs,
    'https://kmd.explorer.dexstats.info/insight-api-komodo/txs?address=RDbGxL8QYdEp8sMULaVZS2E6XThcTKT9Jd': kmdInsightAddressHistory,
    'https://kmd.explorer.dexstats.info/insight-api-komodo/addr/REfAJRJhJPgFvb99tDJqBAbdz3JQUq7yUV/utxo': kmdInsightAddressUtxo,
    'https://kmd.explorer.dexstats.info/insight-api-komodo/tx/5778a8ab87737b29b2eae69a799293d1f67c7e4fc3c9b5b231d11ef939fee949': kmdInsightTx,
    'https://kmd.explorer.dexstats.info/insight-api-komodo/status?q=getBestBlockHash': kmdInsightBestBlockhash,
    'https://kmd.explorer.dexstats.info/insight-api-komodo/tx/send': kmdInsightTxSend,
    // misc service
    'https://kmd.explorer.dexstats.info/insight-api-komodo/addr/RLC9orGGyti3fHuEKMPUxTa2dCFSXWQdft/utxo': kmdInsightAddressUtxoMisc,
    'https://bitcoinfees.earn.com/api/v1/fees/recommended': btcFeesBasic,
    'https://bitcoinfees.earn.com/api/v1/fees/list': btcFeesAll,
    'https://ethgasstation.info/json/ethgasAPI.json': ethFeesAll,
    // overview service
    'https://kmd.explorer.dexstats.info/insight-api-komodo/txs?block=0aa3c25a68de26d6e03abf88f22c5d7dacd0a6fe48f1393bb4e904429d4c40d0': kmdInsightBlockTxsOverview1,
    'https://kmd.explorer.dexstats.info/insight-api-komodo/txs?block=00000000a62ba1ac09e4d95ee4743e2a591597fd36be56000524c5ae9e4c3330': kmdInsightBlockTxsOverview2,
    // kmd rewards service
    'https://kmd.explorer.dexstats.info/insight-api-komodo/tx/0dd9cf84e8bf9f750a10c7215cc3920b3ee4fb09aaba4d9ba79b02f91763cac3': kmdRewardsTx,
    'https://kmd.explorer.dexstats.info/insight-api-komodo/block/0deb264cb7c72b03c0d6b2e413473d6039b09703b9489d46d326f8a738d20fd4': kmdRewardsBlock,
    // trollbox service
    'https://rick.explorer.dexstats.info/insight-api-komodo/txs?address=RWd2fzCj8WamXQPFMPVQ2xQpP7cfQoW1L1': trollboxTxHistory,
    'https://rick.explorer.dexstats.info/insight-api-komodo/tx/send': kmdInsightTxSend,
    // faucet service
    'https://axo.explorer.dexstats.info/insight-api-komodo/addr/RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4/utxo': faucetAxoUtxo,
    'https://koin.explorer.dexstats.info/insight-api-komodo/addr/RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4/utxo': faucetKoinUtxo,
    'https://mesh.explorer.dexstats.info/insight-api-komodo/addr/RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4/utxo': faucetKoinUtxo,
    'https://clc.explorer.dexstats.info/insight-api-komodo/addr/RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4/utxo': faucetKoinUtxo,
    'https://dex.explorer.dexstats.info/insight-api-komodo/addr/RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4/utxo': faucetKoinUtxo,
    'https://pgt.explorer.dexstats.info/insight-api-komodo/addr/RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4/utxo': faucetPgtUtxo,
    'https://axo.explorer.dexstats.info/insight-api-komodo/tx/send': kmdInsightTxSend,
    'https://koin.explorer.dexstats.info/insight-api-komodo/tx/send': kmdInsightTxSend,
    'https://pgt.explorer.dexstats.info/insight-api-komodo/tx/send': kmdInsightTxSend,
    'https://mesh.explorer.dexstats.info/insight-api-komodo/tx/send': kmdInsightTxSend,
    'https://clc.explorer.dexstats.info/insight-api-komodo/tx/send': kmdInsightTxSend,
    'https://dex.explorer.dexstats.info/insight-api-komodo/tx/send': kmdInsightTxSend,
    // prices service
    'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&price_change_percentage=24h,7d&page=1': coingeckoPricesPage1,
    'https://min-api.cryptocompare.com/data/price?fsym=KMD&tsyms=BTC,AUD,BRL,GBP,BGN,CAD,HRK,CZK,CNY,DKK,EUR,HKD,HUF,INR,IDR,ILS,JPY,KRW,MYR,MXN,NZD,NOK,PHP,PLN,RON,RUB,SGD,ZAR,SEK,CHF,THB,TRY,USD': cryptocomparePrices,
    // search service 
    'https://kmd.explorer.dexstats.info/insight-api-komodo/txs?address=RLC9orGGyti3fHuEKMPUxTa2dCFSXWQdft': searchKmdInsightAddressHistory,
  };
}

export default fetchMocksList;