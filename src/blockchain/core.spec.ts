import BlockchainCore from './core';

describe('BlockchainCore', () => {
  const bc = new BlockchainCore();

  it('should instantiate BlockchainCore', () => {
    expect(bc).toBeDefined();
  });

  it('should convert seed to KMD public address', () => {
    const pubAddress = bc.getAddressFromSeed('123');

    expect(pubAddress).toEqual('RByV173diyXorZqWYEfGoXm9e292eMYdch');
  });

  it('should validate KMD public address', () => {
    expect(bc.validatePublicAddress('123')).toEqual(false);
    expect(bc.validatePublicAddress('RByV173diyXorZqWYEfGoXm9e292eMYdch')).toEqual(true);
  });

  it('should decode KMD tx', () => {
    const rawtx = '0400008085202f890273d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e000000006b483045022100d73576e105a0a1222f127ee846c69ffee5c313b09eb7fb4c08edd79e53f9ccae02202d915ac5848d2f07285ae5b2a2a8c0b890e032608eb756c06b134c5c8b0c0fc9012102bd09bf71ba30e941171fae1ef9b664c6c2472a2ccde96129279bc35e023977e8feffffff73d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e010000008a473044022042f47b8a01f42d15653c75f359a5c1b051cc808e97616ad4910732394ab4dc3a02200cf0d61154ca3b8f270fd0cd5b48d2a9a71ac20ba0f20e26c7b3a87886951f4e014104ae4fbb864e1e837021ce19cd1c788c14de615f153c0337e770cd3dbf02c2e68e0ee01adfd57c896a5d25b87f9256d8ca7436bb54b3a02147101c8fd4a8553749feffffff02e2c5077b020000001976a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac18ff6783500600001976a914d08b04218bbd0c35b755c1c8de9d67db99fc7a0188ac08842c60d19e22000000000000000000000000';
    const decodedTx = bc.decodeTransaction(rawtx);

    expect(decodedTx).toStrictEqual({
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

  it('should build and sign a KMD tx', () => {
    let signedTx = bc.buildTransaction(
      '123',
      [{txid: '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 20000}],
      [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}]
    );
    expect(signedTx).toBe('0400008085202f890173d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e000000006b483045022100ddf28c15775990526853334eeee43dc3c8b68b9d0a506f2f1ab357fa9f21fe4102207fe17c2f8878f344d0426e3a13a7b10de49910bf9f7dcde04f20df48cab96a57012103be686ed7f0539affbaf634f3bcc2b235e8e220e7be57e9397ab1c14c39137eb4ffffffff0201000000000000001976a9141d8f0476ea05d9459e004fd0ff10588dd3979e6788ac0f270000000000001976a9141d8f0476ea05d9459e004fd0ff10588dd3979e6788ac00000000000000000000000000000000000000');
    signedTx = bc.buildTransaction(
      '123',
      [{txid: '2e86d80d023a548c7c9875130f89e66de35ec873ddea920124d85965b589d673', vout: 0, value: 20000}],
      [{address: 'RByV173diyXorZqWYEfGoXm9e292eMYdch', value: 1}],
      '123'
    );
    expect(signedTx).toBe('0400008085202f890173d689b56559d8240192eadd73c85ee36de6890f1375987c8c543a020dd8862e000000006b483045022100e7d6476cd471576c38f7d8215ff48d06ff2985a548ba47be5c1007eb88e9d3ab02205ddf9a3946fa77c3ed7f5f862747dab9910360b9f72c79d0e1c0be1b770c4d57012103be686ed7f0539affbaf634f3bcc2b235e8e220e7be57e9397ab1c14c39137eb4ffffffff0301000000000000001976a9141d8f0476ea05d9459e004fd0ff10588dd3979e6788ac0e270000000000001976a9141d8f0476ea05d9459e004fd0ff10588dd3979e6788ac0100000000000000056a0331323300000000000000000000000000000000000000');
  });
});