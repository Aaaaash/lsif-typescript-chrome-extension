import { NormalEventType, PostMessageEventType, ServerConnectStatus } from '../types';
import { AGENTCONNECTION } from '../constants';

export class AgentConnection {
    
    private req: number = 0;

    private responseCallBacks: Map<number, (response: any) => any> = new Map();

    private rpcEventCallbacks: Map<NormalEventType, (response: any) => any> = new Map(); 

    private disposeCallback: () => void;

    constructor() {
        window.addEventListener('message', this.postMessageHandler);
    }

    private postMessageHandler = (message: MessageEvent): void => {
        if (message.data.source && message.data.source === AGENTCONNECTION) {
            return;
        }

        const { data: { event, id, data } } = message;
        switch (event) {
            case PostMessageEventType.response:
                const resHandler = this.responseCallBacks.get(id);
                resHandler(data.result);
                break;
            case PostMessageEventType.normalEvent:
                const eventHandler = this.rpcEventCallbacks.get(data.eventType);
                eventHandler(data.result);
                break;
            case PostMessageEventType.dispose:
                this.disposeCallback();
                break;
            default:
                break;
        }
    }

    public sendRequest<T, R>(method: string, message: T): Promise<R> {
        const id = this.req += 1;
        return new Promise((resolve, reject) => {
            this.postMesasge({
                id,
                event: PostMessageEventType.request,
                data: {
                    method,
                    type: 'request',
                    arguments: message,
                }
            });

            this.responseCallBacks.set(id, (response: R) => {
                resolve(response);
            });
        });
    }

    public checkConnect(): Promise<ServerConnectStatus> {
        return new Promise((resolve, reject) => {
            this.postMesasge({
                event: PostMessageEventType.normalEvent,
                data: {
                    eventType: NormalEventType.checkConnect,
                },
            });

            this.rpcEventCallbacks.set(NormalEventType.checkConnect, (response) => {
                resolve(response);
            });
        });
    }

    private postMesasge(message): void {
        window.postMessage({ ...message, source: AGENTCONNECTION }, '*');
    }

    public dispose(): void {
        this.req = 0;
        window.removeEventListener('message', this.postMessageHandler);
    }

    public onDispose(callback): void {
        this.disposeCallback = callback;
    }

    // @TODO How restartup?
    public onRestartup(callback): void {
    }
}