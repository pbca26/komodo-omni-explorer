module.exports = (api) => {
  api.getServerVersion = (ecl) => {
    //const ecl = new electrumJSCore(port, ip, proto);
    let protocolVersion;
    
    return new Promise((resolve, reject) => {
      //ecl.connect();
      ecl.serverVersion()
      .then((serverData) => {
        //ecl.close();

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
            ecl.setProtocolVersion(protocolVersion);
          }
        }

        api.log(`server ${`${ecl.host}:${ecl.port}:${ecl.proto}`} protocol version: ${protocolVersion}`);
        resolve(protocolVersion);
      });
    });
  };

  return api;
};