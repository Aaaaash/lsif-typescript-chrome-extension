import { parseRepoURL, checkAndEnsureRepoType, nativeHistoryWrapper } from './utils';
import { logger, field } from './logger';
import { AgentConnection } from './connection';
import { CodeHost } from './codeHost';
import { ServerConnectStatus, RepoType, ExtensionStorage } from './types';

import './style/main.css';

logger.info('Start Extensions.');

const wrappedPushState = nativeHistoryWrapper('pushState');
window.history.pushState = wrappedPushState;

const startup = (agent: AgentConnection, githubUrl, repoType: RepoType, storage: ExtensionStorage): void => {
    const codeHost = new CodeHost(agent, repoType, storage);
    codeHost.start(githubUrl);

    agent.onDispose(() => {
        codeHost.dispose();
        logger.info('Websocket disconnect, cleanup all effects.');
    });
}

const startupWithBlobPage = async (githubUrl, repoType: RepoType): Promise<void> => {
    logger.info(`${repoType} blob page.`);
    const agent = new AgentConnection();

    const extensionStorage = await agent.getExtensionStorage();
    if (extensionStorage.enable) {
        const connectStatus = await agent.checkConnect();
        logger.debug(`Check connect ${connectStatus}`);
        if (connectStatus === ServerConnectStatus.connected) {
            startup(agent, githubUrl, repoType, extensionStorage);
        }
    } else {
        logger.warn('Extension is disabled');
    }
}

const repoType = checkAndEnsureRepoType();

window.addEventListener('pushState', function (e: any) {
    const githubUrl = parseRepoURL(repoType, window.location);
    if (githubUrl.pageType === 'blob') {
        startupWithBlobPage(githubUrl, repoType);
    }
});

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
