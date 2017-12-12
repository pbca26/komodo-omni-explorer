const express = require('express');
let shepherd = express.Router();

shepherd.Promise = require('bluebird');
shepherd.electrumJSCore = require('./electrum/electrumjs.core.js');

shepherd.explorer = {
  overview: [],
};

shepherd = require('./electrum/explorer.js')(shepherd);

module.exports = shepherd;