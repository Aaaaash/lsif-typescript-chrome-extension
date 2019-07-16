import { debounce } from 'lodash';

import { findCodeCellFromContainer, checkTargetIsCodeCellOrChildnodes, convertPositionFromCodeCell, parseURL, checkIsCodeView } from './utils';
import { logger, field } from './logger';
import { Connection } from './connection';
import { InitializeArguments, InitializeResponse, InitializeFaliedResponse, DocumentSymbolArguments } from './protocol';
import { lsp } from 'lsif-protocol';
import { Disposable } from './types';

type GitHubUrlType = ReturnType<typeof parseURL>;

export class CodeViewActions {

    private disposes: Disposable[] = [];

    private codeView: HTMLTableElement;

    private relativePath: string | undefined;

    private commit: string | undefined;

    constructor(private connection: Connection) {}

    public start(githubUrl: GitHubUrlType): void {
        const [ domain, owner, project ] = githubUrl.rawRepoName.split('/');
        const cloneUrl = `git@${domain}:${owner}/${project}`;

        logger.info('Prepare initialize LSIF server.', field('url', cloneUrl));

        if (githubUrl.pageType === 'blob') {
            this.relativePath = githubUrl.revAndFilePath.split('/').slice(1).join('/')
            this.commit = githubUrl.revAndFilePath.split('/').shift();
        }

        this.initialize(githubUrl, cloneUrl);
    }

    public dispose(): void {
        for(const disposable of this.disposes) {
            disposable.dispose();
        }
    }

    private async initialize(githubUrl: GitHubUrlType, cloneUrl: string): Promise<void> {
        const initArguments = {
            projectName: githubUrl.rawRepoName,
            url: cloneUrl,
            commit: this.commit && this.commit,
        }

        const initResult = await this.connection.sendRequest<InitializeArguments, InitializeResponse | InitializeFaliedResponse>('initialize', initArguments);
        logger.info(`Initialize: ${initResult.initialized ? 'success' : 'failed'} ${initResult.initialized === false && initResult.message}`);

        if(initResult.initialized) {
            await this.documentSymbols(githubUrl);

            // Find all code cells from vode view.
            const codeView = document.querySelector('table');
            const isCodeView = checkIsCodeView(codeView);

            if (isCodeView) {
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

    private async documentSymbols(githubUrl: GitHubUrlType): Promise<void> {
        if (githubUrl.pageType === 'blob') {
            const documentSymbolArgument = {
                textDocument: {
                    uri: this.relativePath
                },
            };
    
            const documentSymbol = await this.connection.sendRequest<DocumentSymbolArguments, lsp.DocumentSymbol[] | undefined>('documentSymbol', documentSymbolArgument)
            const textDocumentSymbolContainer = document.createElement('ul');
            textDocumentSymbolContainer.innerHTML = documentSymbol.map((symbolItem) => `
                <li>
                    <a href="${window.location.href}#L${symbolItem.range.start.line + 1}">${symbolItem.name}</a>
                </li>
            `).join('');
            textDocumentSymbolContainer.className = 'lsif-typescript-extensions-textdocument-symbols-container';
            document.body.appendChild(textDocumentSymbolContainer);

            this.disposes.push({
                dispose: () => {
                    document.body.removeChild(textDocumentSymbolContainer);
                },
            })
        }
    }

    private hoverAction = async (ev: MouseEvent): Promise<void> => {
        if (this.codeView && this.relativePath) {
            const targetNode = ev.target;
            const codeCells = findCodeCellFromContainer(this.codeView);

            if (targetNode instanceof HTMLElement) {
                if (checkTargetIsCodeCellOrChildnodes(targetNode, codeCells)) {
                    const position = convertPositionFromCodeCell(targetNode);
                    if (position) {
                        const hoverArgs = {
                            textDocument: {
                                uri: this.relativePath,
                            },
                            position,
                        };
                        const response = await this.connection.sendRequest<{}, lsp.Hover | undefined>('hover', hoverArgs);

                        const targetNodePosition = targetNode.getBoundingClientRect();
                        const hoverActionElement = document.createElement('div');
                        hoverActionElement.className = 'lsif-typescript-extensions-hover-detail-container';
                        hoverActionElement.style.left = `${targetNode.offsetLeft}px`;
                        hoverActionElement.style.bottom = `${targetNodePosition.height}px`;

                        if(Array.isArray(response.contents)) {
                            // @ts-ignore
                            hoverActionElement.innerHTML = `<span class="lsif-typescript-extensions-hover-detail-description">${response.contents[0].value}</span>`;

                            if (response.contents[1]) {
                                hoverActionElement.innerHTML += `
                                    <span>${response.contents[1]}</span>
                                `
                            }
                        } else {
                            // @ts-ignore
                            hoverActionElement.innerText = response.contents.value;
                        }

                        targetNode.appendChild(hoverActionElement);
                        // document.body.appendChild(hoverActionElement);

                        this.disposes.push({
                            dispose: () => {
                                document.body.removeChild(hoverActionElement);
                            },
                        });
                    }
                }
            }
        }
    }
}

