import { findCodeCellFromContainer, checkTargetIsCodeCellChildren } from './utils';

export function hover(ev: MouseEvent): void {
    const codeView = document.querySelector('table');
    const codeCells = findCodeCellFromContainer(codeView);

    if (ev.target instanceof HTMLElement) {
        if (checkTargetIsCodeCellChildren(ev.target, codeCells)) {
            console.log('bingo.');
        }
    }
}

export function documentSymbols() {

}
