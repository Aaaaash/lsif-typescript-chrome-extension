// @ts-ignore
import cssString from 'cssToString!!./symbol-search-dialog.css';
import { createSymbolIconNode, createDescriptionNode } from '../domUtils';
import { DocumentSymbol } from 'vscode-languageserver-types';

class SymbolSearchDialog extends HTMLElement {
    private container: HTMLElement;

    private symbolList: HTMLElement;

    constructor() {
        super();
        const shadowRoot = this.attachShadow({ mode: 'closed' });

        const style = document.createElement('style');
        style.textContent = cssString;

        this.container = document.createElement('div');
        this.container.className = 'lsif-ts-ext-symbol-search-dialog';

        this.symbolList = document.createElement('div');
        this.symbolList.className = 'lsif-ts-ext-symbol-search-list';

        const input = document.createElement('input');

        shadowRoot.appendChild(style);
        shadowRoot.appendChild(this.container);
        this.container.appendChild(input);
        this.container.appendChild(this.symbolList);
    }

    static get observedAttributes(): string[] { return ['data-show']; }


    private makeSymbolAreaHref(symbol: DocumentSymbol): string {
        const { range: { start, end } } = symbol;
        const { domain, owner, project, tagOrCommit, relativePath  } = JSON.parse(this.dataset['blobdetail']);
        return `https:\/\/${domain}\/${owner}\/${project}\/blob\/${tagOrCommit}\/${relativePath}#L${start.line + 2}#L${end.line + 2}`;
    }

    private renderSymbolList(): void {
        const symbolTree = JSON.parse(this.dataset['symboltree']);
        const symbolDomList = symbolTree.map((symbol) => {
            const p = document.createElement('p');
            const icon = createSymbolIconNode(symbol);
            p.className += 'lsif-ts-ext-symbol-search-element';
            p.appendChild(icon);
            p.innerHTML += symbol.name;
            if (symbol.parent) {
                const desc = createDescriptionNode(symbol.parent);
                p.appendChild(desc);
            }
            p.dataset['symbolInfo'] = JSON.stringify(symbol);
            return p;
        });
        for(const element of symbolDomList) {
            element.addEventListener('click', () => {
                const symbolInfo: DocumentSymbol = JSON.parse(element.dataset['symbolInfo']);
                window.location.href = this.makeSymbolAreaHref(symbolInfo);
            });
            this.symbolList.appendChild(element);
        }
    }

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
                    this.renderSymbolList();
                } else if (newValue === 'false') {
                    this.container.classList.remove('lsif-ts-ext-symbol-search-show');
                }
                break;
            default:
                break;
        }
    }
}

const symbolSearchDialog = 'symbol-search-dialog';

window.customElements.define(symbolSearchDialog, SymbolSearchDialog);
