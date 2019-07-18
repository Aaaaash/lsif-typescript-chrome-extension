import { logger, field } from './logger';
import { wsAddress, TypeScriptExtensionsChannel } from './constants';
import { ServerConnectStatus, ExtensionWindow, PostMessageEventType, NormalEventType } from './types';
import { MessageReader, MessageWriter, Connection } from './connection';

logger.info('LSIF TypeScript extension is running.');

let connectStatus = ServerConnectStatus.disconnect;
// For popup page
(window as ExtensionWindow).getConnectStatus = () => connectStatus;

const websocket = new WebSocket(wsAddress);
websocket.addEventListener('open', (ev) => {
    connectStatus = ServerConnectStatus.connected;

    const websocket = new WebSocket(wsAddress);
    const messageReader = new MessageReader(websocket);
    const messageWriter = new MessageWriter(websocket);
    const connection = new Connection(messageReader, messageWriter);
    connection.listen();

    chrome.runtime.onConnect.addListener((messagePort) => {
        logger.info(messagePort.name);
        console.assert(messagePort.name === TypeScriptExtensionsChannel);
        const { sender: { tab, url, id } } = messagePort;
        logger.debug('Sender', field('info', { url, id, tab: tab.id }));

        messagePort.onMessage.addListener(async (message) => {
            logger.debug(message);
            switch(message.event) {
                case PostMessageEventType.normalEvent:
                    switch(message.data.eventType) {
                        case NormalEventType.checkConnect:
                            messagePort.postMessage({
                                event: PostMessageEventType.normalEvent,
                                data: {
                                    eventType: NormalEventType.checkConnect,
                                    result: connectStatus,
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


        websocket.addEventListener('close', () => {
            messagePort.postMessage({
                event: PostMessageEventType.dispose,
            });
        });
    });

    logger.info('Connect success.');
}); 

websocket.addEventListener('close', () => {
    connectStatus = ServerConnectStatus.disconnect;
});
