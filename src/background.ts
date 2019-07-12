import { checkIsGitHubDotCom, parseURL, checkIsCodeView } from './utils';
import { logger, field } from './logger';
import { MessageReader, MessageWriter, Connection } from './connection';
import { LSIFServerConnectStatus } from './types';
import { LSIFTypeScriptExtensionsChannel, wsAddress } from './constants';

const port = chrome.runtime.connect({ name: LSIFTypeScriptExtensionsChannel });

if(checkIsGitHubDotCom()) {
    logger.info('LSIF Extension is running.');

    const githubUrl = parseURL(window.location);

    if (githubUrl) {
        port.postMessage({ event: LSIFServerConnectStatus.connecting });
        logger.info('GitHub Repo infomation', field('repo', githubUrl));

        const websocket = new WebSocket(wsAddress);
        const messageReader = new MessageReader(websocket);
        const messageWriter = new MessageWriter(websocket);
        const connection = new Connection(messageReader, messageWriter);

        connection.listen();

        websocket.onopen = () => {
            logger.debug('Connection success.');

            port.postMessage({ event: LSIFServerConnectStatus.connected });

            const [ domain, owner, project ] = githubUrl.rawRepoName.split('/');
            const gitCloneUrl = `git@${domain}:${owner}/${project}`;
    
            logger.info('Prepare initialize LSIF server.', field('url', gitCloneUrl));
    
            const initializeRequest = JSON.stringify({
                type: 'request',
                method: 'initialize',
                id: 0,
                arguments: {
                    projectName: githubUrl.rawRepoName,
                    url: gitCloneUrl,
                    commit: githubUrl.pageType === 'blob' && githubUrl.revAndFilePath.split('/').shift()
                }
            });

            connection.sendRequest(initializeRequest);
        }

        websocket.onclose = () => {
            logger.info("Lost connection...");

            port.postMessage({ event: LSIFServerConnectStatus.disconnect });
        }

        const tableElement = document.querySelector('table');

        const isCodeView = checkIsCodeView(tableElement);

        if (isCodeView) {

        } else {
            logger.info('No GitHub Code View found.');
        }
    } else {
        logger.info('No GitHub repository found.');
    }
}
