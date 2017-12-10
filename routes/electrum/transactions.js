module.exports = (shepherd) => {
  shepherd.sortTransactions = (transactions) => {
    return transactions.sort((b, a) => {
      if (a.height < b.height) {
        return -1;
      }

      if (a.height > b.height) {
        return 1;
      }

      return 0;
    });
  }

  shepherd.get('/listtransactions', (req, res, next) => {
    if (shepherd.checkServerData(req.query.port, req.query.ip, res)) {
      const ecl = new shepherd.electrumJSCore(req.query.port, req.query.ip, 'tcp');

      if (!req.query.raw) {
        ecl.connect();
        ecl.blockchainAddressGetHistory(req.query.address)
        .then((json) => {
          ecl.close();

          const successObj = {
            msg: json.code ? 'error' : 'success',
            result: json,
          };

          res.end(JSON.stringify(successObj));
        });
      } else {
        // TODO: limit e.g. 1-10, 10-20 etc
        const MAX_TX = req.query.maxlength || 10;
        ecl.connect();

        ecl.blockchainAddressGetHistory(req.query.address)
        .then((json) => {
          if (json.code) {
            ecl.close();

            const successObj = {
              msg: json.code ? 'error' : 'success',
              result: json,
            };

            res.end(JSON.stringify(successObj));
          } else {
            if (json &&
                json.length) {
              json = shepherd.sortTransactions(json);
              json = json.slice(0, MAX_TX);
              let _transactions = [];

              shepherd.Promise.all(json.map((transaction, index) => {
                return new shepherd.Promise((resolve, reject) => {
                  ecl.blockchainTransactionGet(transaction['tx_hash'])
                  .then((_rawtxJSON) => {
                    _transactions.push({
                      height: transaction.height,
                      txid: transaction['tx_hash'],
                      raw: _rawtxJSON,
                    });
                    resolve();
                  });
                });
              }))
              .then(promiseResult => {
                ecl.close();

                const successObj = {
                  msg: 'success',
                  result: _transactions,
                };

                res.end(JSON.stringify(successObj));
              });
            } else {
              ecl.close();

              const successObj = {
                msg: 'success',
                result: [],
              };

              res.end(JSON.stringify(successObj));
            }
          }
        });
      }
    }
  });

  shepherd.get('/gettransaction', (req, res, next) => {
    if (shepherd.checkServerData(req.query.port, req.query.ip, res)) {
      const ecl = new shepherd.electrumJSCore(req.query.port, req.query.ip, 'tcp');

      ecl.connect();
      ecl.blockchainTransactionGet(req.query.txid)
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