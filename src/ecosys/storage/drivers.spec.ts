import { FileDriver } from './drivers';

describe('FileDriver', () => {
  const driver = new FileDriver('jest-test.json');

  it('should instantiate FileDriver', () => {
    expect(driver).toBeDefined();
    expect(driver.name).toBe('jest-test.json');
  });

  it('should write data with FileDriver', async() => {
    let res = await driver.write('123');
    res = await driver.write({'test': 123});
    expect(res).toBe(true);
  });

  it('should read data with FileDriver', async() => {
    const res = await driver.read();
    expect(res).toStrictEqual({ test: 123 });
  });

  it('should return false when attempting to read non existent file with FileDriver', async() => {
    const driver2 = new FileDriver('jest-test2.json');
    const res = await driver2.read();
    expect(res).toBe(false);
  });
});