import { getExtensionStorage } from './storage';

async function startup(): Promise<void> {
    const storage = await getExtensionStorage();
    Object.keys(storage).forEach((configKey: string) => {
        console.log(`
Config:
${configKey}
Value:
${storage[configKey]}
        `);
    });
}

window.addEventListener('DOMContentLoaded', startup);
