import { Test, TestingModule } from '@nestjs/testing';
import { TrollboxService } from './trollbox.service';
import { ConnectorsService } from '../blockchain/connectors.service';
import { WebsocketGateway } from '../websocket.gateway';
import { WebsocketManagerService } from '../websocket.manager';
import { SharedService } from './shared.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import eventEmitterConfig from '../event.emitter.config';
import BlockchainCore from '../blockchain/core';

describe('TrollboxService', () => {
  let service: TrollboxService;
  let connector: ConnectorsService;
  let shared: SharedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TrollboxService],
      providers: [
        ConnectorsService,
        WebsocketGateway,
        WebsocketManagerService,
        SharedService,
        BlockchainCore
      ],
      imports: [
        EventEmitterModule.forRoot(eventEmitterConfig),
      ]
    }).compile();

    service = module.get<TrollboxService>(TrollboxService);
    connector = module.get<ConnectorsService>(ConnectorsService);
    shared = module.get<SharedService>(SharedService);
    connector.init(['RICK']);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init Trollbox and get messages', async () => {
    await service.init();
    const messages = {
      "RICK": [
        {
          "txid": "223a45fe84d586cf4f617d13ed8323a818c99106f41d8511c71ad15989f914cf",
          "data": {
            "version": 1,
            "encrypted": 0,
            "tag": "trollbox",
            "content": {
              "version": 1,
              "parent": "0000000000000000000000000000000000000000000000000000000000000000",
              "title": "faketoshi",
              "body": "btc is the king!"
            }
          },
          "height": 1571801,
          "time": "20 Aug 2022 20:33"
        },
        {
          "txid": "178b8ac37a5a4475b36dbf2782f0ac7d3f4e8969c407346e2146e0a615823351",
          "data": {
            "version": 1,
            "encrypted": 0,
            "tag": "trollbox",
            "content": {
              "version": 1,
              "parent": "0000000000000000000000000000000000000000000000000000000000000000",
              "title": "faketoshi",
              "body": "btc is the best coin!"
            }
          },
          "height": 1571792,
          "time": "20 Aug 2022 20:24"
        },
        {
          "txid": "e8cdaf390ed6761b1d57da532fe0c21098ab517c451d8a5ed5bc631b9f24827c",
          "data": {
            "version": 1,
            "encrypted": 0,
            "tag": "trollbox",
            "content": {
              "version": 1,
              "parent": "0000000000000000000000000000000000000000000000000000000000000000",
              "title": "faketoshi",
              "body": "btc ftw!"
            }
          },
          "height": 1571787,
          "time": "20 Aug 2022 20:20"
        },
        {
          "txid": "f2bbe4534f5629c830e0ee913b0af125a019fb826b3c5cd4330b75bfcb3e8eb2",
          "data": {
            "version": 1,
            "encrypted": 0,
            "tag": "trollbox",
            "content": {
              "version": 1,
              "parent": "0000000000000000000000000000000000000000000000000000000000000000",
              "title": "Anonymous troll",
              "body": "sup suckaz"
            }
          },
          "height": 1571748,
          "time": "20 Aug 2022 19:44"
        }
      ]
    };
    expect(service.messages).toStrictEqual(messages);
    expect(shared.get('trollbox')).toStrictEqual(messages);
  });

  it('should send Trollbox message', async () => {
    const res = await service.makeTrollboxSend('this is a test message', 'trollbox test');
    expect(res).toStrictEqual(      {
      "rawtx": "0400008085202f8901f238939c405d6948647d8fbceb94d376036e4d5ffc1b494597f3528a2bb0189f010000006a47304402201971a087e966a4cac201b258c5b3d9fafbf11d89983a6cacd0133d4117d94bc20220348fb40dda2d1b396e6d58c5192913f33b803eb38bfeef47f8b99065509c4a46012102f002a8a7a2211cb84b7539d5c93a3111fc67e0d7b2948fbe38a6beb55bd74df0ffffffff0310270000000000001976a914ea1b1bf6d5f3c1d711694eb040f517837d3e0c9888acda4a771c000000001976a914ea1b1bf6d5f3c1d711694eb040f517837d3e0c9888ac0100000000000000fd3c026a4d38023330333133303734373236663663366336323666373830303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030333130303030333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333033303330333037343732366636633663363236663738323037343635373337343030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030373436383639373332303639373332303631323037343635373337343230366436353733373336313637363500000000000000000000000000000000000000",
      "broadcast": {
        "txid": "0deb264cb7c72b03c0d6b2e413473d6039b09703b9489d46d326f8a738d20fd4"
      },
      "value": 10000
    });
  });

  it('should return an error validating malformed Trollbox message', async () => {
    try {
      await service.makeTrollboxSend('', '');
    } catch (e) {
      expect(e.response).toStrictEqual({
        error: 'trollbox message is malformed, content body length cannot be zero',
        status: 400
      });
    }

    try {
      await service.makeTrollboxSend('123', '');
    } catch (e) {
      expect(e.response).toStrictEqual({
        error: 'trollbox message is malformed, content title length cannot be zero',
        status: 400
      });
    }
  });
});