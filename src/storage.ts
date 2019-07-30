import { storageName } from './constants';

interface IStorage<T> {
    [storageName]: T;
}

export function getStorage<T>(): Promise<T> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(storageName, (storage: IStorage<T>) => {
            if (storage[storageName]) {
                resolve(storage[storageName]);
            }
        });
    });
}
