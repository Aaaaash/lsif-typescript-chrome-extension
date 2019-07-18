import ReconnectingWebSocket from 'reconnecting-websocket';

export class MessageWriter {
    constructor(private socket: ReconnectingWebSocket) {}

    public write(message: string): void {
        this.socket.send(message);
    }
}
