import { Injectable } from '@nestjs/common';
import { ISocketClient, ISocketClientEvents, isValidChannel } from './types';
import { throwCustomWSError, ERRORS } from './ecosys/error.handlers';
import log from './helpers/logger';

// TODO: validate ISocketClientEvents filter values

@Injectable()
export class WebsocketManagerService { 
  private _clients: ISocketClient[];

  constructor() {
    this._clients = [];
  }

  private validateSubscribeData(socketId: string, channel: string) {
    const clientIndex = this._clients.findIndex(x => {
      return x.socketId === socketId;
    });

    if (clientIndex === -1) {
      throwCustomWSError(ERRORS.ERR_WS_CLIENT_IS_NOT_CONNECTED);
      log('error: no such client connected');
      return -1;
    } else if (channel && !isValidChannel(channel)) {
      throwCustomWSError(ERRORS.ERR_WS_UKNOWN_CHANNEL);
      log('error: wrong channel');
      return -1;
    }

    return clientIndex;
  }

  subscribe(socketId: string, eventData: ISocketClientEvents) {
    const clientIndex = this.validateSubscribeData(socketId, eventData.channel);

    if (clientIndex > -1) {
      const subsriberEvents = this._clients[clientIndex].subscribedEvents;

      if (!subsriberEvents.filter(x => x.channel === eventData.channel).length) {
        this._clients.filter(x => x.socketId === socketId)[0].subscribedEvents.push(eventData);

        log('client', socketId, 'subscribed to event', eventData);
        log(JSON.stringify(this._clients, null, 2));
        return true;
      } else {
        throwCustomWSError(ERRORS.ERR_WS_CLIENT_ONLY_ONE_EVENT_PER_CLIENT);
      }
    }
  }

  unsubscribe(socketId: string, channel: string) {
    const clientIndex = this.validateSubscribeData(socketId, channel);

    if (clientIndex > -1) {
      const clientEventIndex = this._clients[clientIndex].subscribedEvents.findIndex(x => {
        return x.channel === channel;
      });

      if (clientEventIndex > -1) {
        this._clients[clientIndex].subscribedEvents.splice(clientEventIndex, 1);
        log('client', socketId, 'unsubscribed from event', channel);
        log(JSON.stringify(this._clients, null, 2));
        return true;
      } else {
        throwCustomWSError(ERRORS.ERR_WS_CLIENT_IS_NOT_SUBSCRIBED_TO_EVENT);
        log('error: client is not subscribed to this event');
      }
    }
  }

  add(socketId: string) {
    if (!this._clients.filter(x => x.socketId === socketId).length) {
      this._clients.push({
        connectedAt: Date.now(),
        lastPingAt: Date.now(),
        socketId,
        subscribedEvents: [],
      });
      log(JSON.stringify(this._clients, null, 2));
    } else {
      log('error: client is already added');
    }
  }

  remove(socketId: string) {
    const clientIndex = this._clients.findIndex(x => {
      return x.socketId === socketId;
    });

    if (clientIndex > -1) {
      this._clients.splice(clientIndex, 1);
    } else {
      throwCustomWSError(ERRORS.ERR_WS_CLIENT_IS_NOT_CONNECTED);
      log('error: no such client connected');
    }
  }

  get clients() {
    return this._clients;
  }
}