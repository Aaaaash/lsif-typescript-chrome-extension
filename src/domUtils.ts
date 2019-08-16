import { DocumentSymbol } from 'vscode-languageserver-types';
import { symbolKindNames } from './constants';

export function createSymbolIconNode(symbol: DocumentSymbol): HTMLSpanElement {
    const span = document.createElement('symbol-icon');
    span.setAttribute('data-icon', symbolKindNames[symbol.kind]);
    return span;
}

export function createDescriptionNode(text: string): HTMLSpanElement {
    const span = document.createElement('span');
    span.className = 'lsif-ts-ext-symbol-description';
    span.innerText = text;
    return span;
}

export function preventDefaultStopPropagation(e): void {
    e.stopPropagation();
    e.preventDefault();
}
