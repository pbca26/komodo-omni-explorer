import { fromSats, toSats, maxSpendBalance } from './math';

const utxo = [{
  value: 1,
  txid: '123',
  vout: 0,
}, {
  value: 2,
  txid: '123',
  vout: 1,
}];

describe('math', () => {
  it('it should return 2.9 (math - maxSpendBalance)', () => {
    expect(maxSpendBalance(utxo, 0.1)).toBe(2.9);
  });

  it('it should return 0.1 (math - maxSpendBalance)', () => {
    expect(maxSpendBalance(utxo, 2.9)).toBe(0.1);
  });

  it('it should return 0 (math - maxSpendBalance)', () => {
    expect(maxSpendBalance(utxo, 3)).toBe(0);
  });

  it('it should return 0.00001 (math - fromSats)', () => {
    expect(fromSats(1 * Math.pow(10, 3))).toBe(0.00001);
  });

  it('it should return 0.0001 (math - fromSats)', () => {
    expect(fromSats(1 * Math.pow(10, 4))).toBe(0.0001);
  });

  it('it should return 0.001 (math - fromSats)', () => {
    expect(fromSats(1 * Math.pow(10, 5))).toBe(0.001);
  });

  it('it should return 0.01 (math - fromSats)', () => {
    expect(fromSats(1 * Math.pow(10, 6))).toBe(0.01);
  });

  it('it should return 0.1 (math - fromSats)', () => {
    expect(fromSats(1 * Math.pow(10, 7))).toBe(0.1);
  });

  it('it should return 1 (math - fromSats)', () => {
    expect(fromSats(1 * Math.pow(10, 8))).toBe(1);
  });

  it('it should return 1 (math - toSats)', () => {
    expect(toSats(Math.pow(10, -8))).toBe(1);
  });

  it('it should return 10 (math - toSats)', () => {
    expect(toSats(Math.pow(10, -7))).toBe(10);
  });

  it('it should return 100 (math - toSats)', () => {
    expect(toSats(Math.pow(10, -6))).toBe(100);
  });

  it('it should return 1000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, -5))).toBe(1000);
  });

  it('it should return 10000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, -4))).toBe(10000);
  });

  it('it should return 100000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, -3))).toBe(100000);
  });

  it('it should return 1000000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, -2))).toBe(1000000);
  });

  it('it should return 10000000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, -1))).toBe(10000000);
  });

  it('it should return 100000000 (math - toSats)', () => {
    expect(toSats(1)).toBe(100000000);
  });

  it('it should return 1000000000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, 1))).toBe(1000000000);
  });

  it('it should return 10000000000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, 2))).toBe(10000000000);
  });

  it('it should return 100000000000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, 3))).toBe(100000000000);
  });

  it('it should return 1000000000000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, 4))).toBe(1000000000000);
  });

  it('it should return 10000000000000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, 5))).toBe(10000000000000);
  });

  it('it should return 100000000000000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, 6))).toBe(100000000000000);
  });

  it('it should return 1000000000000000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, 7))).toBe(1000000000000000);
  });

  it('it should return 10000000000000000 (math - toSats)', () => {
    expect(toSats(Math.pow(10, 8))).toBe(10000000000000000);
  });
});