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
    // kmd rewards service
    'https://kmd.explorer.dexstats.info/insight-api-komodo/tx/0dd9cf84e8bf9f750a10c7215cc3920b3ee4fb09aaba4d9ba79b02f91763cac3': kmdRewardsTx,
    'https://kmd.explorer.dexstats.info/insight-api-komodo/block/0deb264cb7c72b03c0d6b2e413473d6039b09703b9489d46d326f8a738d20fd4': kmdRewardsBlock,
  };
}

export default fetchMocksList;