import { ExecutionContext } from '@nestjs/common';
import { of } from 'rxjs';
import { spy } from 'hanbi';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AddressInterseptor,
  FiatTickerInterseptor,
  CoinTickerInterseptor,
  ConnectorInterseptor
} from './interseptors';
import { ConnectorsService } from '../blockchain/connectors.service';
import BlockchainCore from '../blockchain/core';
import { SyncPricesService } from './sync.prices.service';
import { WebsocketGateway } from '../websocket.gateway';
import { WebsocketManagerService } from '../websocket.manager';
import { SharedService } from './shared.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import eventEmitterConfig from '../event.emitter.config';

const createCtxMock = (partial: Partial<ExecutionContext>): ExecutionContext => ({
  getArgByIndex: spy().handler,
  getArgs: spy().handler,
  getClass: () =>
    ({
      name: 'something',
    } as any),
  getHandler: () =>
    ({
      name: 'something',
    } as any),
  getType: spy().handler,
  switchToHttp: spy().handler,
  switchToRpc: spy().handler,
  switchToWs: spy().handler,
  ...partial,
});
const noop = () => {
  /* no-op */
};

// create the mock CallHandler for the interceptor
const next = {
  handle: () => of('test'),
};

describe('FiatTickerInterseptor', () => {
  let interceptor: FiatTickerInterseptor;

  beforeEach(() => {
    interceptor = new FiatTickerInterseptor();
  });
  
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should successfully return', (done) => {
    const httpContext: Partial<ExecutionContext> = {
      getType: () => 'http',
      getArgs: () => [{params: {fiat: 'USD'}}],
      setRequestId: noop,
    } as any;
    const ctxMock = createCtxMock(httpContext);
    interceptor.intercept(ctxMock, next).subscribe({
      next: (value) => {
        expect(value).toEqual('test');
      },
      error: (error) => {
        throw error;
      },
      complete: () => {
        done();
      },
    });
  });

  it('should successfully return for 2 fiat tickers', (done) => {
    const httpContext: Partial<ExecutionContext> = {
      getType: () => 'http',
      getArgs: () => [{params: {fiat: 'USD,123'}}],
      setRequestId: noop,
    } as any;
    const ctxMock = createCtxMock(httpContext);
    interceptor.intercept(ctxMock, next).subscribe({
      next: (value) => {
        expect(value).toEqual('test');
      },
      error: (error) => {
        throw error;
      },
      complete: () => {
        done();
      },
    });
  });

  it('should throw error', (done) => {
    const httpContext: Partial<ExecutionContext> = {
      getType: () => 'http',
      getArgs: () => [{params: {fiat: '123'}}],
      setRequestId: noop,
    } as any;
    const ctxMock = createCtxMock(httpContext);

    try {
      interceptor.intercept(ctxMock, next).subscribe(() => {
        done();
      });
    } catch (e) {
      expect(e.response).toStrictEqual({ error: 'wrong fiat ticker', status: 400 });
      done();
    }
  });
});

describe('CoinTickerInterseptor', () => {
  let interceptor: CoinTickerInterseptor;
  let prices: SyncPricesService;
  
  beforeEach(async() => {
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

    prices = module.get<SyncPricesService>(SyncPricesService);
    await prices.init();
    interceptor = new CoinTickerInterseptor(prices);
  });
  
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should successfully return', (done) => {
    const httpContext: Partial<ExecutionContext> = {
      getType: () => 'http',
      getArgs: () => [{params: {coin: 'KMD'}}],
      setRequestId: noop,
    } as any;
    const ctxMock = createCtxMock(httpContext);
    interceptor.intercept(ctxMock, next).subscribe({
      next: (value) => {
        expect(value).toEqual('test');
      },
      error: (error) => {
        throw error;
      },
      complete: () => {
        done();
      },
    });
  });

  it('should successfully return for 2 coin tickers', (done) => {
    const httpContext: Partial<ExecutionContext> = {
      getType: () => 'http',
      getArgs: () => [{params: {coin: 'KMD,BTC'}}],
      setRequestId: noop,
    } as any;
    const ctxMock = createCtxMock(httpContext);
    interceptor.intercept(ctxMock, next).subscribe({
      next: (value) => {
        expect(value).toEqual('test');
      },
      error: (error) => {
        throw error;
      },
      complete: () => {
        done();
      },
    });
  });

  it('should throw error', (done) => {
    const httpContext: Partial<ExecutionContext> = {
      getType: () => 'http',
      getArgs: () => [{params: {coin: '123zcxwqd'}}],
      setRequestId: noop,
    } as any;
    const ctxMock = createCtxMock(httpContext);

    try {
      interceptor.intercept(ctxMock, next).subscribe(() => {
        done();
      });
    } catch (e) {
      expect(e.response).toStrictEqual({error: 'coin price is not available', status: 400});
      done();
    }
  });
});

describe('AddressInterseptor', () => {
  let interceptor: AddressInterseptor;
  
  beforeEach(async() => {
    interceptor = new AddressInterseptor(new BlockchainCore);
  });
  
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should successfully return', (done) => {
    const httpContext: Partial<ExecutionContext> = {
      getType: () => 'http',
      getArgs: () => [{params: {address: 'RG6xr5YTV4GcDB2iLTDP9zC64cvtNj6ze4'}}],
      setRequestId: noop,
    } as any;
    const ctxMock = createCtxMock(httpContext);
    interceptor.intercept(ctxMock, next).subscribe({
      next: (value) => {
        expect(value).toEqual('test');
      },
      error: (error) => {
        throw error;
      },
      complete: () => {
        done();
      },
    });
  });

  it('should throw error', (done) => {
    const httpContext: Partial<ExecutionContext> = {
      getType: () => 'http',
      getArgs: () => [{params: {address: '123zcxwqd'}}],
      setRequestId: noop,
    } as any;
    const ctxMock = createCtxMock(httpContext);

    try {
      interceptor.intercept(ctxMock, next).subscribe(() => {
        done();
      });
    } catch (e) {
      expect(e.response).toStrictEqual({error: 'address is invalid', status: 400});
      done();
    }
  });
});

describe('ConnectorInterseptor', () => {
  let interceptor: ConnectorInterseptor;
  let connector: ConnectorsService;
  
  beforeEach(async() => {
    connector = new ConnectorsService();
    connector.init(['KMD']);
    interceptor = new ConnectorInterseptor(connector);
  });
  
  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should successfully return', (done) => {
    const httpContext: Partial<ExecutionContext> = {
      getType: () => 'http',
      getArgs: () => [{params: {coin: 'KMD'}}],
      setRequestId: noop,
    } as any;
    const ctxMock = createCtxMock(httpContext);
    interceptor.intercept(ctxMock, next).subscribe({
      next: (value) => {
        expect(value).toEqual('test');
      },
      error: (error) => {
        throw error;
      },
      complete: () => {
        done();
      },
    });
  });

  it('should throw error', (done) => {
    const httpContext: Partial<ExecutionContext> = {
      getType: () => 'http',
      getArgs: () => [{params: {coin: '123zcxwqd'}}],
      setRequestId: noop,
    } as any;
    const ctxMock = createCtxMock(httpContext);

    try {
      interceptor.intercept(ctxMock, next).subscribe(() => {
        done();
      });
    } catch (e) {
      expect(e.response).toStrictEqual({error: 'coin is not enabled', status: 400});
      done();
    }
  });
});