export enum ServerConnectStatus {
    connecting = 'CONNECTING',
    connected = 'CONNECTED',
    disconnect = 'DISCONNECT',
}

export interface Disposable {
    dispose: () => void;
}

// zero base
export interface Position {
    line: number;
    character: number;
}
