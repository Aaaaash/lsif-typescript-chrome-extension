import { parseRepoURL, checkAndEnsureRepoType, nativeHistoryWrapper } from './utils';
import { logger, field } from './logger';
import { AgentConnection } from './connection';
import { CodeHost } from './codeHost';
import { ServerConnectStatus, RepoType, ExtensionStorage } from './types';
import { getStorage } from './storage';

import './style/main.css';

logger.info('Start Extensions.');

getStorage<ExtensionStorage>()
    .then((res) => {
        if (res.enableExtension) {
            const wrappedPushState = nativeHistoryWrapper('pushState');
            window.history.pushState = wrappedPushState;
            
            const startup = (agent: AgentConnection, githubUrl, repoType: RepoType): void => {
                const codeHost = new CodeHost(agent, repoType);
                codeHost.start(githubUrl);
            
                agent.onDispose(() => {
                    codeHost.dispose();
                    logger.info('Websocket disconnect, cleanup all effects.');
                });
            }

            const startupWithBlobPage = (githubUrl, repoType: RepoType): void => {
                logger.info(`${repoType} blob page.`);
                const agent = new AgentConnection();

                agent.checkConnect()
                    .then((response) => {
                        logger.debug(`Check connect ${response}`);
                        if (response === ServerConnectStatus.connected) {
                            startup(agent, githubUrl, repoType);
                        }
                    });
            }

            const repoType = checkAndEnsureRepoType();

            if (
                (repoType === RepoType.coding && !res.enableCodingEnterprise) ||
                (repoType === RepoType.github && !res.enableGitHub)
            ) {
                return;
            }

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
        }
    });
