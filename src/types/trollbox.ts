import { IBroadcastRes } from './broadcast';

export interface ITrollbox {
	[key: string]: ITrollboxTransaction[],
};

export interface ITrollboxTransaction {
	txid: string,
	height: number,
	data: ITrollboxMessage,
	time: string,
}

export interface ITrollboxMessage {
	version?: string,
	encrypted?: boolean,
	tag: string,
	content: {
		version: number,
		parent?: string,
		title: string,
		body: string,
	},
}

export interface ITrollboxSendRes {
	rawtx: string,
	broadcast: IBroadcastRes,
	value: number,
}