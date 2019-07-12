import { logger } from '../logger';

export class MessageReader {
    constructor(private socket: WebSocket) {}

    public listen(messageCallback: (message: string) => void): void {
        logger.info('Start listen message event from websocket.');
        this.socket.addEventListener('message', (event: MessageEvent) => {
            messageCallback(event.data);
            console.log(event.data);
        });
    }
}
