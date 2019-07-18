import { checkIsGitHubDotCom, parseURL } from './utils';
import { logger, field } from './logger';
import { ContentConnection } from './connection';
import { TypeScriptExtensionsChannel } from './constants';
import { GitHubCodeView } from './codeViews';
import { ServerConnectStatus } from './types';

import './style/main.css';

const startup = (connection: ContentConnection, githubUrl): void => {
    const codeview = new GitHubCodeView(connection);
    codeview.start(githubUrl);

    connection.onDispose(() => {
        codeview.dispose();
        logger.info('Websocket disconnect, cleanup all effects.');
    });
}

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
                    startup(connection, githubUrl);
                }
            });

        // connection.onRestartup(() => {
        //     const messagePort = chrome.runtime.connect({ name: TypeScriptExtensionsChannel });
        //     const newConnection = new ContentConnection(messagePort);
        //     startup(newConnection, githubUrl);
        // });
    } else {
        logger.info('No GitHub repository found.');
    }
}
