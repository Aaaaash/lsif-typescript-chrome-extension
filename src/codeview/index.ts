import { debounce } from 'lodash';
import * as marked from 'marked';
import * as hljs from 'highlight.js';
import { lsp } from 'lsif-protocol';
import { DocumentSymbol } from 'vscode-languageserver-types';
import 'highlight.js/styles/github.css';

import {
    memoizedFindCodeCellFromContainer,
    checkTargetIsCodeCellOrChildnodes,
    convertPositionFromCodeCell,
    parseRepoURL,
    checkIsCodeView,
    fillTextNodeForCodeCell,
} from '../utils';
import { logger, field } from '../logger';
import { ContentConnection } from '../connection';
import { InitializeArguments, InitializeResponse, InitializeFaliedResponse, DocumentSymbolArguments } from '../protocol';
import { Disposable, RepoType } from '../types';
import { symbolKindNames, removeQuotes } from '../constants';
import '../style/symbol-icons.css';

marked.setOptions({
    highlight: (code: string, lang: string) => hljs.highlight(lang, code).value,
});

type RepoUrlType = ReturnType<typeof parseRepoURL>;

interface BlobDetail {
    domain: string;
    owner: string;
    project: string;
}

export class CodeView {

    private disposes: Disposable[] = [];

    private codeView: HTMLTableElement;

    private relativePath: string | undefined;

    private commit: string | undefined;

    private blobDetail: BlobDetail | undefined;

    private repository: string;

    constructor(private connection: ContentConnection, private repoType: RepoType) {}

    public start(gitUrl: RepoUrlType): void {
        const [_, owner, project] = gitUrl.rawRepoName.split('/');
        this.repository = `${owner}@${project}`;
 
        const cloneUrl = this.prepareCloneUrl(gitUrl);
        this.blobDetail = this.prapreBlobDetail(gitUrl);

        logger.info('Prepare initialize LSIF server.', field('url', cloneUrl));

        if (gitUrl.pageType === 'blob') {
            this.relativePath = gitUrl.revAndFilePath.split('/').slice(1).join('/');
            const revAndFileArray = gitUrl.revAndFilePath.split('/');
            this.commit = revAndFileArray[0] === 'release' ? `${revAndFileArray[0]}/${revAndFileArray[1]}` : revAndFileArray[0];
        }

        this.initialize(gitUrl, cloneUrl);
    }

    private prepareCloneUrl(gitUrl: RepoUrlType): string | undefined {
        switch(this.repoType) {
            case RepoType.github: {
                const [ domain, owner, project ] = gitUrl.rawRepoName.split('/');
                const cloneUrl = `git@${domain}:${owner}/${project}`;
                return cloneUrl;
            }
            case RepoType.coding: {
                const [ ownerDomain, project ] = gitUrl.rawRepoName.split('/');
                const [ ownerName ] = ownerDomain.split('.');
                const cloneUrl = `git@e.coding.net:${ownerName}/${project}`;
                return cloneUrl;
            }
            default:
                return undefined;
        }
    }

    private prapreBlobDetail(gitUrl: RepoUrlType): BlobDetail {
        switch(this.repoType) {
            case RepoType.github: {
                const [ domain, owner, project ] = gitUrl.rawRepoName.split('/');
                return { domain, owner, project };
            }
            case RepoType.coding: {
                const [ domain, project ] = gitUrl.rawRepoName.split('/');
                const [ owner ] = domain.split('/');
                return {
                    domain,
                    owner,
                    project,
                };
            }
            default:
                return undefined;
        }
    }

    private prepareProjectName(gitUrl: RepoUrlType): string {
        switch (this.repoType) {
            case RepoType.github: 
                return gitUrl.rawRepoName;
            case RepoType.coding: {
                const [ domain, project ] = gitUrl.rawRepoName.split('/');
                const [ domainName ] = domain.split('.');
                return `${domainName}/${project}`;
            }
            default:
                return gitUrl.rawRepoName;
        }
    }

    private prepareBlobJumpUrl(domain: string, owner: string, project: string, line: number | string, filePath: string): string {
        switch(this.repoType) {
            case RepoType.github:
                return `https:\/\/${domain}\/${owner}\/${project}\/blob\/${this.commit}\/${filePath}#L${line}`;
            case RepoType.coding:
                return `https:\/\/${domain}\/p/${project}\/git/blob\/${this.commit}\/${filePath}#L${line}`;
            default:
                return 'blank';
        }
    }

    public dispose(): void {
        for(const disposable of this.disposes) {
            disposable.dispose();
        }
    }

