import ReconnectingWebSocket from 'reconnecting-websocket';

import { logger } from '../logger';

export class MessageReader {
    constructor(private socket: ReconnectingWebSocket) {}

    public listen(messageCallback: (message: string) => void): void {
        logger.info('Start listen message event from websocket.');
        this.socket.addEventListener('message', (event: MessageEvent) => {
            messageCallback(event.data);
        });
    }
}
