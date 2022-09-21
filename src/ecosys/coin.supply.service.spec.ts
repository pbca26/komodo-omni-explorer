import { Test, TestingModule } from '@nestjs/testing';
import { CoinSupplyService } from './coin.supply.service';

describe('CoinSupplyService', () => {
  let service: CoinSupplyService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CoinSupplyService],
    }).compile();

    service = module.get<CoinSupplyService>(CoinSupplyService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return coin supply', () => {
    expect(service.getSupplyData('KMD')).toEqual(132991974);
    expect(service.getSupplyData('ABC')).toEqual(-1);
  });
});
