import { lsp } from 'lsif-protocol';

export enum Event {
    Request = 'request',
    Notification = 'notification',
    Response = 'response',
}

export enum Request {
    INITIALIZE = 'initialize',
}

export enum Notification {}

export interface Message<T> {
    type: Event;
    id: number;
    method?: Request;
    notifyType?: Notification;
    arguments: T;
}

export interface InitializeArguments {
    repository: string;
    url: string;
    commit: string;
};

export interface InitializeResponse {
    initialized: true;
    commit: string;
};

export interface InitializeFaliedResponse {
    initialized: false;
    message: string;
};

interface TextDocumentInentifier {
    uri: string;
}

export interface DocumentSymbolArguments {
    textDocument: TextDocumentInentifier;
    commit: string;
    repository: string;
}

export interface TextDocumentPositionArguments {
    textDocument: TextDocumentInentifier;
    position: lsp.Position;
    commit: string;
    repository: string;
}

export type InitializeRequest = Message<InitializeArguments>;

export type DocumentSymbolRequest = Message<DocumentSymbolArguments>;

export type FindReferencesRequest = Message<TextDocumentPositionArguments>;

export type GotoDefinitionRequest = Message<TextDocumentPositionArguments>;

export type HoverRequest = Message<TextDocumentPositionArguments>;
