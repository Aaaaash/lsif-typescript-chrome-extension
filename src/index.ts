import { parseRepoURL, checkAndEnsureRepoType } from './utils';
import { logger, field } from './logger';
import { ContentConnection } from './connection';
import { TypeScriptExtensionsChannel } from './constants';
import { CodeView } from './codeview';
import { ServerConnectStatus, RepoType } from './types';

import './style/main.css';

const startup = (connection: ContentConnection, githubUrl, repoType: RepoType): void => {
    const codeview = new CodeView(connection, repoType);
    codeview.start(githubUrl);

    connection.onDispose(() => {
        codeview.dispose();
        logger.info('Websocket disconnect, cleanup all effects.');
    });
}

const startupWithBlobPage = (githubUrl, repoType: RepoType): void => {
    logger.info(`${repoType} blob page.`);
    const messagePort = chrome.runtime.connect({ name: TypeScriptExtensionsChannel });
    const connection = new ContentConnection(messagePort);

    connection.checkConnect()
        .then((response) => {
            logger.debug(`Check connect ${response}`);
            if (response === ServerConnectStatus.connected) {
                startup(connection, githubUrl, repoType);
            }
        });
}

const repoType = checkAndEnsureRepoType();

if (repoType) {
    logger.info(`LSIF Extension is running for ${repoType}.`);
    const githubUrl = parseRepoURL(repoType, window.location);

    if (githubUrl) {
        logger.info(`${repoType} Repository.`, field('repo', githubUrl));

        switch (githubUrl.pageType) {
            // Only enable in blob page for now.
            case 'blob':
                startupWithBlobPage(githubUrl, repoType);
                break;
            default:
                break;
        }
    } else {
        logger.info('No GitHub repository found.');
    }
}
