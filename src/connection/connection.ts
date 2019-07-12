import { MessageReader } from './messageReader';
import { MessageWriter } from './messageWriter';
import { logger, field } from '../logger';

export class Connection {
    constructor(
        private messageReader: MessageReader,
        private messageWriter: MessageWriter,
    ) {
        logger.info('Connect...');
    }

    public listen(): void {
        this.messageReader.listen(this.messageCallback);
    }

    private messageCallback(message: string) {
        logger.info('Message', field('message', message));
    }

    public sendRequest(message: string): Promise<void> {
        return new Promise((resolve, reject) => {
            logger.debug('Send Message', field('message', message));
            this.messageWriter.write(message);
            resolve();
        });
    }
}
