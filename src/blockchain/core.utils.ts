import * as crypto from 'node:crypto';
import * as utxolib from 'bitgo-utxo-lib';
import * as coinselect from 'coinselect';
import {maxSpendBalance} from '../helpers/math';
import * as bigi from 'bigi';
import {
  ITransactionInput,
  ITRansactionOutput,
  IUtxoLibTransaction,
  IB58check,
  IUtxoList,
  ITransactionOutputTargets,
  ICoinselect,
  IECPair,
  IKeyPair,
  IECPairExt,
  ITransformedTransaction,
} from 'src/types';
import { komodoNetwork } from './constants';
import log from '../helpers/logger';

export { komodoNetwork as komodoNetwork };

export const decodeInputs = (tx: IUtxoLibTransaction): ITransactionInput[] => {
  return tx.ins.map(input => {
    return {
      txid: !input.hash.reverse ? input.hash.toString('hex') : input.hash.reverse().toString('hex'),
      n: input.index,
      script: utxolib.script.toASM(input.script),
      sequence: input.sequence,
    }
  });
};

const formatAddressOutputByType = (type: string, asm: string, script: Buffer): Array<string> => {
  switch (type) {
    case 'pubkeyhash':
      return [utxolib.address.fromOutputScript(script, komodoNetwork)];
    case 'pubkey':
      const pubKeyBuffer: Buffer = new Buffer(asm.split(' ')[0], 'hex');
      return [utxolib.ECPair.fromPublicKeyBuffer(pubKeyBuffer, komodoNetwork).getAddress()];
    case 'scripthash':
      return [utxolib.address.fromOutputScript(script, komodoNetwork)];
    default:
      return [];
  }
}

export const decodeOutputs = (tx: IUtxoLibTransaction): ITRansactionOutput[] => {
  return tx.outs.map((out, n: number) => {
    return {
      satoshi: out.value,
      value: (1e-8 * out.value).toFixed(8),
      n,
      scriptPubKey: {
        asm: utxolib.script.toASM(out.script),
        hex: out.script.toString('hex'),
        type: utxolib.script.classifyOutput(out.script),
        addresses: formatAddressOutputByType(
          utxolib.script.classifyOutput(out.script),
          utxolib.script.toASM(out.script),
          out.script,
        ),
      },
    }
  });
};

export const validatePublicAddress = (address: string): boolean => {
  try {
    const b58check: IB58check = utxolib.address.fromBase58Check(address);

    if (b58check.version === komodoNetwork.pubKeyHash ||
        b58check.version === komodoNetwork.scriptHash) {
      return true;
    }

    return false;
  } catch (e) {
    return false;
  }
};

export const buildTransactionData = (changeAddress: string, utxoList: IUtxoList[], targets: ITransactionOutputTargets[], opreturn?: boolean): ICoinselect => {
  const fee: number = 10000 + (opreturn ? 1 : 0);
  const _maxSpendBalance: number = Number(maxSpendBalance(utxoList));
  const value: number = targets.reduce((acc: number, item) => acc + item.value, 0);
  const utxoSum: number = utxoList.reduce((acc: number, item) => acc + item.value, 0);

  //log(value)

  if (!Array.isArray(utxoList) || utxoList.length === 0) {
    throw new Error('no utxos');
  }
   
  if (targets.length === 0) {
    throw new Error('no targets');
  }

  if (value > _maxSpendBalance) {
    throw new Error('Spend value is too large');
  }

  if (value <= utxoSum && value + fee > utxoSum) {
    throw new Error('not enough inputs to covert fee');
  }

  targets.push({
    address: 'fee',
    value: fee,
  });

  const {inputs, outputs} = coinselect(utxoList, targets, 0);
  if (outputs.length > 1 && !outputs[outputs.length - 1].hasOwnProperty('address')) {
    outputs[outputs.length - 1].address = changeAddress;
  }

  if (Array.isArray(inputs) && Array.isArray(outputs)) {
    return {
      inputs,
      outputs: outputs.filter(x => x.address !== 'fee'),
    };
  } else {
    throw new Error('Can\'t find best fit utxo. Try lower amount.');
  }
};

export const buildSignedTransaction = (wif: string, utxo: IUtxoList[], outputs: ITransactionOutputTargets[], opreturn?: string): string => {
  const key: IECPair = utxolib.ECPair.fromWIF(wif, komodoNetwork);
  let transaction = new utxolib.TransactionBuilder(komodoNetwork);

  if (!Array.isArray(utxo) || utxo.length === 0) {
    throw new Error('no utxos');
  }
   
  if (outputs.length === 0) {
    throw new Error('no outputs');
  }

  for (let i = 0; i < utxo.length; i++) {
    transaction.addInput(utxo[i].txid, utxo[i].vout);
  }

  for (let i = 0; i < outputs.length; i++) {
    transaction.addOutput(outputs[i].address, Number(outputs[i].value));
  }

  if (opreturn) {
    const data = Buffer.from(opreturn, 'utf8');
    const dataScript = utxolib.script.nullData.output.encode(data);

    transaction.addOutput(dataScript, 1);
  }

  transaction.setVersion(4);
  transaction.setVersionGroupId(komodoNetwork.versionGroupId);

  for (let i = 0; i < utxo.length; i++) {
    transaction.sign(i, key, '', null, Number(utxo[i].value));
  }

  //log(transaction)

  return transaction.build().toHex();
};

export const seedToWif = (seed: string): IKeyPair => {
  const buffer = crypto.createHash('sha256').update(seed).digest();

  const d: BigInteger = bigi.fromBuffer(buffer);
  const eCPair: IECPairExt = new utxolib.ECPair(d, null, { network: komodoNetwork });

  return {
    pub: eCPair.getAddress(),
    priv: eCPair.toWIF(),
    pubHex: eCPair.getPublicKeyBuffer().toString('hex'),
  };
};

export const transformTransaction = (transaction: IUtxoLibTransaction): ITransformedTransaction => {
  return {
    versionGroupId: transaction.versionGroupId,
    overwintered: transaction.overwintered,
    locktime: transaction.locktime,
    txid: transaction.getId(),
    inputs: decodeInputs(transaction),
    outputs: decodeOutputs(transaction),
  };
}