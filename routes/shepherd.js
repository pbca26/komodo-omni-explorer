const express = require('express');
let shepherd = express.Router();

shepherd.Promise = require('bluebird');
shepherd.electrumJSCore = require('./electrum/electrumjs.core.js');

shepherd.explorer = {
  overview: [],
  summary: [],
};

shepherd = require('./electrum/explorer.js')(shepherd);
shepherd = require('./electrum/mm.js')(shepherd);
shepherd = require('./electrum/faucet.js')(shepherd);

module.exports = shepherd;