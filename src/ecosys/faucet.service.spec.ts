import { Test, TestingModule } from '@nestjs/testing';
import { FaucetService } from './faucet.service';
import { ConnectorsService } from '../blockchain/connectors.service';
import { WebsocketGateway } from '../websocket.gateway';
import { WebsocketManagerService } from '../websocket.manager';
import { EventEmitterModule } from '@nestjs/event-emitter';
import eventEmitterConfig from '../event.emitter.config';
import BlockchainCore from '../blockchain/core';
import { SharedService } from './shared.service';

jest.mock('../config', () => {
  return {
    'default': {
      faucet: {
        seed: 'atomicexplorer',
        minUtxoCount: 2,
        coins: {
          AXO: {
            value: [100000, 200000],
            occurence: {
              type: 'number',
              value: 1,
            },
          },
          KOIN: {
            value: [100000, 200000],
            occurence: {
              type: 'time',
              value: 60
            },
          },
          PGT: {
            value: [100000, 200000],
            occurence: {
              type: 'time',
              value: 2
            },
          },
          MESH: {
            value: [100000, 200000],
            occurence: {
              type: 'range',
              value: 0,
              tsStart: Date.now() - 10000,
              tsEnd: Date.now() - 1000,
            },
          },
          CLC: {
            value: [100000, 200000],
            occurence: {
              type: 'range',
              value: 0,
              tsStart: Date.now() + 1000000,
              tsEnd: Date.now() + 1000000000,
            },
          },
          DEX: {
            value: [100000, 200000],
            occurence: {
              type: 'range',
              value: 0,
              tsStart: Date.now() - 10000,
              tsEnd: Date.now() + 10000000000,
            },
          },
        }
      }
    }
  }
});

