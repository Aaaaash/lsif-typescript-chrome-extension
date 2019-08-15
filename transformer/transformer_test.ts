import * as ts from 'typescript';
import * as fs from 'fs';
// @ts-ignore
const createCssStringTransformer = require('./cssStringTransformer');

const source = `
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
    }

    private updateIconStyle(iconType: string): void {
        this.spanElement.classList.add(\`lsif-ts-ext-symbol-icon-\${iconType}\`);
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

`;

const files: ts.MapLike<{ version: number }> = {};

const rootFileNames = ['/Users/baoxubing/Documents/work/lsif-project/lsif-typescript-chrome-extensions/src/components/symbolIcon.ts'];

rootFileNames.forEach(fileName => {
    files[fileName] = { version: 0 };
});

// Create the language service host to allow the LS to communicate with the host
const servicesHost: ts.LanguageServiceHost = {
    getScriptFileNames: () => rootFileNames,
    getScriptVersion: fileName =>
        files[fileName] && files[fileName].version.toString(),
    getScriptSnapshot: fileName => {
        if (!fs.existsSync(fileName)) {
            return undefined;
        }

        return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString());
    },
    getCurrentDirectory: () => process.cwd(),
    getCompilationSettings: () => ts.getDefaultCompilerOptions(),
    getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
    fileExists: ts.sys.fileExists,
    readFile: ts.sys.readFile,
    readDirectory: ts.sys.readDirectory
};

// Create the language service files
const services = ts.createLanguageService(
    servicesHost,
    ts.createDocumentRegistry()
);


let result = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ESNext },
    transformers: { before: [createCssStringTransformer(services)] },
    fileName: '/Users/baoxubing/Documents/work/lsif-project/lsif-typescript-chrome-extensions/src/components/symbolIcon.ts'
});

console.log('==========from==============')
console.log(source);

console.log('============to===========');
console.log(result.outputText);
