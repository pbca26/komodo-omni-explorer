module.exports = (shepherd) => {
  shepherd.get('/getblockinfo', (req, res, next) => {
    if (shepherd.checkServerData(req.query.port, req.query.ip, res)) {
      const ecl = new shepherd.electrumJSCore(req.query.port, req.query.ip, 'tcp');

      ecl.connect();
      ecl.blockchainBlockGetHeader(req.query.height)
      .then((json) => {
        ecl.close();

        const successObj = {
          msg: json.code ? 'error' : 'success',
          result: json,
        };

        res.end(JSON.stringify(successObj));
      });
    }
  });

  shepherd.get('/getcurrentblock', (req, res, next) => {
    if (shepherd.checkServerData(req.query.port, req.query.ip, res)) {
      const ecl = new shepherd.electrumJSCore(req.query.port, req.query.ip, 'tcp');

      ecl.connect();
      ecl.blockchainNumblocksSubscribe()
      .then((json) => {
        ecl.close();

        const successObj = {
          msg: json.code ? 'error' : 'success',
          result: json,
        };

        res.end(JSON.stringify(successObj));
      });
    }
  });

  return shepherd;
};