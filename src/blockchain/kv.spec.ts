import * as KV from './kv';

describe('KV', () => {
  it('should return encode an object into KV hex string', () => {
    expect(() => KV.encode({
      tag: '',
      content: {
        version: 1,
        title: '',
        body: '',
      }
    }))
    .toThrow('tag length cannot be zero');

    expect(() => KV.encode({
      tag: '1',
      content: {
        version: 1,
        title: '',
        body: '',
      }
    }))
    .toThrow('content body length cannot be zero');

    expect(() => KV.encode({
      tag: '1',
      content: {
        version: 1,
        title: '',
        body: '1',
      }
    }))
    .toThrow('content title length cannot be zero');

    expect(() => KV.encode({
      tag: '1',
      content: {
        version: 1111,
        title: '1',
        body: '1',
      }
    }))
    .toThrow('content version length cannot exceed 3');

    expect(() => KV.encode({
      tag: Array(65).fill(0).toString(),
      content: {
        version: 1,
        title: '',
        body: '1',
      }
    }))
    .toThrow('tag length cannot exceed 64');

    expect(() => KV.encode({
      tag: '1',
      content: {
        version: 1,
        title: Array(129).fill(0).toString(),
        body: '1',
      }
    }))
    .toThrow('content title length cannot exceed 128');

    expect(() => KV.encode({
      tag: '1',
      content: {
        version: 1,
        title: '1',
        body: Array(4097).fill(0).toString(),
      }
    }))
    .toThrow('content body length cannot exceed 4096');

    expect(KV.encode({
      tag: 'test',
      content: {
        version: 1,
        title: 'test',
        body: 'test',
      }
    }))
    .toBe('3031307465737400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000031000030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030746573740000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000074657374');
  });

  it('should return a decoded KV hex string', () => {
    expect(KV.decode('123')).toBe(false);

    expect(KV.decode('3031307465737400000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000031000030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030303030746573740000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000074657374'))
    .toStrictEqual({
      content: {
        body: 'test',
        parent: '0000000000000000000000000000000000000000000000000000000000000000',
        title: 'test',
        version: 1
      },
      encrypted: 0,
      tag: 'test',
      version: 1,
    });
  });
});