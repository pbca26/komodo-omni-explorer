const fs = require('fs-extra');
const os = require('os');
const exec = require('child_process').exec;
const execFile = require('child_process').execFile;
const request = require('request');

const RPC_CONF_UPDATE_TIMEOUT = 300000;
const sleepInterval = 1;
const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = (api) => {
  api.getConf = (chain) => {  
    // any coind
    if (chain) {
      let _confLocation = api.confFileIndex[chain]
      api.log(`Checking conf location: ${api.confFileIndex[chain]}`, 'native.confd');

      if (fs.existsSync(_confLocation)) {
        const _rpcConf = fs.readFileSync(_confLocation, 'utf8');
        let _port = api.assetChainPorts[chain];

        if (_rpcConf.length) {
          let _match;
          let parsedRpcConfig = {
            user: '',
            pass: '',
            port: _port,
            pendingUpdate: false,
            updateTimeoutId: null
          };

          if (_match = _rpcConf.match(/rpcuser=\s*(.*)/)) {
            parsedRpcConfig.user = _match[1];
          }

          if ((_match = _rpcConf.match(/rpcpass=\s*(.*)/)) ||
              (_match = _rpcConf.match(/rpcpassword=\s*(.*)/))) {
            parsedRpcConfig.pass = _match[1];
          }

          if (_match = _rpcConf.match(/rpcport=\s*(.*)/)) {
            parsedRpcConfig.port = _match[1];
          }

          api.rpcConf[chain === 'komodod' ? 'KMD' : chain] = parsedRpcConfig;
        } else {
          api.log(`${_confLocation} is empty`, 'native.confd');
        }
      } else {
        api.log(`${_confLocation} doesnt exist`, 'native.confd');
      }
    }
  }

  api.callCli = (chain, method, params) => {
    return new Promise(async(resolve, reject) => {
      await sleep(sleepInterval);

      const payload = {
        cmd: method,
        params,
        chain,
      };
      
      if (!payload) {
        const retObj = {
          msg: "error",
          result: "no payload provided"
        };

        resolve(retObj);
        /*} else if (!payload.cmd.match(/^[0-9a-zA-Z _\,\.\[\]"'/\\]+$/g)) {
        const retObj = {
          msg: 'error',
          result: 'wrong cli string format',
        };

        res.end(JSON.stringify(retObj));*/
      } else {
        const _chain = payload.chain;
        let _cmd = payload.cmd;

        if (!api.rpcConf[_chain]) {
          api.getConf(_chain);
        } else if (!api.rpcConf[_chain].pendingUpdate) {
          api.log(`setting ${_chain} rpc config to update in ${RPC_CONF_UPDATE_TIMEOUT/1000} seconds`, 'native.confd');
          api.rpcConf[_chain].pendingUpdate = true

          //const confUpdateId = setTimeout(() => api.getConf(_chain), RPC_CONF_UPDATE_TIMEOUT)

          //api.rpcConf[_chain].updateTimeoutId = confUpdateId
        }

        let _body = {
          agent: "bitcoinrpc",
          method: _cmd
        };

        if (payload.params) {
          _body = {
            agent: "bitcoinrpc",
            method: _cmd,
            params: payload.params === " " ? [""] : payload.params
          };
        }

        if (payload.chain) {
          if (!api.rpcConf[payload.chain]) {
            const retObj = {
              result: "error",
              error: {
                code: 404,
                message: `${payload.chain} hasn't been activated yet, and its rpc config isnt loaded.`
              }
            };

            resolve(retObj);
          } else {
            const options = {
              url: `http://127.0.0.1:${api.rpcConf[payload.chain].port}`,
              method: "POST",
              auth: {
                user: api.rpcConf[payload.chain].user,
                pass: api.rpcConf[payload.chain].pass
              },
              body: JSON.stringify(_body)
            };

            //console.log(options)

            // send back body on both success and error
            // this bit replicates iguana core's behaviour
            request(options, (error, response, body) => {
              if (body) {
                //res.end(body);
                resolve(body);
              } else {
                const retObj = {
                  result: "error",
                  error: {
                    code: 404,
                    /*message: api.coinsInitializing.includes(payload.chain)
                      ? `Initializing ${payload.chain} daemon...`
                      : `No running ${payload.chain} daemon found.`*/
                  }
                };

                /*if (error != null) {
                  api.log(`Error making rpc call:`, 'native.confd');
                  console.log(options)
                  api.log(error, 'native.confd');
                }*/

                resolve(retObj);
              }
            });
          }
        }
      }
    });
  };

  return api;
};