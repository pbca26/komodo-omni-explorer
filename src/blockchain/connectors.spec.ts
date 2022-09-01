import { Connectors } from './connectors';
import { ICoin } from '../types';

describe('Connectors', () => {
  const connectors = new Connectors();

  it('should be defined', () => {
    expect(connectors).toBeDefined();
  });

  it('should add KMD', () => {
    expect(connectors.addConnection(ICoin.KMD)).toBe(true);
    expect(connectors.coins).toEqual(['KMD']);
    expect(connectors.connections['KMD']).toBeDefined();
  });

  it('should not add KMD twice', () => {
    expect(connectors.addConnection(ICoin.KMD)).toBe(false);
  });

  it('should remove KMD', () => {
    expect(connectors.removeConnection(ICoin.KMD)).toBe(true);
    expect(connectors.coins).toEqual([]);
    expect(connectors.connections['KMD']).toBeUndefined();
  });

  it('should not remove if coin doesn\'t exist in the list', () => {
    expect(connectors.removeConnection(ICoin.RICK)).toBe(false);
  });
});