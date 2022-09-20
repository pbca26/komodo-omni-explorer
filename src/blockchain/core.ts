// TODO: switch to newer code base @bitgo/utxo-lib

import * as utxolib from 'bitgo-utxo-lib';
import * as coreUtils from './core.utils';
import { ITransactionOutputTargets, IKeyPair, ITransformedTransaction, IUtxoLibTransaction } from 'src/types';
import log from '../helpers/logger';

export default class BlockchainCore {
  constructor() { 
  }

  decodeTransaction(rawtx: string): ITransformedTransaction {
    const decodedTransaction = coreUtils.transformTransaction(utxolib.Transaction.fromHex(rawtx, coreUtils.komodoNetwork));

    //this.transformTransaction(decodedTransaction, rawtx);

    log(JSON.stringify(decodedTransaction, null, 2));
    return decodedTransaction;
  }

  buildTransaction(seed: string, utxo: any[], targets: ITransactionOutputTargets[], opreturn?: string): string {
    log(coreUtils.seedToWif(seed))
    const keyPair: IKeyPair = coreUtils.seedToWif(seed);

    const transactionData = coreUtils.buildTransactionData(keyPair.pub, utxo, targets, opreturn ? true : false);

    log(transactionData)

    const rawtx = coreUtils.buildSignedTransaction(keyPair.priv, transactionData.inputs, transactionData.outputs, opreturn);
    return rawtx;
  }

  validatePublicAddress(address: string) {
    return coreUtils.validatePublicAddress(address);
  }

  getAddressFromSeed(seed: string) {
    log('getAddressFromSeed', coreUtils.seedToWif(seed).pub);
    return coreUtils.seedToWif(seed).pub;
  }
}