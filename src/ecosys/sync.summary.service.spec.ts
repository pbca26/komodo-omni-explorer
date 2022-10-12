import { Test, TestingModule } from '@nestjs/testing';
import { SyncSummaryService } from './sync.summary.service';
import { ConnectorsService } from '../blockchain/connectors.service';
import { WebsocketGateway } from '../websocket.gateway';
import { WebsocketManagerService } from '../websocket.manager';
import { SharedService } from './shared.service';
import { CoinSupplyService } from './coin.supply.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import eventEmitterConfig from '../event.emitter.config';
import { ICoin } from '../types';

describe('SyncSummaryService', () => {
  let service: SyncSummaryService;
  let connector: ConnectorsService;
  let shared: SharedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncSummaryService],
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

    service = module.get<SyncSummaryService>(SyncSummaryService);
    connector = module.get<ConnectorsService>(ConnectorsService);
    shared = module.get<SharedService>(SharedService);
    connector.init(['KMD']);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init Summary', async () => {
    await service.init([ICoin.KMD]);
    const kmdSummary = service.summary.find(x => x.coin === 'KMD');
    expect(kmdSummary).toStrictEqual({
      coin: 'KMD',
      difficulty: 284383061.1164165,
      blocks: 3070243,
      connections: 206,
      supply: 132991974
    });
    expect(service.summary.length).toBeGreaterThan(0);
    expect(shared.get('summary').length).toBeGreaterThan(0);
    expect(shared.get('summary')[0].coin).toBe('KMD');
    expect(service.summary[0].coin).toBe('KMD');
  });
});