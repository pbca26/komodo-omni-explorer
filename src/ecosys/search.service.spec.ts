import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { ConnectorsService } from '../blockchain/connectors.service';
import { WebsocketGateway } from '../websocket.gateway';
import { WebsocketManagerService } from '../websocket.manager';
import { SharedService } from './shared.service';
import { CoinSupplyService } from './coin.supply.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import eventEmitterConfig from '../event.emitter.config';

describe('SearchService', () => {
  let service: SearchService;
  let connector: ConnectorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SearchService],
      providers: [
        ConnectorsService,
        WebsocketGateway,
        WebsocketManagerService,
        SharedService,
        CoinSupplyService
      ],
      imports: [
        EventEmitterModule.forRoot(eventEmitterConfig),
      ]
    }).compile();

    service = module.get<SearchService>(SearchService);
    connector = module.get<ConnectorsService>(ConnectorsService);
    connector.init(['KMD']);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should find KMD tx by txid', async () => {
    const res = await service.getTransactionById(['KMD', 'RICK'], '5778a8ab87737b29b2eae69a799293d1f67c7e4fc3c9b5b231d11ef939fee949');

    expect(res).toStrictEqual({
      "coin": "KMD",
      "transaction": {
        "txid": "5778a8ab87737b29b2eae69a799293d1f67c7e4fc3c9b5b231d11ef939fee949",
        "version": 4,
        "locktime": 1626599133,
        "vin": [
          {
            "txid": "4912c5aaf4d7becda6f05eaa6aced3e65bc8ee3a92f1a15f5a8e55104d881105",
            "vout": 0,
            "sequence": 4294967295,
            "n": 0,
            "scriptSig": {
              "hex": "483045022100e97e53d21e7f0c038bd10f52a80e0732efd420782f24952486ea5d87df6c261702202057e2ab04541df7b44c0f6328c9970bb70f7051762e4ee521ae0140c370c949012102743d2afdb88ede68fb5938e961b1f41c2b6267b3286516543eb4e4ab87ad0d0a",
              "asm": "3045022100e97e53d21e7f0c038bd10f52a80e0732efd420782f24952486ea5d87df6c261702202057e2ab04541df7b44c0f6328c9970bb70f7051762e4ee521ae0140c370c949[ALL] 02743d2afdb88ede68fb5938e961b1f41c2b6267b3286516543eb4e4ab87ad0d0a"
            },
            "addr": "RDbGxL8QYdEp8sMULaVZS2E6XThcTKT9Jd",
            "valueSat": 8946,
            "value": 0.00008946,
            "doubleSpentTxID": null
          }
        ],
        "vout": [
          {
            "value": "0.00007946",
            "n": 0,
            "scriptPubKey": {
              "hex": "76a9143b004bd8eda2c10b16c2ed70e79addab1bbc231f88ac",
              "asm": "OP_DUP OP_HASH160 3b004bd8eda2c10b16c2ed70e79addab1bbc231f OP_EQUALVERIFY OP_CHECKSIG",
              "addresses": [
                "REfAJRJhJPgFvb99tDJqBAbdz3JQUq7yUV"
              ],
              "type": "pubkeyhash"
            },
            "spentTxId": "e82fc842659f3552ed8beab5ed1e80c782a64a271bcbccfc2021820f02a2e41d",
            "spentIndex": 0,
            "spentHeight": 2487916
          }
        ],
        "vjoinsplit": [],
        "blockhash": "000000013efa637c47f03482f84bba0960585695e9e50a4843d97672699ade37",
        "blockheight": 2484942,
        "confirmations": 585323,
        "time": 1626601144,
        "blocktime": 1626601144,
        "valueOut": 0.00007946,
        "size": 211,
        "valueIn": 0.00008946,
        "fees": 0.00001,
        "fOverwintered": true,
        "nVersionGroupId": 2301567109,
        "nExpiryHeight": 0,
        "valueBalance": 0,
        "spendDescs": [],
        "outputDescs": []
      }
    });
  });

  it('should return KMD address balance', async () => {
    const res = await service.getAddressBalance(['KMD'], 'RLC9orGGyti3fHuEKMPUxTa2dCFSXWQdft');
    expect(res).toStrictEqual([{"balance": 193827.11961685002, "coin": "KMD"}]);
  });

  it('should return KMD address tx history', async () => {
    const res = await service.getAddressTransactions(['KMD'], 'RLC9orGGyti3fHuEKMPUxTa2dCFSXWQdft');

    expect(res).toStrictEqual([
      {
        "coin":"KMD",
        "transactions":[
          {
            "coin":"KMD",
            "height":3062829,
            "timestamp":1662283104,
            "txid":"0dd9cf84e8bf9f750a10c7215cc3920b3ee4fb09aaba4d9ba79b02f91763cac3"
          },
          {
            "coin":"KMD",
            "height":2993432,
            "timestamp":1658060289,
            "txid":"caff670e3df84edb8b220b4e229d67c70e2f4ba372261214f4badcbd551cf456"
          },
          {
            "coin":"KMD",
            "height":2950850,
            "timestamp":1655420901,
            "txid":"1b6c42b64e8d757139331671112c60f1a1b6d07923b0e8337e5beda83bc2af3f"
          },
          {
            "coin":"KMD",
            "height":2923478,
            "timestamp":1653600998,
            "txid":"016dbb398fae20e8150124f133cd087e364f3a95403ad889baed732e8bb15f3e"
          }
        ]
      }
   ]);
  });
});