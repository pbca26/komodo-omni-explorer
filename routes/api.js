const express = require('express');
const config = require('../config');
let api = express.Router();

api.explorer = {
  overview: [],
  summary: [],
};

api.log = (msg) => {
  if (config.isDev ||
      config.debug) {
    console.log(msg);
  }
}

api = require('./explorer.js')(api);
api = require('./mm.js')(api);
api = require('./faucet.js')(api);

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