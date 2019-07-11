import { checkIsGitHubDotCom, parseURL } from './utils';
import { logger, field } from './logger';
import { MessageReader } from './messageReader';
import { MessageWriter } from './messageWriter';
import { Connection } from './connection';

if(checkIsGitHubDotCom()) {
    logger.info('LSIF Extension is running.');

    const githubUrl = parseURL(window.location);
    if (githubUrl) {
        logger.info('GitHub Repo infomation', field('repo', githubUrl));

        const websocket = new WebSocket('ws://localhost:8088');
        const messageReader = new MessageReader(websocket);
        const messageWriter = new MessageWriter(websocket);
        const connection = new Connection(messageReader, messageWriter);

        connection.listen();

        websocket.onopen = () => {
            logger.debug('Connection success.');

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
                }
            });
    
            connection.sendRequest(initializeRequest);
        }

    } else {
        logger.warn('No GitHub repository found.');
    }
}
