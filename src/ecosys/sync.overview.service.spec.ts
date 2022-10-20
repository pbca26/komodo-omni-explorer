import { Test, TestingModule } from '@nestjs/testing';
import { SyncOverviewService } from './sync.overview.service';
import { ConnectorsService } from '../blockchain/connectors.service';
import { WebsocketGateway } from '../websocket.gateway';
import { WebsocketManagerService } from '../websocket.manager';
import { SharedService } from './shared.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import eventEmitterConfig from '../event.emitter.config';
import { ICoin } from '../types';

describe('SyncOverviewService', () => {
  let service: SyncOverviewService;
  let connector: ConnectorsService;
  let shared: SharedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncOverviewService],
      providers: [
        ConnectorsService,
        WebsocketGateway,
        WebsocketManagerService,
        SharedService
      ],
      imports: [
        EventEmitterModule.forRoot(eventEmitterConfig),
      ]
    }).compile();

    service = module.get<SyncOverviewService>(SyncOverviewService);
    connector = module.get<ConnectorsService>(ConnectorsService);
    shared = module.get<SharedService>(SharedService);
    connector.init(['KMD']);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init Overview', async () => {
    await service.init([ICoin.KMD]);
    expect(service.overview.length).toBeGreaterThan(0);
    expect(shared.get('overview').length).toBeGreaterThan(0);
    expect(shared.get('overview')[0].coin).toBe('KMD');
    expect(service.overview[0].coin).toBe('KMD');
  });
});