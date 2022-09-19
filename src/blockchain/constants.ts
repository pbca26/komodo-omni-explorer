import { ITransactionNetwork } from 'src/types';
import * as utxolib from 'bitgo-utxo-lib';

export const komodoNetwork: ITransactionNetwork = {
  messagePrefix: '\x18Komodo Signed Message:\n',
  bip32: utxolib.networks.zcash.bip32,
  pubKeyHash: 0x3C,
  scriptHash: 0x55,
  wif: 0xBC,
  consensusBranchId: {
    1: 0x00,
    2: 0x00,
    3: 0x5ba81b19,
    4: 0x76b809bb,
  },
  versionGroupId: 0x892F2085,
  coin: utxolib.networks.zcash.coin,
};