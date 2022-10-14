const ESubscribeChannels = ['price', 'search'] as const;
type ESubscribeChannel = typeof ESubscribeChannels[number];

export function isValidChannel(value: unknown): value is ESubscribeChannel {
  return typeof value === 'string' && ESubscribeChannels.indexOf(value as ESubscribeChannel) > -1;
}

export interface ISocketClientEvents {
  channel: ESubscribeChannel,
  filter: string[]
}

export interface ISocketClient {
  connectedAt: number,
  socketId: string,
  lastPingAt: number,
  subscribedEvents: ISocketClientEvents[],
}