    private async initialize(githubUrl: RepoUrlType, cloneUrl: string): Promise<void> {
        const initResult = await this.connection.sendRequest<InitializeArguments, InitializeResponse | InitializeFaliedResponse>(
            'initialize',
            {
                repository: this.repository,
                url: cloneUrl,
                commit: this.commit,
            },
        );
        logger.info(`Initialize: ${initResult.initialized ? 'success' : 'failed'} ${initResult.initialized === false ? initResult.message : ''}`);

        if(initResult.initialized) {
            await this.documentSymbols(githubUrl);

            if (this.repoType === RepoType.github) {
                // Find all code cells from vode view.
                const codeView = document.querySelector('table');
                const isCodeView = checkIsCodeView(codeView);
    
                if (isCodeView) {
                    logger.info('Fill code cells');
                    fillTextNodeForCodeCell(codeView);
    
                    this.codeView = codeView;
                    const debouncedHoverAction = debounce(this.hoverAction, 250);
                    this.codeView.addEventListener('mousemove', debouncedHoverAction);
                    this.disposes.push({
                        dispose: () => {
                            this.codeView.removeEventListener('mousemove', debouncedHoverAction);
                        },
                    });
                }
            }
        }
    }

    private addSymbolNavigateEventListener(parent: HTMLElement): Disposable {
        const eventHandler = (ev: Event): void => {
            if (!(ev.target instanceof HTMLElement)) {
                return;
            }
            if (ev.target !== parent && ev.target.dataset['symbolLink']) {
                const { domain, owner, project, line } = ev.target.dataset;
                window.location.href = this.prepareBlobJumpUrl(domain, owner, project, line, this.relativePath);
            } else if (ev.target && ev.target.dataset['lineSymbol'] && ev.target.dataset['expanded']) {
                const { lineSymbol, expanded } = ev.target.dataset;
                const [ symbolName, line ] = lineSymbol.split(':');
                const childrenContainer = document.querySelector(`#lsif-ts-ext-symbol-children-${symbolName.replace(removeQuotes, '')}-${line}`);

                if (JSON.parse(expanded)) {
                    // @ts-ignore
                    childrenContainer.style.display = 'none';
                    ev.target.setAttribute('data-expanded', 'false');
                    ev.target.classList.add('lsif-ts-ext-symbol-arrow-collapsed');
                    ev.target.classList.remove('lsif-ts-ext-symbol-arrow-expanded')
                } else {
                    // @ts-ignore
                    childrenContainer.style.display = 'block';
                    ev.target.setAttribute('data-expanded', 'true');
                    ev.target.classList.add('lsif-ts-ext-symbol-arrow-expanded');
                    ev.target.classList.remove('lsif-ts-ext-symbol-arrow-collapsed')
                }
            }
        }

        parent.addEventListener('click', eventHandler);
        return {
            dispose: () => {
                parent.removeEventListener('click', eventHandler);
            },
        };
    }

    private makeSymbolTree(symbolTree: DocumentSymbol[], deep: number): string {
        const { domain, owner, project } = this.blobDetail;
        return symbolTree.map((symbolItem) => `
            <li
                title="${symbolItem.name}"
                data-symbol-link=true data-domain="${domain}"
                data-owner="${owner}"
                data-project="${project}"
                data-line="${symbolItem.range.start.line + 1}"
                ${deep === 0 ? 'class="lsif-tsc-outer-li"' : ''}"
            >
                ${symbolItem.children ?
        `<span
            class="lsif-ts-ext-symbol-icon lsif-ts-ext-symbol-icon-arrow lsif-ts-ext-symbol-arrow-collapsed"
            data-line-symbol="${symbolItem.name}:${symbolItem.range.start.line + 1}"
            data-expanded="false"
        ></span>` :
        '<span class="lsif-ts-ext-symbol-icon"></span>'}
                <span class="lsif-ts-ext-symbol-icon lsif-ts-ext-symbol-icon-${symbolKindNames[symbolItem.kind]}"></span>
                <span class="lsif-ts-ext-symbol-link">${symbolItem.name}</span>
            </li>
            ${symbolItem.children ?
        `<ul
            style="padding-left: 24px; display: none"
            class="lsif-ts-ext-symbol-children"
            id="lsif-ts-ext-symbol-children-${symbolItem.name.replace(removeQuotes, '')}-${symbolItem.range.start.line + 1}">
            ${this.makeSymbolTree(symbolItem.children, deep + 1)}
        </ul>` :
        ''}
        `).join('');
    }

