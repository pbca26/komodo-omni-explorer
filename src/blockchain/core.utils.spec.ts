import * as CryptoUtils from './core.utils';
import * as utxolib from 'bitgo-utxo-lib';

describe('CryptoUtils', () => {
  it('should convert seed to key pair object', () => {
    const seed = '123';
    const seedToKP = CryptoUtils.seedToWif(seed);

    expect(seedToKP).toEqual({
      pub: 'RByV173diyXorZqWYEfGoXm9e292eMYdch',
      priv: 'Uuazpw72pcy3xWzKhEVTqGre6U7QKKSoA9Px6nU4vNbgejx2Qk7s',
      pubHex: '03be686ed7f0539affbaf634f3bcc2b235e8e220e7be57e9397ab1c14c39137eb4'
    });
  });

  it('should check KMD address validity', () => {
    expect(CryptoUtils.validatePublicAddress('123')).toBe(false);
    expect(CryptoUtils.validatePublicAddress('RByV173diyXorZqWYEfGoXm9e292eMYdch')).toBe(true);
  });

  it('should decode raw tx hex and return formatted inputs', () => {
    const rawtx = '0400008085202f890273d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e000000006b483045022100d73576e105a0a1222f127ee846c69ffee5c313b09eb7fb4c08edd79e53f9ccae02202d915ac5848d2f07285ae5b2a2a8c0b890e032608eb756c06b134c5c8b0c0fc9012102bd09bf71ba30e941171fae1ef9b664c6c2472a2ccde96129279bc35e023977e8feffffff73d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e010000008a473044022042f47b8a01f42d15653c75f359a5c1b051cc808e97616ad4910732394ab4dc3a02200cf0d61154ca3b8f270fd0cd5b48d2a9a71ac20ba0f20e26c7b3a87886951f4e014104ae4fbb864e1e837021ce19cd1c788c14de615f153c0337e770cd3dbf02c2e68e0ee01adfd57c896a5d25b87f9256d8ca7436bb54b3a02147101c8fd4a8553749feffffff02e2c5077b020000001976a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac18ff6783500600001976a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac08842c60d19e22000000000000000000000000';
    const decodedTxInUtxolibFormat = utxolib.Transaction.fromHex(rawtx, CryptoUtils.komodoNetwork);
    
    expect(CryptoUtils.decodeInputs(decodedTxInUtxolibFormat)).toStrictEqual([
      {
        txid: '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673',
        n: 0,
        script: '3045022100d73576e105a0a1222f127ee846c69ffee5c313b09eb7fb4c08edd79e53f9ccae02202d915ac5848d2f07285ae5b2a2a8c0b890e032608eb756c06b134c5c8b0c0fc901 02bd09bf71ba30e941171fae1ef9b664c6c2472a2ccde96129279bc35e023977e8',
        sequence: 4294967294
      },
      {
        txid: '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673',
        n: 1,
        script: '3044022042f47b8a01f42d15653c75f359a5c1b051cc808e97616ad4910732394ab4dc3a02200cf0d61154ca3b8f270fd0cd5b48d2a9a71ac20ba0f20e26c7b3a87886951f4e01 04ae4fbb864e1e837021ce19cd1c788c14de615f153c0337e770cd3dbf02c2e68e0ee01adfd57c896a5d25b87f9256d8ca7436bb54b3a02147101c8fd4a8553749',
        sequence: 4294967294
      }
    ]);
  });

  it('should decode raw tx hex and return formatted outputs', () => {
    const rawtx = '0400008085202f890273d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e000000006b483045022100d73576e105a0a1222f127ee846c69ffee5c313b09eb7fb4c08edd79e53f9ccae02202d915ac5848d2f07285ae5b2a2a8c0b890e032608eb756c06b134c5c8b0c0fc9012102bd09bf71ba30e941171fae1ef9b664c6c2472a2ccde96129279bc35e023977e8feffffff73d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e010000008a473044022042f47b8a01f42d15653c75f359a5c1b051cc808e97616ad4910732394ab4dc3a02200cf0d61154ca3b8f270fd0cd5b48d2a9a71ac20ba0f20e26c7b3a87886951f4e014104ae4fbb864e1e837021ce19cd1c788c14de615f153c0337e770cd3dbf02c2e68e0ee01adfd57c896a5d25b87f9256d8ca7436bb54b3a02147101c8fd4a8553749feffffff02e2c5077b020000001976a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac18ff6783500600001976a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac08842c60d19e22000000000000000000000000';
    const decodedTxInUtxolibFormat = utxolib.Transaction.fromHex(rawtx, CryptoUtils.komodoNetwork);

    expect(CryptoUtils.decodeOutputs(decodedTxInUtxolibFormat)).toStrictEqual([
      {
        'satoshi': 10654041570,
        'value': '106.54041570',
        'n': 0,
        'scriptPubKey': {
          'asm': 'OP_DUP OP_HASH160 d08b04218bbd0c35b755c1c8de9d67db99fc7a01 OP_EQUALVERIFY OP_CHECKSIG',
          'hex': '76a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac',
          'type': 'pubkeyhash',
          'addresses': [
            'RUHsARjjZchrPxi1DRFVa6P2esSX3tr53s'
          ]
        }
      },
      {
        'satoshi': 6942871781144,
        'value': '69428.71781144',
        'n': 1,
        'scriptPubKey': {
          'asm': 'OP_DUP OP_HASH160 d08b04218bbd0c35b755c1c8de9d67db99fc7a01 OP_EQUALVERIFY OP_CHECKSIG',
          'hex': '76a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac',
          'type': 'pubkeyhash',
          'addresses': [
            'RUHsARjjZchrPxi1DRFVa6P2esSX3tr53s'
          ]
        }
      }
    ]);
  });

  it('should decode raw tx hex and return formatted outputs', () => {
    const rawtx = '0400008085202f890273d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e000000006b483045022100d73576e105a0a1222f127ee846c69ffee5c313b09eb7fb4c08edd79e53f9ccae02202d915ac5848d2f07285ae5b2a2a8c0b890e032608eb756c06b134c5c8b0c0fc9012102bd09bf71ba30e941171fae1ef9b664c6c2472a2ccde96129279bc35e023977e8feffffff73d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e010000008a473044022042f47b8a01f42d15653c75f359a5c1b051cc808e97616ad4910732394ab4dc3a02200cf0d61154ca3b8f270fd0cd5b48d2a9a71ac20ba0f20e26c7b3a87886951f4e014104ae4fbb864e1e837021ce19cd1c788c14de615f153c0337e770cd3dbf02c2e68e0ee01adfd57c896a5d25b87f9256d8ca7436bb54b3a02147101c8fd4a8553749feffffff02e2c5077b020000001976a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac18ff6783500600001976a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac08842c60d19e22000000000000000000000000';
    const decodedTxInUtxolibFormat = utxolib.Transaction.fromHex(rawtx, CryptoUtils.komodoNetwork);

    const transformedTx = CryptoUtils.transformTransaction(decodedTxInUtxolibFormat);
    expect(transformedTx).toStrictEqual({
      'versionGroupId': 2301567109,
      'overwintered': 1,
      'locktime': 1613530120,
      'txid': 'bf095589a693527b5862c8736ba2962e204cdfe53894e5681e34b149fcd9be23',
      'inputs': [
        {
          'txid': '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673',
          'n': 0,
          'script': '3045022100d73576e105a0a1222f127ee846c69ffee5c313b09eb7fb4c08edd79e53f9ccae02202d915ac5848d2f07285ae5b2a2a8c0b890e032608eb756c06b134c5c8b0c0fc901 02bd09bf71ba30e941171fae1ef9b664c6c2472a2ccde96129279bc35e023977e8',
          'sequence': 4294967294
        },
        {
          'txid': '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673',
          'n': 1,
          'script': '3044022042f47b8a01f42d15653c75f359a5c1b051cc808e97616ad4910732394ab4dc3a02200cf0d61154ca3b8f270fd0cd5b48d2a9a71ac20ba0f20e26c7b3a87886951f4e01 04ae4fbb864e1e837021ce19cd1c788c14de615f153c0337e770cd3dbf02c2e68e0ee01adfd57c896a5d25b87f9256d8ca7436bb54b3a02147101c8fd4a8553749',
          'sequence': 4294967294
        }
      ],
      'outputs': [
        {
          'satoshi': 10654041570,
          'value': '106.54041570',
          'n': 0,
          'scriptPubKey': {
            'asm': 'OP_DUP OP_HASH160 d08b04218bbd0c35b755c1c8de9d67db99fc7a01 OP_EQUALVERIFY OP_CHECKSIG',
            'hex': '76a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac',
            'type': 'pubkeyhash',
            'addresses': [
              'RUHsARjjZchrPxi1DRFVa6P2esSX3tr53s'
            ]
          }
        },
        {
          'satoshi': 6942871781144,
          'value': '69428.71781144',
          'n': 1,
          'scriptPubKey': {
            'asm': 'OP_DUP OP_HASH160 d08b04218bbd0c35b755c1c8de9d67db99fc7a01 OP_EQUALVERIFY OP_CHECKSIG',
            'hex': '76a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac',
            'type': 'pubkeyhash',
            'addresses': [
              'RUHsARjjZchrPxi1DRFVa6P2esSX3tr53s'
            ]
          }
        }
      ]
    });
  });

  it('should return tx inputs and outputs selected based on inputs', () => {
    expect(() => CryptoUtils.buildTransactionData(
      'RByV173diyXorZqWYEfGoXm9e292eMYdch',
      [],
      []
    ))
    .toThrow('no utxos');

    expect(() => CryptoUtils.buildTransactionData(
      'RByV173diyXorZqWYEfGoXm9e292eMYdch',
      [{txid: '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 1}],
      []
    ))
    .toThrow('no targets');

    expect(() => CryptoUtils.buildTransactionData(
      'RByV173diyXorZqWYEfGoXm9e292eMYdch',
      [{txid: '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 1}],
      [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 10}]
    ))
    .toThrow('Spend value is too large');

    expect(() => CryptoUtils.buildTransactionData(
      'RByV173diyXorZqWYEfGoXm9e292eMYdch',
      [{txid: '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 1}],
      [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}]
    ))
    .toThrow('not enough inputs to covert fee');
    
    expect(CryptoUtils.buildTransactionData(
      'RByV173diyXorZqWYEfGoXm9e292eMYdch',
      [{'txid': '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 10001}],
      [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}]
    ))
    .toStrictEqual({
      inputs: [{txid: '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 10001}],
      outputs: [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}]
    });

    expect(CryptoUtils.buildTransactionData(
      'RByV173diyXorZqWYEfGoXm9e292eMYdch',
      [{'txid': '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 11000}],
      [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}]
    ))
    .toStrictEqual({
      inputs: [{txid: '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 11000}],
      outputs: [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}, {address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 999}]
    });

    expect(CryptoUtils.buildTransactionData(
      'RByV173diyXorZqWYEfGoXm9e292eMYdch',
      [{'txid': '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 10002}],
      [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}],
      true
    ))
    .toStrictEqual({
      inputs: [{txid: '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 10002}],
      outputs: [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}]
    });
  });

  it('should return a signed tx hex', () => {
    expect(() => CryptoUtils.buildSignedTransaction(
      '',
      [{'txid': '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 10001}],
      [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}]
    ))
    .toThrow('Invalid checksum');

    expect(() => CryptoUtils.buildSignedTransaction(
      'Uuazpw72pcy3xWzKhEVTqGre6U7QKKSoA9Px6nU4vNbgejx2Qk7s',
      [],
      []
    ))
    .toThrow('no utxos');

    expect(() => CryptoUtils.buildSignedTransaction(
      'Uuazpw72pcy3xWzKhEVTqGre6U7QKKSoA9Px6nU4vNbgejx2Qk7s',
      [{txid: '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 1}],
      []
    ))
    .toThrow('no outputs');

    expect(CryptoUtils.buildSignedTransaction(
      'Uuazpw72pcy3xWzKhEVTqGre6U7QKKSoA9Px6nU4vNbgejx2Qk7s',
      [{'txid': '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 10001}],
      [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}]
    ))
    .toStrictEqual('0400008085202f890173d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e000000006b483045022100c48472b9584e3ace4670bc3f7d09d0931e2093fbb521e05b64bdc96c5d759d96022049d5274b1716c5bef3573cbceb724ed7ee1ccd811e34fde8f49805386bc127f2012103be686ed7f0539affbaf634f3bcc2b235e8e220e7be57e9397ab1c14c39137eb4ffffffff0101000000000000001976a9141d8f0476ea05d9459e004fd0ff10588dd3979e6788ac00000000000000000000000000000000000000');

    expect(CryptoUtils.buildSignedTransaction(
      'Uuazpw72pcy3xWzKhEVTqGre6U7QKKSoA9Px6nU4vNbgejx2Qk7s',
      [{'txid': '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 10001}],
      [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}],
      '123'
    ))
    .toStrictEqual('0400008085202f890173d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e000000006a473044022038dd8f769a956258093a5afc5f4372a0fd9c1a1957ec14f890a13a3e13b0be8a02204766a39f256e9e24ac1fe9db9b6ecbf28caf072909c0962fad5dc77839793751012103be686ed7f0539affbaf634f3bcc2b235e8e220e7be57e9397ab1c14c39137eb4ffffffff0201000000000000001976a9141d8f0476ea05d9459e004fd0ff10588dd3979e6788ac0100000000000000056a0331323300000000000000000000000000000000000000');
  });
});