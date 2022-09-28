import * as fs from 'node:fs';
import log from '../../helpers/logger';

const STORAGE_DIR = 'cache';

export class FileDriver {
  name: string;

  constructor(name: string) {
    this.name = name;
  }
  
  async read() {
    return new Promise((resolve, reject) => {
      fs.access(`${STORAGE_DIR}/${this.name}`, fs.constants.F_OK, (err) => {
        log(`${this.name} ${err ? 'does not exist' : 'exists'}`);
        
        if (!err) {
          fs.readFile(`${STORAGE_DIR}/${this.name}`, 'utf8', (err, data) => {
            if (err) {
              log('fs driver read error', err);
              throw err;
            }
            try {
              //log('fs driver data', data);
              const parsedData = JSON.parse(data);
              //log('fs driver parsed data', parsedData);
              resolve(parsedData);
            } catch(e) {
              log('fs driver read error', e);
              resolve(null);
            }
          });
        } else {
          resolve(false);
        }
      });
    });
  }

  async write(data: any) {
    return new Promise((resolve, reject) => {
      fs.writeFile(`${STORAGE_DIR}/${this.name}`, JSON.stringify(data) ? JSON.stringify(data) : data, {encoding: 'utf8', flag: 'w'}, (err) => {
        if (err) {
          log('fs driver write error', err);
          throw err;
        }
        log('fs driver file has been saved');
        resolve(true);
      });
    });
  }
}