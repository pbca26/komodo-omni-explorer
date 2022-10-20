import { Test, TestingModule } from '@nestjs/testing';
import { ConnectorsService } from './connectors.service';
import { ICoin } from '../types';

describe('ConnectorsService', () => {
  let service: ConnectorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectorsService],
    }).compile();

    service = module.get<ConnectorsService>(ConnectorsService);
    service.init([ICoin.KMD]);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should init connectors service with KMD added to the list', () => {
    expect(service.coins).toEqual(['KMD']);
    expect(service.connectors['KMD']).toBeDefined();
  });

  it('should check if coins are enabled', () => {
    expect(service.isCoinEnabled(ICoin.KMD)).toEqual(true);
    expect(service.isCoinEnabled(ICoin.RICK)).toEqual(false);
  });
});
