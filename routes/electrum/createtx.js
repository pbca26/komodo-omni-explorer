module.exports = (shepherd) => {
  // test
  shepherd.get('/pushtx', (req, res, next) => {
    if (shepherd.checkServerData(req.query.port, req.query.ip, res)) {
      const ecl = new shepherd.electrumJSCore(req.query.port, req.query.ip, 'tcp');

      ecl.connect();
      ecl.blockchainTransactionBroadcast(req.query.rawtx)
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

  // live
  shepherd.post('/pushtx', (req, res, next) => {
    if (shepherd.checkServerData(req.body.port, req.body.ip, res)) {
      const ecl = new shepherd.electrumJSCore(req.body.port, req.body.ip, 'tcp');

      ecl.connect();
      ecl.blockchainTransactionBroadcast(req.body.rawtx)
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