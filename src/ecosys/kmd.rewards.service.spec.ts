import { Test, TestingModule } from '@nestjs/testing';
import { KMDRewardsService } from './kmd.rewards.service';
import { ConnectorsService } from '../blockchain/connectors.service';

describe('KMDRewardsService', () => {
  let service: KMDRewardsService;
  let connector: ConnectorsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [KMDRewardsService],
      providers: [
        ConnectorsService
      ],
    }).compile();

    service = module.get<KMDRewardsService>(KMDRewardsService);
    connector = module.get<ConnectorsService>(ConnectorsService);
    connector.init(['KMD']);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return KMD rewards for an address', async() => {
    const kmdRewards = await service.getAddressKMDRewards('RLC9orGGyti3fHuEKMPUxTa2dCFSXWQdft');
    expect(kmdRewards).toStrictEqual({
      balance: 193827.11961685002,
      rewards: 137.22035888,
      total: 193964.33997573002
    });
  });
});
