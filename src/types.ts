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

export interface ExtensionWindow extends Window {
    getConnectStatus(): string;
}

export enum NormalEventType {
    checkConnect = 'CHECK_CONNECT',
};

export enum PostMessageEventType {
    normalEvent = 'NORMAL_EVENT',
    response = 'RESPONSE',
    request = 'REQUEST',
    dispose = 'DISPOSE',
};
