import ReconnectingWebSocket from 'reconnecting-websocket';

import { logger } from './logger';
import { MessageReader, MessageWriter, Connection } from './connection';
import { Disposable, PostMessageEventType, ServerConnectStatus } from './types';
import { runtimeMessageHandler } from './runtimeMessageHandler';

export function startup(
    ws: ReconnectingWebSocket,
    connectStatusGetter: () => ServerConnectStatus,
): Disposable {
    const messageReader = new MessageReader(ws);
    const messageWriter = new MessageWriter(ws);
    const connection = new Connection(messageReader, messageWriter);
    connection.listen();

    const messageHandler = (messagePort: chrome.runtime.Port): void =>
        runtimeMessageHandler(
            messagePort,
            connection,
            (messagePort) => {
                ws.addEventListener('close', () => {
                    messagePort.postMessage({ event: PostMessageEventType.dispose, })
                });
            },
            connectStatusGetter,
        );

    chrome.runtime.onConnect.addListener(messageHandler);

    return {
        dispose: () => {
            chrome.runtime.onConnect.removeListener(messageHandler);
        },
    };
}
