import { FileStorage } from './storage';

describe('FileStorage', () => {
  const storage = new FileStorage('jest-test.json');

  it('should instantiate FileStorage', () => {
    expect(storage).toBeDefined();
    expect(storage.name).toBe('jest-test.json');
  });

  it('should eturn false when attempting to read non existent file', async() => {
    const storage2 = new FileStorage('jest-test2.json');
    const res = await storage2.readAll();
    expect(res).toBe(false);
    expect(storage2.data).toBe(false);
  });

  it('should write data with FileStorage', async() => {
    let res = await storage.write('123');
    expect(storage.data).toBe('123');
    expect(res).toBe(true);
    res = await storage.write({'test': 123});
    expect(storage.data).toStrictEqual({'test': 123});
    expect(res).toBe(true);
    res = await storage.write(123, 'test2');
    expect(storage.data).toStrictEqual({'test': 123, 'test2': 123});
    expect(res).toBe(true);
  });

  it('should read data with FileStorage', async() => {
    const res = await storage.readAll();
    expect(res).toStrictEqual({'test': 123, 'test2': 123});
    expect(storage.data).toStrictEqual({'test': 123, 'test2': 123});
    expect(storage.read('test2')).toBe(123);
    expect(storage.read('test3')).toBeUndefined();
  });
});