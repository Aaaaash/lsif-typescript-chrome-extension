import { defaultStorageConfig } from './constants';
import { DocumentSymbol } from 'vscode-languageserver-types';

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
    getConnectStatus(): ServerConnectStatus;
}

export enum NormalEventType {
    checkConnect = 'CHECK_CONNECT',
    getStorage = 'GET_EXTENSION_STORAGE',
};

export enum PostMessageEventType {
    normalEvent = 'NORMAL_EVENT',
    response = 'RESPONSE',
    request = 'REQUEST',
    dispose = 'DISPOSE',
    reconnect = 'RECONNECT',
    restartup = 'RESTARTUP',
};

export enum RepoType {
    github = 'GitHub',
    coding = 'CODING Enterprise', // CODING Enterprise.
};

export type ExtensionStorage = typeof defaultStorageConfig;

export interface FlatDocumentSymbol extends DocumentSymbol {
    parent: string | null;
}
