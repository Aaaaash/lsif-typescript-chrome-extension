import ReconnectingWebSocket from 'reconnecting-websocket';

import { logger } from './logger';
import { startup } from './startup';
import { wsAddress } from './constants';
import { ServerConnectStatus, ExtensionWindow, PostMessageEventType, Disposable } from './types';

logger.info('LSIF TypeScript extension is running.');

let connectStatus = ServerConnectStatus.disconnect;
// For popup page
(window as ExtensionWindow).getConnectStatus = () => connectStatus;

const retryOptions = {
    maxRetries: 10,
    maxReconnectionDelay: 5000, 
};

let runtimeMessageDispose: Disposable | undefined;

const websocket = new ReconnectingWebSocket(wsAddress, [], retryOptions);
const onOpen = (): void => {
    connectStatus = ServerConnectStatus.connected;
    logger.info('Connect success.');
    runtimeMessageDispose = startup(websocket, (window as ExtensionWindow).getConnectStatus);
}

websocket.addEventListener('open', onOpen); 

chrome.extension.onRequest.addListener((request, sender, sendResponse) => {
    switch (request.event) {
        case PostMessageEventType.reconnect: {
            logger.debug('Reconnecting');
            websocket.reconnect();
            const repoter = (): void => {
                logger.debug('Reconnect success, restartup app...');
                websocket.removeEventListener('open', repoter);
                connectStatus = ServerConnectStatus.connected;
                // startup(websocket, (window as ExtensionWindow).getConnectStatus);
                sendResponse({ event: 'RECONNECT_SUCCESS' });
            };
            websocket.addEventListener('open', repoter); 
            break;
        }
        default:
            break;
    }
});

websocket.addEventListener('close', () => {
    connectStatus = ServerConnectStatus.disconnect;
    if(runtimeMessageDispose) {
        runtimeMessageDispose.dispose();
    }
});
