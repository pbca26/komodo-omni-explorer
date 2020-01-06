const express = require('express');
const config = require('../config');
let api = express.Router();

api.explorer = {
  overview: [],
  summary: [],
};

api.log = (msg, data) => {
  if (config.debug) {
    if (data) {
      if (typeof data !== 'object') {
        console.log(`${msg} -> ${data}`);
      } else {
        console.log(msg);
        console.log(data);
      }
    } else {
      console.log(msg);
    }
  }
}

if (config.modules.explorer ||
    config.modules.faucet ||
    config.modules.kv) {
  api = require('./electrumGetServerVersion.js')(api);
}

if (config.modules.explorer) {
  api = require('./explorer.js')(api);
}
if (config.modules.mm) {
  api = require('./mm.js')(api);
}
if (config.modules.faucet) {
  api = require('./faucet.js')(api);
}
if (config.modules.kv) {
  api = require('./kv.js')(api);
}
if (config.modules.exchanges) {
  api = require('./exchanges.js')(api);
}
if (config.modules.multisig) {
  api = require('./multisigDB.js')(api);
}

api = require('./electrumManager.js')(api);

api.start = () => {
  if (config.modules.explorer) {
    api.getOverview(true);
    api.getSummary(true);
  }
  if (config.modules.kv) {
    api.kvLoop();
  }
  if (config.modules.mm) {
    api.mmloop();
    api.getRates();
    api.getMMCoins();
    api.updateStats();
  }
  if (config.modules.ticker) {
    api.ticker();
  }
  if (config.modules.exchanges) {
    api.coinswitchCoinsSync();
    api.coinswitchOrdersSync();
  }
  if (config.modules.fees) {
    api.getBTCFees();
    api.getGasPrice();
  }
  api.initElectrumManager();
};

module.exports = api;