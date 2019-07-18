import { PostMessageEventType, ServerConnectStatus, NormalEventType } from '../types';

export class ContentConnection {
    private req: number = 0;

    private responseCallBack: Map<number, (response: any) => any> = new Map();

    private normalEventCallback: Map<NormalEventType, (response: any) => any> = new Map(); 

    private disposeCallback: () => void;

    constructor(private messagePort: chrome.runtime.Port) {
        messagePort.onMessage.addListener((message) => {
            switch (message.event) {
                case PostMessageEventType.response:
                    const resHandler = this.responseCallBack.get(message.id);
                    resHandler(message.data.result);
                    break;
                case PostMessageEventType.normalEvent:
                    const eventHandler = this.normalEventCallback.get(message.data.eventType);
                    eventHandler(message.data.result);
                    break;
                case PostMessageEventType.dispose:
                    this.disposeCallback();
                    this.dispose();
                    break;
                default:
                    break;
            }
        });
    }

    public sendRequest<T, R>(method: string, message: T): Promise<R> {
        const id = this.req += 1;
        return new Promise((resolve, reject) => {
            this.messagePort.postMessage({
                id,
                event: PostMessageEventType.request,
                data: {
                    method,
                    type: 'request',
                    arguments: message,
                }
            });

            this.responseCallBack.set(id, (response: R) => {
                resolve(response);
            });
        });
    }

    public checkConnect(): Promise<ServerConnectStatus> {
        return new Promise((resolve, reject) => {
            this.messagePort.postMessage({
                event: PostMessageEventType.normalEvent,
                data: {
                    eventType: NormalEventType.checkConnect,
                },
            });

            this.normalEventCallback.set(NormalEventType.checkConnect, (response) => {
                resolve(response);
            });
        });
    }
    
    public dispose(): void {
        this.messagePort.disconnect();
    }

    public onDispose(callback): void {
        this.disposeCallback = callback;
    }
}
