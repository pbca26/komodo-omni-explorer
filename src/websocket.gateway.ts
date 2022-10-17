import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WebsocketManagerService } from './websocket.manager';
import { ISocketClientEvents } from './types';
import { SharedService } from './ecosys/shared.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import log from './helpers/logger';

@WebSocketGateway({ cors: '*:*' })
export class WebsocketGateway {
  @WebSocketServer()
  server: Server;
 
  constructor(
    private readonly websocketManagerService: WebsocketManagerService,
    private readonly sharedService: SharedService,
    private eventEmitter: EventEmitter2,
  ) {
    this.websocketManagerService = websocketManagerService;
    log('websockets init');
  }

  async handleDisconnect(socket: Socket) {
    log('socket', socket.id, 'disconnected');
    this.websocketManagerService.remove(socket.id);
  }
 
  async handleConnection(socket: Socket) {
    log('socket', socket.id, 'connected');
    socket.join(socket.id);
    this.websocketManagerService.add(socket.id);
  }

  broadcast(channel: string, data) {
    if (this.server && this.server.sockets) this.server.sockets.emit(channel, data);
  }

  getClients(channel: string) {
    const subscribers = this.websocketManagerService.clients.filter(x => {
      if (x.subscribedEvents.filter(y => y.channel === channel).length) {
        return x;
      }
    })
    .map(x => {
      return {
        socketId: x.socketId,
        event: x.subscribedEvents.filter(y => y.channel === channel)[0]
      };
    });

    log('emitSubscribed', JSON.stringify(subscribers, null, 2));

    return subscribers;
  }

  emitSubscribed(socketId: string, channel: string, data) {
    log('emitSubscribed', socketId, channel, data);
    this.server.sockets.in(socketId).emit(channel, data);
  }

  unsubscribeClient(socketId: string, channel: string) {
    log('unsubscribed', socketId, channel);
    this.websocketManagerService.unsubscribe(socketId, channel);
  }

  @SubscribeMessage('subscribe')
  listenForMessagesSubscribe(@MessageBody() data: ISocketClientEvents, @ConnectedSocket() socket: Socket) {
    if (this.websocketManagerService.subscribe(socket.id, data)) this.server.sockets.in(socket.id).emit(data.channel, 'subscribed');

    if (data.channel === 'search') {
      this.eventEmitter.emit('search.address', socket.id, data.filter[0]);
    }
  }
 
  @SubscribeMessage('unsubscribe')
  listenForMessagesUnsubscribe(@MessageBody() data: ISocketClientEvents, @ConnectedSocket() socket: Socket) {
    if (this.websocketManagerService.unsubscribe(socket.id, data.channel)) this.server.sockets.in(socket.id).emit(data.channel, 'unsubscribed');
  }

  @SubscribeMessage('summary')
  listenForMessagesSummary() {
    this.server.sockets.emit('summary', {
      type: 'all',
      data: this.sharedService.get('summary'),
    });
  }

  @SubscribeMessage('overview')
  listenForMessagesOverview() {
    this.server.sockets.emit('overview', {
      type: 'all',
      data: this.sharedService.get('overview'),
    });
  }

  @SubscribeMessage('trollbox')
  listenForMessagesTrollbox() {
    this.server.sockets.emit('trollbox', {
      type: 'all',
      data: this.sharedService.get('trollbox'),
    });
  }
}