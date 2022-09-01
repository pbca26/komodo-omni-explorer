/*import { InsightExplorerConnector } from './blockchain.service';
import { ICoin } from '../types';

describe('InsightExplorerConnector', () => {
  const connector = new InsightExplorerConnector(ICoin.KMD);

  it('should be defined', () => {
    expect(connector).toBeDefined();
    expect(connector.coin).toBe(ICoin.KMD);
  });

  it('should request getInfo', async() => {
    const res = await connector.getInfo();
    const getInfoResProps = [
      'version',
      'protocolversion',
      'KMDversion',
      'blocks',
      'timeoffset',
      'connections',
      'proxy',
      'difficulty',
      'testnet',
      'relayfee',
      'errors',
      'notarized',
      'network'
    ];
    expect(res).toHaveProperty('info');
    getInfoResProps.map((x) => expect(res.info).toHaveProperty(x));
  });

  it('should request getBlock', async() => {
    const res = await connector.getBlock('05c623197bb2604ad4deefd1c8ba074a903244ef253c7c1b34813b520e12010b');
    const getBlockProps = [
      'hash',
      'size',
      'height',
      'version',
      'merkleroot',
      'tx',
      'time',
      'nonce',
      'solution',
      'bits',
      'difficulty',
      'chainwork',
      'confirmations',
      'previousblockhash',
      'nextblockhash',
      'reward',
      'isMainChain',
    ];
    expect(res).toBeDefined();
    getBlockProps.map((x) => expect(res).toHaveProperty(x));
  });

  it('should request getLastBlocks', async() => {
    const res = await connector.getLastBlocks(3);
    const getLastBlocksProps = [
      'height',
      'size',
      'hash',
      'time',
      'txlength',
    ];
    expect(res).toHaveProperty('blocks');
    expect(res.blocks.length).toBeGreaterThan(0);
    getLastBlocksProps.map((x) => expect(res.blocks[0]).toHaveProperty(x));
  });

  it('should request getBlockTransactions', async() => {
    const res = await connector.getBlockTransactions('05c623197bb2604ad4deefd1c8ba074a903244ef253c7c1b34813b520e12010b');
    const getBlockTransactionsProps = [
      'pagesTotal',
      'txs',
    ];
    expect(res.txs.length).toBeGreaterThan(0);
    getBlockTransactionsProps.map((x) => expect(res).toHaveProperty(x));
  });

  it('should request getTransactionsHistory', async() => {
    const res = await connector.getTransactionsHistory('RDbGxL8QYdEp8sMULaVZS2E6XThcTKT9Jd');
    const getTransactionsHistoryProps = [
      'pagesTotal',
      'txs',
    ];
    expect(res.txs.length).toBeGreaterThan(0);
    getTransactionsHistoryProps.map((x) => expect(res).toHaveProperty(x));
  });

  it('should request getUtxos', async() => {
    const res = await connector.getUtxos('REfAJRJhJPgFvb99tDJqBAbdz3JQUq7yUV');
    const getUtxosProps = [
      'address',
      'txid',
      'vout',
      'scriptPubKey',
      'amount',
      'satoshis',
      'height',
      'confirmations',
    ];
    expect(res.length).toBeGreaterThan(0);
    getUtxosProps.map((x) => expect(res[0]).toHaveProperty(x));
  });

  it('should request getTransaction', async() => {
    const res = await connector.getTransaction('5778a8ab87737b29b2eae69a799293d1f67c7e4fc3c9b5b231d11ef939fee949');
    const getTransactionProps = [
      'txid',
      'version',
      'locktime',
      'vin',
      'vout',
      'blockhash',
      'blockheight',
      'confirmations',
      'time',
      'blocktime',
      'nVersionGroupId',
    ];
    getTransactionProps.map((x) => expect(res).toHaveProperty(x));
  });

  it('should request getBestBlockhash', async() => {
    const res = await connector.getBestBlockhash();
    expect(res).toHaveProperty('bestblockhash');
  });

  it('should request broadcastTransaction', async() => {
    const res = await connector.broadcastTransaction('123');
    expect(res).toBe('TX decode failed. Code:-22');
  });
});*/