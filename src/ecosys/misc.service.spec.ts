import { Test, TestingModule } from '@nestjs/testing';
import { MiscService } from './misc.service';
import { ConnectorsService } from '../blockchain/connectors.service';
import BlockchainCore from '../blockchain/core';
import { ICoin } from '../types';

describe('MiscService', () => {
  let service: MiscService;
  let connector: ConnectorsService;
  let bc: BlockchainCore;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MiscService],
      providers: [
        ConnectorsService,
        BlockchainCore
      ],
    }).compile();

    service = module.get<MiscService>(MiscService);
    connector = module.get<ConnectorsService>(ConnectorsService);
    bc = module.get<BlockchainCore>(BlockchainCore);
    connector.init(['KMD']);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return timenow', async() => {
    const timenow = Date.now();
    const res = await service.timeNow();
    expect(res).toBeGreaterThanOrEqual(timenow);
  });

  it('should return KMD utxos for an address', async() => {
    const res = await service.getUtxos(ICoin.KMD, 'RLC9orGGyti3fHuEKMPUxTa2dCFSXWQdft');
    expect(res).toStrictEqual([
      {
        address: 'RLC9orGGyti3fHuEKMPUxTa2dCFSXWQdft',
        txid: '0dd9cf84e8bf9f750a10c7215cc3920b3ee4fb09aaba4d9ba79b02f91763cac3',
        vout: 1,
        scriptPubKey: '76a91477b568a8ea67051844ef16c836361b07733c07ed88ac',
        amount: 193008.57812948,
        satoshis: 19300857812948,
        height: 3062829,
        confirmations: 9200
      },
      {
        address: 'RLC9orGGyti3fHuEKMPUxTa2dCFSXWQdft',
        txid: '0dd9cf84e8bf9f750a10c7215cc3920b3ee4fb09aaba4d9ba79b02f91763cac3',
        vout: 0,
        scriptPubKey: '76a91477b568a8ea67051844ef16c836361b07733c07ed88ac',
        amount: 818.54148737,
        satoshis: 81854148737,
        height: 3062829,
        confirmations: 9200
      }
    ]);
  });

  it('should return KMD tx broadcast result', async() => {
    const res = await service.broadcastTransaction(ICoin.KMD, '123');
    expect(res).toStrictEqual({'txid': '0deb264cb7c72b03c0d6b2e413473d6039b09703b9489d46d326f8a738d20fd4'});
  });

  it('should return decoded transaction', async() => {
    const rawtx = '0400008085202f890273d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e000000006b483045022100d73576e105a0a1222f127ee846c69ffee5c313b09eb7fb4c08edd79e53f9ccae02202d915ac5848d2f07285ae5b2a2a8c0b890e032608eb756c06b134c5c8b0c0fc9012102bd09bf71ba30e941171fae1ef9b664c6c2472a2ccde96129279bc35e023977e8feffffff73d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e010000008a473044022042f47b8a01f42d15653c75f359a5c1b051cc808e97616ad4910732394ab4dc3a02200cf0d61154ca3b8f270fd0cd5b48d2a9a71ac20ba0f20e26c7b3a87886951f4e014104ae4fbb864e1e837021ce19cd1c788c14de615f153c0337e770cd3dbf02c2e68e0ee01adfd57c896a5d25b87f9256d8ca7436bb54b3a02147101c8fd4a8553749feffffff02e2c5077b020000001976a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac18ff6783500600001976a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac08842c60d19e22000000000000000000000000';
    const decodedTx = bc.decodeTransaction(rawtx);

    expect(decodedTx).toStrictEqual({
      'versionGroupId': 2301567109,
      'overwintered': 1,
      'locktime': 1613530120,
      'txid': 'bf095589a693527b5862c8736ba2962e204cdfe53894e5681e34b149fcd9be23',
      'inputs': [
        {
          'txid': '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673',
          'n': 0,
          'script': '3045022100d73576e105a0a1222f127ee846c69ffee5c313b09eb7fb4c08edd79e53f9ccae02202d915ac5848d2f07285ae5b2a2a8c0b890e032608eb756c06b134c5c8b0c0fc901 02bd09bf71ba30e941171fae1ef9b664c6c2472a2ccde96129279bc35e023977e8',
          'sequence': 4294967294
        },
        {
          'txid': '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673',
          'n': 1,
          'script': '3044022042f47b8a01f42d15653c75f359a5c1b051cc808e97616ad4910732394ab4dc3a02200cf0d61154ca3b8f270fd0cd5b48d2a9a71ac20ba0f20e26c7b3a87886951f4e01 04ae4fbb864e1e837021ce19cd1c788c14de615f153c0337e770cd3dbf02c2e68e0ee01adfd57c896a5d25b87f9256d8ca7436bb54b3a02147101c8fd4a8553749',
          'sequence': 4294967294
        }
      ],
      'outputs': [
        {
          'satoshi': 10654041570,
          'value': '106.54041570',
          'n': 0,
          'scriptPubKey': {
            'asm': 'OP_DUP OP_HASH160 d08b04218bbd0c35b755c1c8de9d67db99fc7a01 OP_EQUALVERIFY OP_CHECKSIG',
            'hex': '76a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac',
            'type': 'pubkeyhash',
            'addresses': [
              'RUHsARjjZchrPxi1DRFVa6P2esSX3tr53s'
            ]
          }
        },
        {
          'satoshi': 6942871781144,
          'value': '69428.71781144',
          'n': 1,
          'scriptPubKey': {
            'asm': 'OP_DUP OP_HASH160 d08b04218bbd0c35b755c1c8de9d67db99fc7a01 OP_EQUALVERIFY OP_CHECKSIG',
            'hex': '76a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac',
            'type': 'pubkeyhash',
            'addresses': [
              'RUHsARjjZchrPxi1DRFVa6P2esSX3tr53s'
            ]
          }
        }
      ]
    });
  });

  it('should get BTC fees', async() => {
    let res = await service.btcFees();
    expect(res).toStrictEqual({
      "fastestFee": 102,
      "halfHourFee": 102,
      "hourFee": 88
    });
    res = await service.btcFees(true);
    expect(res).toStrictEqual([
      {
        "minFee": 0,
        "maxFee": 0,
        "dayCount": 2,
        "memCount": 0,
        "minDelay": 95,
        "maxDelay": 10000,
        "minMinutes": 840,
        "maxMinutes": 10000
      },
      {
        "minFee": 1,
        "maxFee": 2,
        "dayCount": 8620,
        "memCount": 6247,
        "minDelay": 3,
        "maxDelay": 64,
        "minMinutes": 30,
        "maxMinutes": 660
      },
      {
        "minFee": 3,
        "maxFee": 4,
        "dayCount": 19380,
        "memCount": 3025,
        "minDelay": 3,
        "maxDelay": 58,
        "minMinutes": 30,
        "maxMinutes": 600
      }
    ]);
  });

  it('should return ETH fees', async() => {
    let res = await service.ethFees();
    expect(res).toStrictEqual({
      fast: 194,
      average: 91,
      safe: 73
    });
    res = await service.ethFees(true);
    expect(res).toStrictEqual({
      "fast":194,
      "fastest":260,
      "safeLow":73,
      "average":91,
      "block_time":11.559322033898304,
      "blockNum":15510732,
      "speed":0.45054874348977325,
      "safeLowWait":13.3,
      "avgWait":1.2,
      "fastWait":0.5,
      "fastestWait":0.4,
      "gasPriceRange":{
        "4":192.7,
        "6":192.7,
        "8":192.7,
        "10":192.7,
        "20":192.7,
        "30":192.7,
        "40":192.7,
        "50":192.7,
        "60":21.7,
        "70":16.5,
        "73":13.3,
        "80":10.3,
        "90":1.4,
        "91":1.2,
        "100":1,
        "110":0.8,
        "120":0.7,
        "130":0.6,
        "140":0.6,
        "150":0.6,
        "160":0.6,
        "170":0.5,
        "180":0.5,
        "190":0.5,
        "194":0.5,
        "200":0.5,
        "220":0.5,
        "240":0.4,
        "260":0.4
      }
    });
  });
});
