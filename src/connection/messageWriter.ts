export class MessageWriter {
    constructor(private socket: WebSocket) {}

    public write(message: string): void {
        this.socket.send(message);
    }
}
