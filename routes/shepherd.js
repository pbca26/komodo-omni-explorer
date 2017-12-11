const express = require('express');
let shepherd = express.Router();

shepherd.Promise = require('bluebird');
shepherd.electrumJSCore = require('./electrum/electrumjs.core.js');

shepherd.CONNECTION_ERROR_OR_INCOMPLETE_DATA = 'connection error or incomplete data';

shepherd.explorer = {
  overview: [],
};

shepherd.checkServerData = (port, ip, res) => {
  let missingParams = {};

  if (!port) {
    missingParams.port = 'param is missing';
  }

  if (!ip) {
    missingParams.ip = 'param is missing';
  }

  const successObj = {
    msg: 'error',
    result: missingParams,
  };

  if (Object.keys(missingParams).length > 0) {
    res.end(JSON.stringify(successObj));
    return false;
  }

  return true;
};

/*shepherd = require('./electrum/balance.js')(shepherd);
shepherd = require('./electrum/transactions.js')(shepherd);
shepherd = require('./electrum/block.js')(shepherd);
shepherd = require('./electrum/createtx.js')(shepherd);
shepherd = require('./electrum/listunspent.js')(shepherd);
shepherd = require('./electrum/estimate.js')(shepherd);
shepherd = require('./electrum/merkle.js')(shepherd);
shepherd = require('./electrum/server.js')(shepherd);
shepherd = require('./electrum/interest.js')(shepherd);
shepherd = require('./electrum/dex.js')(shepherd);*/
shepherd = require('./electrum/explorer.js')(shepherd);

module.exports = shepherd;