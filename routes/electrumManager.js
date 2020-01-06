const { checkTimestamp } = require('agama-wallet-lib/src/time');

const CHECK_INTERVAL = 2000;
const MAX_TIME = 30; // s

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