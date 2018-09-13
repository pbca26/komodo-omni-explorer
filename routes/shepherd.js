const express = require('express');
const config = require('../config');
let shepherd = express.Router();

shepherd.explorer = {
  overview: [],
  summary: [],
};

shepherd.log = (msg) => {
  if (config.isDev ||
      config.debug) {
    console.log(msg);
  }
}

shepherd = require('./electrum/explorer.js')(shepherd);
shepherd = require('./electrum/mm.js')(shepherd);
shepherd = require('./electrum/faucet.js')(shepherd);

module.exports = shepherd;