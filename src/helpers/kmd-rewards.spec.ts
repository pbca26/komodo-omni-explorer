import getKomodoRewards from './kmd-rewards';

describe('getKomodoRewards', () => {
  it('it should return 0', () => {
    const utxo = {
      locktime: 1625141885,
      height: 2479656,
      tiptime: 1616141885,
      satoshis: 1000000,
    };

    expect(getKomodoRewards(utxo)).toBe(0);
  });

  it('it should return 0', () => {
    const utxo = {
      locktime: 1625141885,
      height: 2479656,
      tiptime: 1616141885,
      satoshis: 100000000,
    };

    expect(getKomodoRewards(utxo)).toBe(0);
  });

  it('it should return 0', () => {
    const utxo = {
      locktime: 1625141885,
      height: 2479656,
      tiptime: 1626270196,
      satoshis: 100000000,
    };

    expect(getKomodoRewards(utxo)).toBe(0);
  });

  it('it should return 4235195 sats', () => {
    const utxo = {
      locktime: 1625141885,
      height: 2479656,
      tiptime: 1628141885,
      satoshis: 1000000000,
    };

    expect(getKomodoRewards(utxo)).toBe(4235195);
  });
});