import { checkIsGitHubDotCom, parseURL } from './utils';
import { logger, field } from './logger';
import { ContentConnection } from './connection';
import { TypeScriptExtensionsChannel } from './constants';
import { CodeViewActions } from './codeviewActions';
import { ServerConnectStatus } from './types';

import './style/main.css';

if(checkIsGitHubDotCom()) {
    logger.info('LSIF Extension is running.');
    const githubUrl = parseURL(window.location);

    if (githubUrl) {
        logger.info('GitHub Repo infomation', field('repo', githubUrl));

        logger.debug('Check message channel connect status...');

        const messagePort = chrome.runtime.connect({ name: TypeScriptExtensionsChannel });
        const connection = new ContentConnection(messagePort);

        connection.checkConnect()
            .then((response) => {
                logger.debug(`Check connect ${response}`);

                if (response === ServerConnectStatus.connected) {
                    const codeviewActions = new CodeViewActions(connection);
                    codeviewActions.start(githubUrl);

                    connection.onDispose(() => {
                        codeviewActions.dispose();
                        logger.info('Websocket disconnect, cleanup all effects.');
                    });
                }
            });
    } else {
        logger.info('No GitHub repository found.');
    }
}
