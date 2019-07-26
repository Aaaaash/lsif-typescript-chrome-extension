import { injectContentScript } from './utils';
import { logger } from './logger';
import { Agent } from './connection';
import { TypeScriptExtensionsChannel } from './constants';

function injectScript(): void {
    const contentScript = chrome.runtime.getURL('out/content.js');
    logger.debug(`Content Script URL: ${contentScript}`);
    const targetNode = document.body as HTMLBodyElement;
    injectContentScript(contentScript, targetNode);

    const messagePort = chrome.runtime.connect({ name: TypeScriptExtensionsChannel });
    const agent = new Agent(messagePort);
    agent.forward();
}

injectScript();
