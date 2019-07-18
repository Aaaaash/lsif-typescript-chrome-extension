import { MessageReader } from './messageReader';
import { MessageWriter } from './messageWriter';
import { logger, field } from '../logger';

interface CallbackFn {
    (response): void;
}

export class Connection {
    
    private req: number = 0;

    private requestCallbacks: Map<number, CallbackFn> = new Map();

    constructor(
        private messageReader: MessageReader,
        private messageWriter: MessageWriter,
    ) {}

    public listen(): void {
        this.messageReader.listen(this.messageCallback);
    }

    private messageCallback = (message: string): void => {
        const resOrNotice = JSON.parse(message);

        if (resOrNotice.result) {
            const { id, result } = resOrNotice;
            const callback = this.requestCallbacks.get(id);
            logger.debug('Receive response', field('values', { method: resOrNotice.method, id, result }));
            callback(result);
        }
    }

    public sendRequest<T, R>(method: string, requestArgs: T): Promise<R> {
        const id = this.req += 1;

        const requestMessage = JSON.stringify({
            method,
            id,
            type: 'request',
            arguments: requestArgs,
        });
        return new Promise((resolve, reject) => {
            logger.debug('Send Message', field('message', requestMessage));
            this.messageWriter.write(requestMessage);

            const callback: CallbackFn = (result: R): void => {
                resolve(result);
            };
            this.requestCallbacks.set(id, callback);
        });
    }
}
