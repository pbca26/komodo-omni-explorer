import { Injectable } from '@nestjs/common';
import { Connectors } from './connectors';
import { ICoins } from 'src/types';
import log from '../helpers/logger';

@Injectable()
export class ConnectorsService {
  private _connectors: Connectors;

  init(coins: ICoins[]) {
    log('ConnectorsService inst');
    this._connectors = new Connectors();
    for (let i = 0; i < coins.length; i++) {
      this._connectors.addConnection(coins[i]);
    }
    log('conns', this._connectors.connections);
  }

  isCoinEnabled(coin: ICoins) {
    return this._connectors.connections.hasOwnProperty(coin);
  }

  get connectors() {
    return this._connectors.connections;
  }

  get coins() {
    return this._connectors.coins;
  }
}