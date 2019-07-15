export enum LSIFServerConnectStatus {
    connecting = 'CONNECTING',
    connected = 'CONNECTED',
    disconnect = 'DISCONNECT',
}

export interface Disposeable {
    dispose: () => void;
}

// zero base
export interface Position {
    line: number;
    character: number;
}
