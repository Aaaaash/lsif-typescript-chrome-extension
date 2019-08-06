import { getExtensionStorage, updateExtensionStorage } from './storage';

async function startup(): Promise<void> {
    const storage = await getExtensionStorage();
    const disposes = Object.keys(storage).map((configKey: string) => {
        const element: HTMLInputElement = document.querySelector(`.${configKey}`);        
        if (element) {
            element.checked = storage[configKey];
            const changeHandler = async (e: MouseEvent): Promise<void> => {
                const newConfig = {
                    [configKey]: (e.target as HTMLInputElement).checked,
                };
                await updateExtensionStorage(newConfig);
            }
            element.addEventListener('change', changeHandler);
            return () => {
                element.removeEventListener('change', changeHandler);
            };
        }
        return () => {};
    });

    window.addEventListener('close', () => {
        for (const dispose of disposes) {
            dispose();
        }
    });
}

window.addEventListener('DOMContentLoaded', startup);
