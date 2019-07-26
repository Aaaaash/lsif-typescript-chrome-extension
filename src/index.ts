import { parseRepoURL, checkAndEnsureRepoType } from './utils';
import { logger, field } from './logger';
import { ContentConnection } from './connection';
import { TypeScriptExtensionsChannel } from './constants';
import { CodeView } from './codeview';
import { ServerConnectStatus, RepoType } from './types';

import './style/main.css';

function wrap(eventType: string): () => ReturnType<typeof window.top.history['pushState']> {
    const origin = window.top.history[eventType];
    return function () {
        console.log('???');
        console.log(arguments);
        const rev = origin.apply(this, arguments);
        const event = new Event(eventType);
        // @ts-ignore
        event.arguments = arguments;
        window.top.dispatchEvent(event);
        return rev;
    }
}

const wrappedPushState = wrap('pushState');
const wrappedReplaceState = wrap('replaceState');

console.log(window.top === window);
window.top.history.pushState = wrappedPushState;
window.top.history.replaceState = wrappedReplaceState;

window.top.addEventListener('replaceState', function (e) {
    console.log('THEY DID IT AGAIN! replaceState 111111');
});

window.top.addEventListener('pushState', function (e) {
    console.log('THEY DID IT AGAIN! pushState 2222222');
});

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
