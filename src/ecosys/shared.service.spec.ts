import { Test, TestingModule } from '@nestjs/testing';
import { SharedService } from './shared.service';

describe('SharedService', () => {
  let service: SharedService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SharedService],
    }).compile();

    service = module.get<SharedService>(SharedService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should set and get values', () => {
    service.put('test', 123);
    expect(service.get()).toStrictEqual({'test': 123});
    expect(service.get('test')).toBe(123);
    expect(service.get('test2')).toBe(null);
  });
});
