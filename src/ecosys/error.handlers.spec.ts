import { ERRORS, throwCustomError, throwCustomWSError } from './error.handlers';
import { HttpException } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

describe('Error Handlers', () => {
  it('should throw HttpException', () => {
    expect(() => throwCustomError(ERRORS.ERR_COIN_NOT_ENABLED)).toThrowError(HttpException);
  });

  it('should throw WsException', () => {
    expect(() => throwCustomWSError(ERRORS.ERR_COIN_NOT_ENABLED)).toThrowError(WsException);
  });
});