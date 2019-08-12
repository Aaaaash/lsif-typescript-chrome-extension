import { logger } from '../logger';
import { CONNECTION_TYPE } from '../constants';

export class Agent {
    private messageSource: MessageEventSource;

    private messageOrigin: string;

    constructor(private messagePort: chrome.runtime.Port) {
        this.messagePort.onDisconnect.addListener((port) => {
            logger.warn(`Message Port ${port.name} disconnect.`);
        });
    }

    private injectMessageHandler = (message: MessageEvent): void => {
        if (message.data.source && message.data.source === CONNECTION_TYPE.agent) {
            return;
        }
        
        if (typeof message !== 'object' || message === null || !message.data.event) {
            return;
        }

        if (!this.messageSource) {
            this.messageSource = message.source;
        }

        if (!this.messageOrigin) {
            this.messageOrigin = message.origin;
        }

        this.messagePort.postMessage(message.data);
    }

    private backgroundMesageHandler = (message): void => {
        // @ts-ignore
        this.messageSource.postMessage({ ...message, source: CONNECTION_TYPE.agent }, this.messageOrigin);
    }

    public forward(): void {
        logger.info('Forwarding message between injected script and background script.');
        window.addEventListener('message', this.injectMessageHandler);
        this.messagePort.onMessage.addListener(this.backgroundMesageHandler);
    }

    public dispose(): void {
        window.removeEventListener('message', this.injectMessageHandler);
        this.messagePort.onMessage.removeListener(this.backgroundMesageHandler);
        this.messagePort.disconnect();
    }
}
