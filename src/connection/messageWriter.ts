export class MessageWriter {
    constructor(private socket: WebSocket) {}

    public write(message: string) {
        console.log(message);
        this.socket.send(message);
    }
}
