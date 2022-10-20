import { HttpException, HttpStatus } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';

export enum ERRORS {
  ERR_ADDRESS_INVALID = 'address is invalid',
  ERR_COIN_NOT_ENABLED = 'coin is not enabled',
  ERR_FAUCET_LIMIT_REACHED = 'you had enough already',
  ERR_FAUCET_LIMIT_REACHED_TIME = 'you had enough already, come back in ',
  ERR_FAUCET_LIMIT_REACHED_RANGE_START = 'wrong time, come back in ',
  ERR_FAUCET_LIMIT_REACHED_RANGE_END = 'wrong time, event is already finished',
  ERR_FAUCET_UTXO_OK = 'enough min utxo count',
  ERR_FAUCET_UTXO_NOT_OK = 'not enough utxo',
  ERR_CAPTCHA_VERIFICATION = 'captcha verification failed',
  ERR_TROLLBOX_CONTENT_LENGTH_EXCEEDED = 'trollbox content length exceeds max values',
  ERR_TROLLBOX_FORMAT_ERROR = 'trollbox message is malformed, ',
  ERR_GET_UTXO = 'unable to get address utxos',
  ERR_NO_TXID_EXISTS = 'no such transaction exists on any chain',
  ERR_MALFORMED_COINS_ARRAY = 'coins arg is not an array',
  ERR_FIAT_TICKER_WRONG = 'wrong fiat ticker',
  ERR_COIN_TICKER_NA = 'coin price is not available',
  ERR_WS_CLIENT_IS_NOT_CONNECTED = 'client is not connected',
  ERR_WS_CLIENT_IS_NOT_SUBSCRIBED_TO_EVENT = 'client is not subscribed to this event',
  ERR_WS_CLIENT_ONLY_ONE_EVENT_PER_CLIENT = 'only one event of each type is allowed per client',
  ERR_WS_UKNOWN_CHANNEL = 'unknown channel'
};

export const throwCustomError = (error: ERRORS | string, errorExtraInfo?: string | number) => {
  throw new HttpException({
    error: errorExtraInfo ? error + errorExtraInfo : error,
    status: HttpStatus.BAD_REQUEST
  }, HttpStatus.BAD_REQUEST);
};

export const throwCustomWSError = (error: ERRORS | string) => {
  throw new WsException(error);
};