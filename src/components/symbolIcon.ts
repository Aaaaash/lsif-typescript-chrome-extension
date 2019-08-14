import cssString from 'cssToString!!../style/symbol-icons.css';

class SymbolIcon extends HTMLElement {
    private spanElement: HTMLSpanElement;
    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = cssString;

        this.spanElement = document.createElement('span');
        this.spanElement.className = 'lsif-ts-ext-symbol-icon';
        
        shadowRoot.appendChild(this.spanElement);
        shadowRoot.appendChild(style);
    }

    private updateIconStyle(iconType: string): void {
        this.spanElement.classList.add(`lsif-ts-ext-symbol-icon-${iconType}`);
    }

    connectedCallback(): void {}

    attributeChangedCallback(name: string, oldValue: string | null, newValue: string): void {
        if (name === 'data-icon' && oldValue !== newValue) {
            this.updateIconStyle(newValue);
        }
    }

    static get observedAttributes(): string[] { return ['data-icon']; }
}

const customElementName = 'symbol-icon';

window.customElements.define(customElementName, SymbolIcon);
