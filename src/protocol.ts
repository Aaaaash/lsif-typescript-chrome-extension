import { lsp } from 'lsif-protocol';

export enum Event {
    Request = 'request',
    Notification = 'notification',
    Response = 'response',
}

export enum Request {
    INITIALIZE = 'initialize',
}

export enum Notification {

}

export interface Message<T> {
    type: Event;
    id: number;
    method?: Request;
    notifyType?: Notification;
    arguments: T;
}

export interface InitializeArguments {
    projectName: string;
    url: string;
    commit?: string;
};

export type InitializeResponse = boolean;

interface TextDocumentInentifier {
    uri: string;
}

export interface DocumentSymbolArguments {
    textDocument: TextDocumentInentifier;
}

export interface TextDocumentPositionArguments {
    textDocument: TextDocumentInentifier;
    position: lsp.Position;
}

export type InitializeRequest = Message<InitializeArguments>;

export type DocumentSymbolRequest = Message<DocumentSymbolArguments>;

export type FindReferencesRequest = Message<TextDocumentPositionArguments>;

export type GotoDefinitionRequest = Message<TextDocumentPositionArguments>;

export type HoverRequest = Message<TextDocumentPositionArguments>;
