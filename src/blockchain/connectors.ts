import { InsightExplorerConnector } from './blockchain.service';
import { ICoins } from 'src/types';

abstract class ConnectorsAbsctract {
  coins: ICoins[];
  protected _connections: InsightExplorerConnector[];
  
  constructor(coins: ICoins[] = []) {
    this.coins = coins;
  }

  //abstract initConnections(coins: ICoins[]): void;
  
  abstract addConnection(coin: ICoins): any;
  
  abstract removeConnection(coin: ICoins): any;
}

export class Connectors extends ConnectorsAbsctract {
  constructor() {
    super();
    this.coins = [];
    this._connections = [];
    console.warn('connectors init');
  }

  /*initConnections() {
    for (let i = 0; i < this.coins.length; i++) {
      console.warn('init explorer api', this.coins[i]);
      this.coins.push(this.coins[i]);
      this._connectors[this.coins[i]] = new InsightExplorerConnector(this.coins[i]);
    }
  }*/

  addConnection(coin: ICoins): boolean {
    if (this.coins.indexOf(coin) === -1) {
      this.coins.push(coin);
      this._connections[coin] = new InsightExplorerConnector(coin);
      return true;
    }

    return false;
  }

  removeConnection(coin: ICoins): boolean {
    if (this.coins.indexOf(coin) > -1) {
      this.coins.splice(this.coins.indexOf(coin), 1);
      delete this._connections[coin];
      return true;
    }

    return false;
  }

  get connections() {
    return this._connections;
  }
}