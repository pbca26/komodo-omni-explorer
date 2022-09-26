import { Injectable } from '@nestjs/common';

@Injectable()
export class SharedService {
  private _data: any;

  constructor() {
    this._data = {};
  }

  put(key: string, data: any) {
    if (!this._data.hasOwnProperty(key)) this._data[key] = '';
    this._data[key] = data;
  }

  get(key?: string) {
    if (key) {
      if (this._data.hasOwnProperty(key)) return this._data[key];
      else return null;
    } else {
      return this._data;
    }
  }
}