describe('FaucetService', () => {
  let service: FaucetService;
  let connector: ConnectorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FaucetService],
      providers: [
        ConnectorsService,
        WebsocketGateway,
        WebsocketManagerService,
        BlockchainCore,
        SharedService
      ],
      imports: [
        EventEmitterModule.forRoot(eventEmitterConfig),
      ]
    }).compile();

    service = module.get<FaucetService>(FaucetService);
    connector = module.get<ConnectorsService>(ConnectorsService);
    connector.init(['AXO', 'KOIN', 'MESH', 'CLC', 'DEX', 'PGT']);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init Faucet', async () => {
    await service.init();
  });

  it('should not split AXO utxos', async() => {
    try {
      await service.makeFaucetSplits('AXO');
    } catch (e) {
      expect(e.response).toStrictEqual({ error: 'enough min utxo count', status: 400 });
    }
  });

  it('should make a send from AXO faucet', async() => {
    const res = await service.makeFaucetSend('AXO', 'RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4');

    expect(res).toStrictEqual({
      "rawtx":"0400008085202f890115640887a20d81e444cbdf9e8da387019e67fbaf7372e1c9bbaf58e453685b5f010000006b483045022100849aaa35ce036fc707864682e35af3b99f1bf8bb07ff2696ea2b71a75a8d45b302204d90bd20f6a3b482e47c6f0bc4abf40edf6eade8f47e1b0cabf7c4eac22d6128012103da7efbbe1e2ab53504f5c0629c2affa27b771dd6274c5c23932268ff1a217e0affffffff03a0860100000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88ac400d0300000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88acc0a96f1c000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88ac00000000000000000000000000000000000000",
      "broadcast":{
        "txid":"0deb264cb7c72b03c0d6b2e413473d6039b09703b9489d46d326f8a738d20fd4"
      },
      "value":[
        100000,
        200000
      ]
    });

    try {
      await service.makeFaucetSend('AXO', 'RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4');
    } catch (e) {
      expect(e.response).toStrictEqual({ error: 'you had enough already', status: 400 });
    }
  });

  it('should make a send from KOIN faucet', async() => {
    const res = await service.makeFaucetSend('KOIN', 'RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4');

    expect(res).toStrictEqual({
      "rawtx":"0400008085202f890115640887a20d81e444cbdf9e8da387019e67fbaf7372e1c9bbaf58e453685b5f010000006b483045022100849aaa35ce036fc707864682e35af3b99f1bf8bb07ff2696ea2b71a75a8d45b302204d90bd20f6a3b482e47c6f0bc4abf40edf6eade8f47e1b0cabf7c4eac22d6128012103da7efbbe1e2ab53504f5c0629c2affa27b771dd6274c5c23932268ff1a217e0affffffff03a0860100000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88ac400d0300000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88acc0a96f1c000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88ac00000000000000000000000000000000000000",
      "broadcast":{
        "txid":"0deb264cb7c72b03c0d6b2e413473d6039b09703b9489d46d326f8a738d20fd4"
      },
      "value":[
        100000,
        200000
      ]
    });

    try {
      await service.makeFaucetSend('KOIN', 'RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4');
    } catch (e) {
      expect(e.response.error.indexOf('you had enough already, come back in')).toBeGreaterThan(-1);
    }
  });

  it('should not make a send from CLC faucet', async() => {
    try {
      await service.makeFaucetSend('CLC', 'RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4');
    } catch (e) {
      expect(e.response.error.indexOf('wrong time, come back in')).toBeGreaterThan(-1);
    }
  });

  it('should not make a send from MESH faucet', async() => {
    try {
      await service.makeFaucetSend('MESH', 'RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4');
    } catch (e) {
      expect(e.response).toStrictEqual({ error: 'wrong time, event is already finished', status: 400 });
    }
  });

  it('should make a send from DEX faucet', async() => {
    let res = await service.makeFaucetSend('DEX', 'RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4');

    expect(res).toStrictEqual({
      "rawtx":"0400008085202f890115640887a20d81e444cbdf9e8da387019e67fbaf7372e1c9bbaf58e453685b5f010000006b483045022100849aaa35ce036fc707864682e35af3b99f1bf8bb07ff2696ea2b71a75a8d45b302204d90bd20f6a3b482e47c6f0bc4abf40edf6eade8f47e1b0cabf7c4eac22d6128012103da7efbbe1e2ab53504f5c0629c2affa27b771dd6274c5c23932268ff1a217e0affffffff03a0860100000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88ac400d0300000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88acc0a96f1c000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88ac00000000000000000000000000000000000000",
      "broadcast":{
        "txid":"0deb264cb7c72b03c0d6b2e413473d6039b09703b9489d46d326f8a738d20fd4"
      },
      "value":[
        100000,
        200000
      ]
    });

    res = await service.makeFaucetSend('DEX', 'RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4');

    expect(res).toStrictEqual({
      "rawtx":"0400008085202f890115640887a20d81e444cbdf9e8da387019e67fbaf7372e1c9bbaf58e453685b5f010000006b483045022100849aaa35ce036fc707864682e35af3b99f1bf8bb07ff2696ea2b71a75a8d45b302204d90bd20f6a3b482e47c6f0bc4abf40edf6eade8f47e1b0cabf7c4eac22d6128012103da7efbbe1e2ab53504f5c0629c2affa27b771dd6274c5c23932268ff1a217e0affffffff03a0860100000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88ac400d0300000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88acc0a96f1c000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88ac00000000000000000000000000000000000000",
      "broadcast":{
        "txid":"0deb264cb7c72b03c0d6b2e413473d6039b09703b9489d46d326f8a738d20fd4"
      },
      "value":[
        100000,
        200000
      ]
    });
  });

  it('should not split PGT utxos', () => {
    expect(async() => await service.makeFaucetSplits('PGT')).rejects.toThrowError('no utxos');
  });

  it('should split KOIN utxos', async() => {
    const res = await service.makeFaucetSplits('KOIN');

    expect(res).toStrictEqual({
      "rawtx":"0400008085202f890115640887a20d81e444cbdf9e8da387019e67fbaf7372e1c9bbaf58e453685b5f010000006a4730440220486de0f7cfd1c921c7be52e365b6408408265ec0d735b2aa6237713eb65c313402202f52184eb2630dfcfe07d58fa0a610c938e856cd2a474d9c197b45a90c1b9f11012103da7efbbe1e2ab53504f5c0629c2affa27b771dd6274c5c23932268ff1a217e0affffffff0210270000000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88ac9016741c000000001976a9144ad9acf5cdded37ddfd003bdaefcc379c26e327a88ac00000000000000000000000000000000000000",
      "broadcast":{
        "txid":"0deb264cb7c72b03c0d6b2e413473d6039b09703b9489d46d326f8a738d20fd4"
      }
    });
  });
});