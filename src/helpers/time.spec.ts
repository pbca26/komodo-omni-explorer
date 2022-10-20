import { checkTimestamp, secondsElapsedToString, secondsToString } from './time';

const timeExample = 1519344000000; // 02/23/2018 @ 12:00am (UTC)
const timeExample2 = 1519344060000; // 02/23/2018 @ 12:01am (UTC)

describe('time', () => {
  it('it should return 0 (time - checkTimestamp)', () => {
    expect(checkTimestamp(timeExample, timeExample / 1000)).toBe(0);
  });

  it('it should return 60 (time - checkTimestamp 60s)', () => {
    expect(checkTimestamp(timeExample, timeExample2 / 1000)).toBe(60);
  });

  it('it should return 23 Feb 2018 00:00 (time - secondsToString)', () => {
    const timestamp = timeExample / 1000;
    expect(secondsToString(timestamp)).toBe('23 Feb 2018 03:00');
  });

  it('it should return 23 Feb 2018 00:00:0 (time - secondsToString)', () => {
    const timestamp = Math.floor(timeExample / 1000);
    expect(secondsToString(timestamp, false, true)).toBe('23 Feb 2018 03:00:0');
  });

  it('it should return 1 second (time - secondsElapsedToString - 1s (singular))', () => {
    const timestamp = Date.now() - 1000;
    expect(secondsElapsedToString(timestamp)).toBe('1 second');
  });

  it('it should return 10 seconds (time - secondsElapsedToString - 10s (plural))', () => {
    const timestamp = Date.now() - 10000;
    expect(secondsElapsedToString(timestamp)).toBe('10 seconds');
  });

  it('it should return 1 minute (time - secondsElapsedToString - 1 min (singular))', () => {
    const timestamp = Date.now() - 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('1 minute');
  });

  it('it should return 2 minutes (time - secondsElapsedToString - 2 min (plural))', () => {
    const timestamp = Date.now() - 2 * 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('2 minutes');
  });

  it('it should return 1 hour (time - secondsElapsedToString - 1h (singular))', () => {
    const timestamp = Date.now() - 60 * 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('1 hour');
  });

  it('it should return 2 hours (time - secondsElapsedToString - 2h (plural))', () => {
    const timestamp = Date.now() - 2 * 60 * 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('2 hours');
  });

  it('it should return 1 day (time - secondsElapsedToString - 1d (singular))', () => {
    const timestamp = Date.now() - 24 * 60 * 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('1 day');
  });

  it('it should return 2 days (time - secondsElapsedToString - 2d (plural))', () => {
    const timestamp = Date.now() - 48 * 60 * 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('2 days');
  });

  it('it should return 1 week (time - secondsElapsedToString - 1w (singular))', () => {
    const timestamp = Date.now() - 7 * 24 * 60 * 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('1 week');
  });

  it('it should return 2 weeks (time - secondsElapsedToString - 2w (plural))', () => {
    const timestamp = Date.now() - 14 * 24 * 60 * 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('2 weeks');
  });

  it('it should return 1 month (time - secondsElapsedToString - 1m (singular))', () => {
    const timestamp = Date.now() - 30 * 24 * 60 * 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('1 month');
  });

  it('it should return 2 months (time - secondsElapsedToString - 2m (plural))', () => {
    const timestamp = Date.now() - 60 * 24 * 60 * 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('2 months');
  });

  it('it should return 1 year (time - secondsElapsedToString - 1y (singular))', () => {
    const timestamp = Date.now() - 365 * 24 * 60 * 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('1 year');
  });

  it('it should return 2 years (time - secondsElapsedToString - 2y (plural))', () => {
    const timestamp = Date.now() - 2 * 365 * 24 * 60 * 60 * 1000;
    expect(secondsElapsedToString(timestamp)).toBe('2 years');
  });

  it('it should return (time - secondsElapsedToString - 1y 1m 1w 1d 1h 1m 1s', () => {
    const year = 365 * 24 * 60 * 60;
    const month = 30 * 24 * 60 * 60;
    const week = 7 * 24 * 60 * 60;
    const day = 24 * 60 * 60;
    const hr = 60 * 60;
    const min = 60;
    const sec = 1;
    const timestamp = Date.now() - (year + month + week + day + hr + min + sec) * 1000;

    expect(secondsElapsedToString(timestamp)).toBe('1 year 1 month 1 week 1 day 1 hour 1 minute 1 second');
  });

  it('it should return 2 years (time - secondsElapsedToString - 2y (plural) value in seconds)', () => {
    const timestamp = 2 * 365 * 24 * 60 * 60;
    expect(secondsElapsedToString(timestamp, true)).toBe('2 years');
  });
});