const { checkTimestamp } = require('agama-wallet-lib/src/time');
const config = require('../config');
const { getRandomIntInclusive } = require('agama-wallet-lib/src/utils');
const electrumJSCore = require('./electrumjs.core.js');
const {
  pubToElectrumScriptHashHex,
  addressVersionCheck,
} = require('agama-wallet-lib/src/keys');
const btcnetworks = require('agama-wallet-lib/src/bitcoinjs-networks');

const CHECK_INTERVAL = 1000;
const MAX_TIME = 30; // s
const MAX_IDLE_TIME = 5 * 60;
const PING_TIME = 60;

// TODO: reconnect/cycle if electrum server is not responding

let electrumServers = {};

getProtocolVersion = (_ecl, api) => {
  let protocolVersion;
  
  return new Promise((resolve, reject) => {
    _ecl.serverVersion('AtomicExplorer')
    .then((serverData) => {      
      if (serverData &&
          JSON.stringify(serverData).indexOf('server.version already sent') > -1) {
        api.log('server version already sent');
        resolve('sent');
      }

      let serverVersion = 0;

      if (serverData &&
          typeof serverData === 'object' &&
          serverData[0] &&
          serverData[0].indexOf('ElectrumX') > -1 &&
          Number(serverData[1])
      ) {
        serverVersion = Number(serverData[1]);

        if (serverVersion) {            
          protocolVersion = Number(serverData[1]);
          _ecl.setProtocolVersion(protocolVersion);
        }
      }

      if (serverData.hasOwnProperty('code') &&
          serverData.code === '-777') {
        resolve(-777);
      }

      api.log(`ecl ${`${_ecl.host}:${_ecl.port}:${_ecl.proto}`} protocol version: ${protocolVersion}`);
      resolve(protocolVersion);
    });
  });
};

module.exports = (api) => {
  api.eclStack = [];

  api.checkOpenElectrumConnections = () => {
    api.log('ecl stack check =>');
    api.log(api.eclStack);

    for (let i = 0; i < api.eclStack.length; i++) {
      const secPassed = checkTimestamp(api.eclStack[i].timestamp);
      api.log(`${secPassed}s ecl connection passed`);

      if (secPassed >= MAX_TIME) {
        api.log('conn terminated');
        api.eclStack[i].ecl.close();
        api.eclStack.splice(i, 1);
      }
    }
  };

  api.addElectrumConnection = (ecl) => {
    api.eclStack.push({
      timestamp: Date.now(),
      ecl,
    });

    api.log('ecl stack =>');
    api.log(api.eclStack);
  };

  api.initElectrumManager = () => {
    setInterval(() => {
      api.checkOpenElectrumConnections();
    }, CHECK_INTERVAL);
  };

  return api;
};