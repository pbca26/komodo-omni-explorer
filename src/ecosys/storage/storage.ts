// TODO: infer storage types

import { FileDriver } from './drivers';
import log from '../../helpers/logger';

abstract class StorageAbsctract {
  name: string;
  data: string | any;
  protected driver: any;
  
  constructor(name: string) {
    this.name = name;
  }
  
  abstract read(key?: string): any;
  
  abstract write(data: string, key?: string): any;
}

export class FileStorage extends StorageAbsctract {
  constructor(name: string) {
    super(name);
    log('file storage init');
    this.driver = new FileDriver(name);
  }

  async readAll() {
    this.data = await this.driver.read(this.name);
    log('readall', this.data);
    return this.data;
  }

  read(key: string) {
    return this.data[key];
  }

  async write(data: string | any, key?: string) {
    if (key) {
      this.data[key] = data;
    } else {
      this.data = data;
    }
    return await this.driver.write(this.data);
  }
}