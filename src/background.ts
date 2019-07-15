import { debounce } from 'lodash';

import { checkIsGitHubDotCom, parseURL, checkIsCodeView, findCodeCellFromContainer } from './utils';
import { logger, field } from './logger';
import { MessageReader, MessageWriter, Connection } from './connection';
import { ServerConnectStatus, Disposeable } from './types';
import { TypeScriptExtensionsChannel, wsAddress } from './constants';
import { hover } from './codeviewActions';
import { InitializeArguments, InitializeResponse, DocumentSymbolArguments, InitializeFaliedResponse } from './protocol';

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

        const disposes: Disposeable[] = [];
        websocket.onopen = () => {
            logger.debug('Connection success.');

            // messageChannelPort.postMessage({ event: ServerConnectStatus.connected });

            const [ domain, owner, project ] = githubUrl.rawRepoName.split('/');
            const gitCloneUrl = `git@${domain}:${owner}/${project}`;
    
            logger.info('Prepare initialize LSIF server.', field('url', gitCloneUrl));

            const initArguments = {
                projectName: githubUrl.rawRepoName,
                url: gitCloneUrl,
                commit: githubUrl.pageType === 'blob' && githubUrl.revAndFilePath.split('/').shift()
            }

            connection.sendRequest<InitializeArguments, InitializeResponse | InitializeFaliedResponse>('initialize', initArguments)
                .then((result) => {
                    logger.info(`Initialize: ${result.initialized ? 'success' : 'failed'} ${result.initialized === false && result.message}`);

                    if(result.initialized && githubUrl.pageType === 'blob') {
                        const documentSymbolArgument = {
                            textDocument: {
                                uri: githubUrl.revAndFilePath.split('/').pop(),
                            },
                        };

                        connection.sendRequest<DocumentSymbolArguments, {}>('documentSymbol', documentSymbolArgument)
                            .then((res) => {
                                console.log(res);
                            });
                    } else {
                        // Nothing...
                    }
                });

            // Find all code cells from vode view.
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
        }

        websocket.onclose = () => {
            logger.info('Lost connection...');

            // messageChannelPort.postMessage({ event: ServerConnectStatus.disconnect });
            // messageChannelPort.disconnect();

            for (const disposeable of disposes) {
                disposeable.dispose();
            }
        }

    } else {
        logger.info('No GitHub repository found.');
    }
}
