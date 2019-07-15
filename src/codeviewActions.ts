import { debounce } from 'lodash';

import { findCodeCellFromContainer, checkTargetIsCodeCellOrChildnodes, convertPositionFromCodeCell, parseURL, checkIsCodeView } from './utils';
import { logger, field } from './logger';
import { Connection } from './connection';
import { InitializeArguments, InitializeResponse, InitializeFaliedResponse, DocumentSymbolArguments } from './protocol';
import { lsp } from 'lsif-protocol';
import { Disposable } from './types';

type GithubUrlType = ReturnType<typeof parseURL>;

export class CodeViewActions {

    private disposes: Disposable[] = [];

    private codeView: HTMLTableElement;

    private relativePath: string | undefined;

    private commit: string | undefined;

    constructor(private connection: Connection) {}

    public initialize(githubUrl: GithubUrlType): void {
        const [ domain, owner, project ] = githubUrl.rawRepoName.split('/');
        const gitCloneUrl = `git@${domain}:${owner}/${project}`;

        logger.info('Prepare initialize LSIF server.', field('url', gitCloneUrl));

        if (githubUrl.pageType === 'blob') {
            this.relativePath = githubUrl.revAndFilePath.split('/').slice(1).join('/')
            this.commit = githubUrl.revAndFilePath.split('/').shift();
        }

        const initArguments = {
            projectName: githubUrl.rawRepoName,
            url: gitCloneUrl,
            commit: this.commit && this.commit,
        }

        this.connection.sendRequest<InitializeArguments, InitializeResponse | InitializeFaliedResponse>('initialize', initArguments)
            .then((result) => {
                logger.info(`Initialize: ${result.initialized ? 'success' : 'failed'} ${result.initialized === false && result.message}`);

                if(result.initialized) {
                    this.documentSymbols(githubUrl);

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
            });
    }

    private documentSymbols(githubUrl: GithubUrlType): void {
        if (githubUrl.pageType === 'blob') {
            const documentSymbolArgument = {
                textDocument: {
                    uri: this.relativePath
                },
            };
    
            this.connection.sendRequest<DocumentSymbolArguments, lsp.DocumentSymbol[] | undefined>('documentSymbol', documentSymbolArgument)
                .then((response) => {
                    const textDocumentSymbolContainer = document.createElement('ul');
                    textDocumentSymbolContainer.innerHTML = response.map((symbolItem) => `
                        <li>
                            <a href="${window.location.href}#L${symbolItem.range.start.line + 1}">${symbolItem.name}</a>
                        </li>
                    `).join('');
                    textDocumentSymbolContainer.className = 'lsif-typescript-extensions-textdocument-symbols-container';
                    document.body.appendChild(textDocumentSymbolContainer);
                });
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
                        console.log(targetNodePosition);
                        const hoverActionElement = document.createElement('div');
                        hoverActionElement.className = 'lsif-typescript-extensions-hover-detail-container';
                        hoverActionElement.style.left = `${targetNodePosition.left}px`;
                        hoverActionElement.style.top = `${targetNodePosition.top - 28}px`;

                        if(Array.isArray(response.contents)) {
                            // @ts-ignore
                            hoverActionElement.innerText = response.contents[0].value;
                        } else {
                            // @ts-ignore
                            hoverActionElement.innerText = response.contents.value;
                        }
                        document.body.appendChild(hoverActionElement);
                    }
                }
            }
        }
    }
}

