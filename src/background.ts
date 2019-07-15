import { checkIsGitHubDotCom, parseURL } from './utils';
import { logger, field } from './logger';
import { MessageReader, MessageWriter, Connection } from './connection';
import { TypeScriptExtensionsChannel, wsAddress } from './constants';
import { CodeViewActions } from './codeviewActions';

import './style/main.css';

const messageChannelPort = chrome.runtime.connect({ name: TypeScriptExtensionsChannel });

messageChannelPort.onDisconnect.addListener((disconnectPort) => {
    console.log(disconnectPort);
});

if(checkIsGitHubDotCom()) {
    logger.info('LSIF Extension is running.');

    const githubUrl = parseURL(window.location);

    if (githubUrl) {
        // messageChannelPort.postMessage({ event: ServerConnectStatus.connecting });
        logger.info('GitHub Repo infomation', field('repo', githubUrl));

        const websocket = new WebSocket(wsAddress);
        const messageReader = new MessageReader(websocket);
        const messageWriter = new MessageWriter(websocket);
        const connection = new Connection(messageReader, messageWriter);

        connection.listen();
        
        websocket.onopen = () => {
            logger.debug('Connection success.');
            const actions = new CodeViewActions(connection);

            actions.initialize(githubUrl);
            // messageChannelPort.postMessage({ event: ServerConnectStatus.connected });
        }

        websocket.onclose = () => {
            logger.info('Lost connection...');

            // messageChannelPort.postMessage({ event: ServerConnectStatus.disconnect });
            // messageChannelPort.disconnect();
        }

    } else {
        logger.info('No GitHub repository found.');
    }
}