    private async documentSymbols(githubUrl: RepoUrlType): Promise<void> {
        if (githubUrl.pageType === 'blob') {
            const documentSymbolTree = await this.connection.sendRequest<DocumentSymbolArguments, lsp.DocumentSymbol[] | undefined>(
                'documentSymbol',
                {
                    textDocument: { uri: this.relativePath },
                    repository: this.repository,
                    commit: this.commit,
                },
            );
            const documentSymbolContainer = document.createElement('ul');
            documentSymbolContainer.innerHTML = this.makeSymbolTree(documentSymbolTree, 0);
            documentSymbolContainer.className = 'lsif-ts-ext-textdocument-symbols-container';
            document.body.appendChild(documentSymbolContainer);

            this.disposes.push(this.addSymbolNavigateEventListener(documentSymbolContainer));
            this.disposes.push({
                dispose: () => {
                    document.body.removeChild(documentSymbolContainer);
                },
            });
        }
    }

    private handleTargetNodeClick = async (position): Promise<void> =>  {
        const definitions = await this.connection.sendRequest<{}, lsp.Location[] | undefined>(
            'gotoDefinition',
            {
                textDocument: {
                    uri: this.relativePath,
                },
                position,
                repository: this.repository,
                commit: this.commit,
            }
        );
        if (definitions && definitions.length) {
            const definition = definitions[0];
            const { uri, range } = definition;

            if (!uri.startsWith('file://')) {
                const { domain, owner, project } = this.blobDetail;
                const href = this.prepareBlobJumpUrl(domain, owner, project, range.start.line + 1, uri);
                window.location.href = href;
            } else {
                logger.warn(`Can not jump to file ${uri}`);
            }
        }
    }

    private hoverAction = async (ev: MouseEvent): Promise<void> => {
        if (this.codeView && this.relativePath) {
            const targetNode = ev.target;
            const codeCells = memoizedFindCodeCellFromContainer(this.codeView);

            if (targetNode instanceof HTMLElement) {
                if (checkTargetIsCodeCellOrChildnodes(targetNode, codeCells)) {
                    const position = convertPositionFromCodeCell(targetNode);
                    if (position) {
                        const response = await this.connection.sendRequest<{}, lsp.Hover | undefined>(
                            'hover',
                            {
                                textDocument: {
                                    uri: this.relativePath,
                                },
                                position,
                                repository: this.repository,
                                commit: this.commit,
                            }
                        );

                        const targetNodePosition = targetNode.getBoundingClientRect();
                        const hoverActionElement = document.createElement('div');
                        hoverActionElement.className = 'lsif-ts-ext-hover-detail-container';
                        hoverActionElement.style.left = `${targetNode.offsetLeft}px`;
                        hoverActionElement.style.bottom = `${targetNodePosition.height + 2}px`;

                        if(Array.isArray(response.contents)) {
                            // @ts-ignore
                            const mdString = `${'```ts'}\n${response.contents[0].value}\n${'```'}`
                            hoverActionElement.innerHTML = `<div class="lsif-ts-ext-hover-title">${marked(mdString)}</div>`;

                            if (response.contents[1]) {
                                // @ts-ignore
                                hoverActionElement.innerHTML += `<div class="lsif-ts-ext-hover-detail">${marked(response.contents[1])}</div>`;
                            }
                        } else {
                            // @ts-ignore
                            hoverActionElement.innerHTML = marked(mdString);
                        }

                        targetNode.classList.add('lsif-ts-ext-underline-target');
                        targetNode.classList.add('lsif-ts-ext-highlight-target');
                        targetNode.appendChild(hoverActionElement);

                        const clickHandler = (): void => {
                            this.handleTargetNodeClick(position);
                            targetNode.removeEventListener('click', clickHandler);
                        };

                        targetNode.addEventListener('click', clickHandler);

                        const clearActionNode = (): void => {
                            targetNode.removeChild(hoverActionElement);
                            targetNode.classList.remove('lsif-ts-ext-highlight-target');
                            targetNode.classList.remove('lsif-ts-ext-underline-target');
                            targetNode.removeEventListener('mouseleave', clearActionNode);
                            targetNode.removeEventListener('click', clickHandler);
                        };
                        targetNode.addEventListener('mouseleave', clearActionNode);

                        const dispose = (): void => {
                            targetNode.removeEventListener('mouseleave', clearActionNode);
                            targetNode.classList.remove('lsif-ts-ext-highlight-target');
                        };
                        this.disposes.push({ dispose });
                    }
                }
            }
        }
    }
}
