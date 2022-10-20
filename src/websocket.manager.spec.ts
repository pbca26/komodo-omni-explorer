import { Test, TestingModule } from '@nestjs/testing';
import { WebsocketManagerService } from './websocket.manager';

describe('WebsocketManagerService', () => {
  let service: WebsocketManagerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [WebsocketManagerService],
    }).compile();

    service = module.get<WebsocketManagerService>(WebsocketManagerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw error trying to remove non-existent client', () => {
    expect(() => service.remove('123')).toThrow('client is not connected');
  });

  it('should add a new client', () => {
    service.add('123');
    expect(service.clients.length).toBe(1);
    expect(service.clients[0].socketId).toBe('123');
    expect(service.clients[0].subscribedEvents.length).toBe(0);
  });

  it('should add and remove a client', () => {
    service.add('456');
    expect(service.clients.length).toBe(1);
    expect(service.clients[0].socketId).toBe('456');
    expect(service.clients[0].subscribedEvents.length).toBe(0);
    
    service.remove('456');
    expect(service.clients.length).toBe(0);
  });

  it('should add a client and throw an error trying to unsubscribe from event', () => {
    service.add('456');
    expect(service.clients.length).toBe(1);
    expect(service.clients[0].socketId).toBe('456');
    expect(service.clients[0].subscribedEvents.length).toBe(0);
    
    expect(() => service.unsubscribe('456', 'price')).toThrow('client is not subscribed to this event');
    expect(() => service.unsubscribe('456', '123')).toThrow('unknown channel');
  });

  it('should add a client and subscribe to an event', () => {
    service.add('456');
    expect(service.clients.length).toBe(1);
    expect(service.clients[0].socketId).toBe('456');
    expect(service.clients[0].subscribedEvents.length).toBe(0);
    service.subscribe('456', {
      channel: 'price',
      filter: ['KMD']
    });
    
    expect(service.clients[0].subscribedEvents).toStrictEqual([{"channel": "price", "filter": ["KMD"]}]);
    expect(() => service.subscribe('456', {
      channel: 'price',
      filter: ['KMD']
    })).toThrow('only one event of each type is allowed per client');

    service.subscribe('456', {
      channel: 'search',
      filter: ['123']
    });
    expect(service.clients[0].subscribedEvents).toStrictEqual([
      {"channel": "price", "filter": ["KMD"]},
      {"channel": "search", "filter": ["123"]}
    ]);

    service.unsubscribe('456', 'search');
    expect(service.clients[0].subscribedEvents).toStrictEqual([{"channel": "price", "filter": ["KMD"]}]);
  });
});
