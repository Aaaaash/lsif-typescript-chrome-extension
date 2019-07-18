import { Connection } from './connection';
import { logger, field } from './logger';
import { TypeScriptExtensionsChannel } from './constants';
import { PostMessageEventType, NormalEventType, ServerConnectStatus } from './types';

export function runtimeMessageHandler(
    messagePort: chrome.runtime.Port,
    connection: Connection,
    handleDisconnect: (messagePort: chrome.runtime.Port) => void,
    connectStatusGetter: () => ServerConnectStatus,
): void {
    logger.info(messagePort.name);
    console.assert(messagePort.name === TypeScriptExtensionsChannel);
    const { sender: { tab, url, id } } = messagePort;
    logger.debug('Sender', field('info', { url, id, tab: tab.id }));

    messagePort.onMessage.addListener(async (message) => {
        switch(message.event) {
            case PostMessageEventType.normalEvent:
                switch(message.data.eventType) {
                    case NormalEventType.checkConnect:
                        messagePort.postMessage({
                            event: PostMessageEventType.normalEvent,
                            data: {
                                eventType: NormalEventType.checkConnect,
                                result: connectStatusGetter(),
                            },
                        });
                        break;
                    default:
                        break;
                }
                break;
            case PostMessageEventType.request:
                const { data, id } = message;
                const response = await connection.sendRequest(data.method, data.arguments);
                messagePort.postMessage({
                    event: PostMessageEventType.response,
                    id,
                    data: {
                        result: response,
                    },
                });
                break;
            default:
                break;
        };
    });

    handleDisconnect(messagePort);
}
