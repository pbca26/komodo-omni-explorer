import { Injectable } from '@nestjs/common';
import { fetchQuery } from '../helpers/fetch';
import { FileStorage } from './storage/storage';
import { ICoinGeckoPriceInfo, IPrice, ICryptoComparePrices, IFiatTickers } from '../types';
import { WebsocketGateway } from '../websocket.gateway';
import { SharedService } from './shared.service';
import log from '../helpers/logger';

// TODO: sync prices on a time basis
const CG_PAGES_MAX_LOOKUP = 1;//131;

@Injectable()
export class SyncPricesService {
  private _prices: IPrice;
  private storage: FileStorage;

  constructor(
    private readonly sharedService: SharedService,
    private websocketGateway: WebsocketGateway
  ) {
    this._prices = {};
    this.storage = new FileStorage('prices');
  }

  get prices() {
    return this._prices;
  }

  getCoinPrice(coin: string, fiat: string | string[]) {
    if (!this._prices[coin]) return {};

    if (Array.isArray(fiat)) {
      const _prices = {}; 
      for (let i = 0; i < fiat.length; i++) {
        if (this._prices[coin][fiat[i]]) {
          _prices[fiat[i]] = this._prices[coin][fiat[i]];
        }
      }

      return _prices;
    } else {
      return this._prices[coin][fiat];
    }
  }

  private async delay(seconds: number) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        log('await finished')
        resolve(true);
      }, seconds * 1000);
    });
  }

  private getFiatPrices(coinPriceUSD: number) {
    const prices = {};
    const fiatTickers = Object.keys(IFiatTickers);

    for (let i = 0; i < fiatTickers.length; i++) {
      const fiatTicker = fiatTickers[i];
      prices[fiatTicker] = (coinPriceUSD / this._prices.BTC.USD) * this._prices.BTC[fiatTicker];
    }

    return prices;
  }

  private async getCoingeckoRates() {
    for (let i = 0; i < CG_PAGES_MAX_LOOKUP; i++) {
      const prices: ICoinGeckoPriceInfo[] = await fetchQuery(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&price_change_percentage=24h,7d&page=${i + 1}`);
      const coinsUpdated = [];

      for (let i = 0; i < prices.length; i++) {
        const symbol = prices[i].symbol.toUpperCase();
        coinsUpdated.push(symbol);

        if (symbol !== 'BTC' && symbol !== 'KMD') {
          this._prices[symbol] = {
            ...this.getFiatPrices(prices[i].current_price),
            change: {
              '24h': Number(prices[i].price_change_percentage_24h_in_currency).toFixed(4),
              '7d': Number(prices[i].price_change_percentage_7d_in_currency).toFixed(4),
            },
            source: 'coingecko',
          };
        } else {
          this._prices[symbol].source = 'coingecko';
          this._prices[symbol].change = {
            '24h': Number(prices[i].price_change_percentage_24h_in_currency).toFixed(4),
            '7d': Number(prices[i].price_change_percentage_7d_in_currency).toFixed(4),
          };
        }
      }
      this.storage.write(this._prices);
      this.sharedService.put('prices', this._prices);
      this.emitPriceChangeToWS(coinsUpdated);
      if (i < CG_PAGES_MAX_LOOKUP) await this.delay(5);
    }
  }

  private async getBasePrice(baseCoin: string, targetCoin: string) {
    const fiatTickers = Object.keys(IFiatTickers);
    const prices: ICryptoComparePrices = await fetchQuery(`https://min-api.cryptocompare.com/data/price?fsym=${baseCoin}&tsyms=${targetCoin},${fiatTickers.join(',')}`);
    const btcPrices = {};

    // find current btc price
    for (let i = 0; i < fiatTickers.length; i++) {
      const ticker = fiatTickers[i];
      if (prices.hasOwnProperty(ticker)) btcPrices[ticker] = Number((1 / prices.BTC * prices[ticker]).toFixed(4));
    }

    return {
      KMD: prices,
      BTC: btcPrices,
    };
  }

  private async emitPriceChangeToWS(coinsUpdated: string[]) {
    const wsClients = this.websocketGateway.getClients('price');
    log(JSON.stringify(wsClients, null, 2));

    for (let i = 0; i < wsClients.length; i++) {
      const res = {};
      const [_coinTickers, _fiatTickers] = wsClients[i].event.filter;
      const coinTickers = _coinTickers.split(',').length ? _coinTickers.split(',') : [_coinTickers];
      const fiatTickers = _fiatTickers.split(',').length ? _fiatTickers.split(',') : [_fiatTickers];

      log('coinTickers', coinTickers)
      log('fiatTickers', fiatTickers)

      for (let a = 0; a < coinTickers.length; a++) {
        if (coinsUpdated.indexOf(coinTickers[a]) > -1) {
          res[coinTickers[a]] = {};

          for (let b = 0; b < fiatTickers.length; b++) {
            res[coinTickers[a]] = {
              ...res[coinTickers[a]],
              [fiatTickers[b]]: this._prices[coinTickers[a]][fiatTickers[b]],
            };
          }
        }
      }

      log(Object.keys(res).length)
      if (Object.keys(res).length) {
        this.websocketGateway.emitSubscribed(wsClients[i].socketId, 'price', res);
      }

      log(JSON.stringify(res, null, 2));
    }
  }

  async init() {
    this._prices = await this.storage.readAll() || [];
    const {KMD, BTC} = await this.getBasePrice('KMD', 'BTC');
    this._prices = {...this._prices, KMD, BTC};
    this.getCoingeckoRates();
  }
}