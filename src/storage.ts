import { storageName, defaultStorageConfig } from './constants';
import { ExtensionStorage } from './types';

interface IStorage<T> {
    [storageName]: T;
}

function initExtensionStorage<T>(storageData): Promise<T> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set(storageData, () => {
            resolve(storageData);
        });
    });
}

export function getExtensionStorage(): Promise<ExtensionStorage> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(storageName, (storage: IStorage<ExtensionStorage>) => {
            if (storage[storageName]) {
                resolve(storage[storageName]);
            } else {
                initExtensionStorage<ExtensionStorage>(defaultStorageConfig)
                    .then(resolve)
            }
        });
    });
}

export function updateExtensionStorage(extensionStorage: ExtensionStorage): Promise<void> {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.set(extensionStorage, resolve);
    });
}
