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

if (checkIsGitHubDotCom()) {
    logger.info('LSIF Extension is running.');
    const githubUrl = parseURL(window.location);

    if (githubUrl) {
        logger.info('GitHub Repository infomation', field('repo', githubUrl));

        switch (githubUrl.pageType) {
            // Only enable in blob page for now.
            case 'blob':
            {
                logger.info('GitHub blob page, enable code navigate and hover action.');
                const messagePort = chrome.runtime.connect({ name: TypeScriptExtensionsChannel });
                const connection = new ContentConnection(messagePort);

                connection.checkConnect()
                    .then((response) => {
                        logger.debug(`Check connect ${response}`);
                        if (response === ServerConnectStatus.connected) {
                            startup(connection, githubUrl);
                        }
                    });
                break;
            }
            default:
                break;
        }
    } else {
        logger.info('No GitHub repository found.');
    }
}
