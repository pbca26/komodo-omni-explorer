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
let _api;

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

// TODO: exclude server option
getServer = async(coin, excludeServer) => {
  if (!electrumServers[coin] || (electrumServers[coin] && !Object.keys(electrumServers[coin]).length)) {
    let randomServerStr;
    
    try {
      randomServerStr = config.electrumServers[coin].serverList.length > 1 ? config.electrumServers[coin].serverList[getRandomIntInclusive(0, config.electrumServers[coin].serverList.length - 1)].split(':') : config.electrumServers[coin].serverList[0].split(':');
    } catch (e) {
      randomServerStr = config.electrumServersExtend[coin].serverList.length > 1 ? config.electrumServersExtend[coin].serverList[getRandomIntInclusive(0, config.electrumServersExtend[coin].serverList.length - 1)].split(':') : config.electrumServersExtend[coin].serverList[0].split(':');
    }
    _api.log('ecl server doesnt exist yet, lets add')

    const ecl = new electrumJSCore(randomServerStr[1], randomServerStr[0], randomServerStr[2]);
    _api.log(`ecl conn ${randomServerStr}`);
    ecl.connect();
    _api.log(`ecl req protocol ${randomServerStr}`);
    const eclProtocolVersion = await getProtocolVersion(ecl, _api);
    
    if (!electrumServers[coin]) {
      electrumServers[coin] = {};
    }

    electrumServers[coin][randomServerStr.join(':')] = {
      server: ecl,
      lastReq: Date.now(),
      lastPing: Date.now(),
    };

    //console.log(electrumServers)

    return electrumServers[coin][randomServerStr.join(':')].server;
  } else {
    _api.log(`ecl ${coin} server exists`);
    let ecl = Object.keys(electrumServers[coin]) > 1 ? electrumServers[coin][Object.keys(electrumServers[coin])[getRandomIntInclusive(0, Object.keys(electrumServers[coin]).length - 1)]] : electrumServers[coin][Object.keys(electrumServers[coin])[0]];
    ecl.lastReq = Date.now();
    return ecl.server;
  }
};

module.exports = (api) => {
  _api = api;
  api.eclStack = [];

  api.ecl = {
    getServer,
  };

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

  return api;
};