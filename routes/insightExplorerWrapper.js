const request = require('request');
let url;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'; 

const req = (url, payload) => {
  return new Promise((resolve, reject) => {
    const options = payload.method === 'POST' ? {
      url,
      method: payload.method,
      body: JSON.stringify(payload.data),
      headers: {'content-type' : 'application/json'},
    } : {
      url,
      method: payload.method,
    };

    request(options, (error, response, body) => {
      //console.log('error', error);
      //console.log('response', response);
      if (response &&
          response.statusCode &&
          response.statusCode === 200) {
        console.log('ecl insight wrapper: ok');
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      } else {
        console.log('ecl insight wrapper: err');
        resolve({
          err: 'unable to get data',
        });
      }
    });
  });
}


const blockchainAddressListunspent = async addr => {
  const utxo = await req(`${url}/addr/${addr}/utxo`, {method: 'GET'});
  let utxos = [];

  if (utxo && utxo.length)
    for (var i = 0; i < utxo.length; i++) {
      utxos.push({
        tx_hash: utxo[i].txid,
        height: utxo[i].height,
        tx_pos: utxo[i].vout,
        value: utxo[i].satoshis,
      });
    }

  return new Promise((resolve, reject) => {
    resolve(utxos);
  });
};

const blockchainTransactionBroadcast = async rawtx => {
  const {txid} = await req(`${url}/tx/send`, {method: 'POST', data: {rawtx}});

  //console.log('push txid', txid);

  return new Promise((resolve, reject) => {
    resolve(txid);
  });
};

const setUrl = (_url) => url = _url;

module.exports = {
  blockchainAddressListunspent,
  blockchainTransactionBroadcast,
  setUrl,
};