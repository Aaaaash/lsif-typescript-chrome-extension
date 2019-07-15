import { debounce } from 'lodash';

import { checkIsGitHubDotCom, parseURL, checkIsCodeView, findCodeCellFromContainer } from './utils';
import { logger, field } from './logger';
import { MessageReader, MessageWriter, Connection } from './connection';
import { LSIFServerConnectStatus, Disposeable } from './types';
import { LSIFTypeScriptExtensionsChannel, wsAddress } from './constants';
import { hover } from './codeviewActions';

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

        const disposes: Disposeable[] = [];
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
            logger.info('Lost connection...');

            port.postMessage({ event: LSIFServerConnectStatus.disconnect });

            for (const disposeable of disposes) {
                disposeable.dispose();
            }
        }

        const codeView = document.querySelector('table');
        const isCodeView = checkIsCodeView(codeView);

        if (isCodeView) {
            const debouncedHover = debounce(hover, 250);
            codeView.addEventListener('mousemove', debouncedHover);
            disposes.push({
                dispose: () => {
                    codeView.removeEventListener('mousemove', debouncedHover);
                },
            });
        } else {
            logger.info('No GitHub Code View found.');
        }
    } else {
        logger.info('No GitHub repository found.');
    }
}
