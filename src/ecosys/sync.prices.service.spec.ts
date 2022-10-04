import { Test, TestingModule } from '@nestjs/testing';
import { SyncPricesService } from './sync.prices.service';
import { WebsocketGateway } from '../websocket.gateway';
import { WebsocketManagerService } from '../websocket.manager';
import { SharedService } from './shared.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import eventEmitterConfig from '../event.emitter.config';

describe('SyncSummaryService', () => {
  let service: SyncPricesService;
  let shared: SharedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SyncPricesService],
      providers: [
        WebsocketGateway,
        WebsocketManagerService,
        SharedService,
      ],
      imports: [
        EventEmitterModule.forRoot(eventEmitterConfig),
      ]
    }).compile();

    service = module.get<SyncPricesService>(SyncPricesService);
    shared = module.get<SharedService>(SharedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init Prices service', async () => {
    await service.init();
    expect(service.getCoinPrice('ndhjffghshdf', 'USD')).toStrictEqual({});
    expect(service.getCoinPrice('KMD', 'USD')).toBe(0.2767);
    expect(shared.get('prices')['KMD']['USD']).toBe(0.2767);
    expect(service.getCoinPrice('KMD', ['USD', 'EUR'])).toStrictEqual({"EUR": 0.2735, "USD": 0.2767});
    expect(service.getCoinPrice('BNB', ['USD', 'EUR'])).toStrictEqual({"EUR": 290.1847849959255, "USD": 293.58});
  });
});