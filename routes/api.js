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

api = require('./explorer.js')(api);
api = require('./mm.js')(api);
api = require('./faucet.js')(api);
api = require('./kv.js')(api);

api.start = () => {
  api.mmloop();
  api.getOverview(true);
  api.getSummary(true);
  api.getRates();
  api.getMMCoins();
  api.updateStats();
  api.getBTCFees();
  api.ticker();
};

module.exports = api;