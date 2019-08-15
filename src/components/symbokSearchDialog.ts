// @ts-ignore
import cssString from 'cssToString!!./symbol-search-dialog.css';

class SymbolSearchDialog extends HTMLElement {
    private container: HTMLElement;
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'closed' });

        const style = document.createElement('style');
        style.textContent = cssString;

        this.container = document.createElement('div');
        this.container.className = 'lsif-ts-ext-symbol-search-dialog';

        shadowRoot.appendChild(style);
        shadowRoot.appendChild(this.container);
    }

    static get observedAttributes(): string[] { return ['data-show']; }

    connectedCallback(): void {

    }

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string): void {
        switch (name) {
            case 'data-show':
                if (newValue === oldValue) {
                    return;
                }

                if (newValue === 'true') {
                    this.container.classList.add('lsif-ts-ext-symbol-search-show');
                } else if (newValue === 'false') {
                    this.container.classList.remove('lsif-ts-ext-symbol-search-show');
                }
                console.log(oldValue, newValue);
                break;
            default:
                break;
        }
    }
}

const symbolSearchDialog = 'symbol-search-dialog';

window.customElements.define(symbolSearchDialog, SymbolSearchDialog);
