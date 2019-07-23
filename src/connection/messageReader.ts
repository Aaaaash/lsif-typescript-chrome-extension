import ReconnectingWebSocket from 'reconnecting-websocket';

import { logger } from '../logger';

export class MessageReader {
    constructor(private socket: ReconnectingWebSocket) {}

    private messageCallback: (message: string) => void;

    public listen(messageCallback: (message: string) => void): void {
        this.messageCallback = messageCallback;
        logger.info('Start listen message event from websocket.');
        this.socket.addEventListener('message', this.messageHandler);
    }

    private messageHandler = (event: MessageEvent): void => {
        this.messageCallback(event.data);
    }

    public dispose(): void {
        this.socket.removeEventListener('message', this.messageHandler);
    }
}
