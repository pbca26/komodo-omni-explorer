import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { ConnectorsService } from '../blockchain/connectors.service';
import BlockchainCore from '../blockchain/core';
import { throwCustomError, ERRORS } from './error.handlers';
import config from '../config';
import { fetchQuery } from '../helpers/fetch';
import { IFiatTickers } from '../types';
import { SyncPricesService } from './sync.prices.service';
import log from '../helpers/logger';

@Injectable()
export class ConnectorInterseptor implements NestInterceptor {
  constructor(private connectorsService: ConnectorsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [req] = context.getArgs();
    log('ConnectorInterseptor...');
    log(context)
    log('coin', req.params.coin)

    const checkCoinIsConnected = (coin: string) => {
      return this.connectorsService.connectors.hasOwnProperty(coin);
    };

    // stop route handler execution if coin check failed
    return checkCoinIsConnected(req.params.coin) ? next.handle().pipe() : throwError(throwCustomError(ERRORS.ERR_COIN_NOT_ENABLED));
  }
}

@Injectable()
export class AddressInterseptor implements NestInterceptor {
  constructor(private blockchainCore: BlockchainCore) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [req] = context.getArgs();
    log('AddressInterseptor...');
    log(req.params.address)

    // stop route handler execution if address check failed
    return this.blockchainCore.validatePublicAddress(req.params.address) ? next.handle().pipe() : throwError(throwCustomError(ERRORS.ERR_ADDRESS_INVALID));
  }
}

@Injectable()
export class GoogleCaptchaInterseptor implements NestInterceptor {
  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const [req] = context.getArgs();
    log('GoogleCaptchaInterseptor...');

    if (config.recaptchaKey) {
      const secretKey = config.recaptchaKey;
      return fetchQuery(`https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${req.query['grecaptcha']}&remoteip=${req.connection.remoteAddress}`)
      .then((verificationResult) => {
        log('captcha verificationResult', verificationResult);
        if (!verificationResult.success) {
          throwError(throwCustomError(ERRORS.ERR_CAPTCHA_VERIFICATION));
        } else {
          return next.handle();
        }
      });
    } else {
      return next.handle();
    }
  }
}

@Injectable()
export class FiatTickerInterseptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [req] = context.getArgs();
    log('FiatTickerInterseptor...');
    log(req.params.fiat)

    const validateTickers = () => {
      if (req.params.fiat.indexOf(',')) {
        const splitFiatTickers = req.params.fiat.split(',');
        let validatedTickers = [];

        for (let i = 0; i < splitFiatTickers.length; i++) {
          if (Object.keys(IFiatTickers).indexOf(splitFiatTickers[i]) > -1) {
            validatedTickers.push(splitFiatTickers[i]);
          }
        }

        req.params.fiat = validatedTickers.join(',');
        log('validatedFiatTickers', validatedTickers)
        return validatedTickers.length;
      }
    }

    // stop route handler execution if fiat ticker check failed
    return validateTickers() ? next.handle().pipe() : throwError(throwCustomError(ERRORS.ERR_FIAT_TICKER_WRONG));
  }
}

@Injectable()
export class CoinTickerInterseptor implements NestInterceptor {
  constructor(private syncPricesService: SyncPricesService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const [req] = context.getArgs();
    log('CoinTickerInterseptor...');
    log(req.params.coin)

    const validateCoinTickers = () => {
      if (req.params.coin.indexOf(',')) {
        const splitCoinTickers = req.params.coin.split(',');
        let validatedTickers = [];

        for (let i = 0; i < splitCoinTickers.length; i++) {
          if (this.syncPricesService.prices.hasOwnProperty(splitCoinTickers[i])) {
            validatedTickers.push(splitCoinTickers[i]);
          }
        }

        req.params.coin = validatedTickers.join(',');
        log('validatedCoinTickers', validatedTickers)
        return validatedTickers.length;
      }
    }

    // stop route handler execution if coin ticker check failed
    return validateCoinTickers() ? next.handle().pipe() : throwError(throwCustomError(ERRORS.ERR_COIN_TICKER_NA));
  }
}