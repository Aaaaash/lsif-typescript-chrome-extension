import { injectContentScript } from './utils';
import { Agent } from './connection';
import { TypeScriptExtensionsChannel, storageName } from './constants';

function injectScript(): void {
    const contentScript = chrome.runtime.getURL('out/content.js');
    const targetNode = document.body as HTMLBodyElement;
    injectContentScript(contentScript, targetNode);

    // Forwarding postMessage between content script and injected script.
    const messagePort = chrome.runtime.connect({ name: TypeScriptExtensionsChannel });
    const agent = new Agent(messagePort);
    agent.forward();
}

injectScript();

// console.log(chrome.storage);
chrome.storage.sync.get(storageName, (storage) => {
    console.log(storage);
    if (storage[storageName]) {
        // console.l
    }
});
