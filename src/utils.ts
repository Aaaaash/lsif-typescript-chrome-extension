import { memoize } from 'lodash';

import { githubCodeViewSelector, githubCodeCellSelector } from './constants';
import { Position, RepoType } from './types';

export const checkIsGitHubDotCom = (): boolean => /^https?:\/\/(www.)?github.com/.test(window.location.href);

export const checkIsCodingDotNet = (): boolean => /^https?:\/\/(\w+.)?coding.net/.test(window.location.href);

export const checkAndEnsureRepoType = (): RepoType | undefined => {
    if (checkIsGitHubDotCom()) {
        return RepoType.github;
    } else if (checkIsCodingDotNet()) {
        return RepoType.coding;
    }
    return undefined;
}

export interface RawRepoSpec {
    /**
     * The name of this repository, unaffected by `repositoryPathPattern`.
     *
     * Example: `github.com/sourcegraph/sourcegraph`
     */
    rawRepoName: string;
}

type GitRepoURL =
    | ({ pageType: 'tree' | 'commit' | 'pull' | 'compare' | 'other' } & RawRepoSpec)
    | ({ pageType: 'blob'; revAndFilePath: string } & RawRepoSpec)

export function parseRepoURL(repoType: RepoType, loc: Pick<Location, 'host' | 'pathname'> = window.location): GitRepoURL | undefined {
    const { host, pathname } = loc;
    const [user, ghRepoName, pageType, ...rest] = pathname.slice(repoType === RepoType.github ? 1 : 3).split('/');
    if (!user || !ghRepoName) {
        return undefined;
    }
    const rawRepoName = `${host}/${user}/${ghRepoName}`;
    switch (pageType) {
        case 'blob':
            return {
                pageType,
                rawRepoName,
                revAndFilePath: rest.join('/'),
            };
        case 'tree':
        case 'pull':
        case 'commit':
        case 'compare':
            return {
                pageType,
                rawRepoName,
            };
        default:
            return { pageType: 'other', rawRepoName };
    }
}

export const checkIsCodeView = (tableElement: HTMLTableElement): boolean => {
    const classNames = tableElement.getAttribute('class').split(' ');
    return classNames.length > 0 ? classNames.includes(githubCodeViewSelector) : false;
};

const _findCodeCellFromContainer = (tableElement: HTMLTableElement): Element[] => {
    return Array.from(tableElement.querySelectorAll('td.blob-code'))
        .filter((codeCell) => codeCell.childNodes.length > 1);
}

export const memoizedFindCodeCellFromContainer = memoize(_findCodeCellFromContainer);

export const fillTextNodeForCodeCell = (tableElement: HTMLTableElement): void => {
    const codeCells = memoizedFindCodeCellFromContainer(tableElement);

    for (const codeCell of codeCells) {
        codeCell.childNodes.forEach((childNode) => {
            // TextNode
            if (childNode.nodeType === 3) {
                const textSpan = document.createElement('span');
                textSpan.innerHTML = childNode.nodeValue;
                codeCell.replaceChild(textSpan, childNode);
            }
        });
    }
}

export const checkTargetIsCodeCellOrChildnodes = (target: HTMLElement, codeCells: Element[]): boolean => {
    if (
        (target.parentElement &&
        (codeCells.includes(target.parentElement) ||
        target.parentElement.classList.contains(githubCodeCellSelector))) ||
        (target.parentElement.parentElement &&
        codeCells.includes(target.parentElement.parentElement) ||
        target.parentElement.parentElement.classList.contains(githubCodeCellSelector))
    ) {
        return true;
    }

    return false;
}

export const convertPositionFromCodeCell = (target: HTMLElement): Position | null => {
    const parentElement = target.parentElement;
    if (parentElement) {
        const parentId = parentElement.getAttribute('id');
        if (parentId && parentId.startsWith('LC')) {
            const line = Number(parentId.split('LC').pop());

            const childNodes = Array.from(parentElement.childNodes);
            let character = 0;
            for (const node of childNodes) {
                if (node === target) {
                    break;
                }
                if (node.nodeType === 1) {
                    const rghTabsChildNodes = Array.from(node.childNodes);
                    rghTabsChildNodes.forEach((childNode) => {
                        if (childNode.nodeValue) {
                            character += childNode.nodeValue.length;
                        }
                    });
                } else if (node.nodeType === 3) {
                    character += node.nodeValue.length;
                } else {
                    continue;
                }
            }
            return { line: line - 1, character };
        }
        return null;
    }
    return null;
}

export function injectContentScript(scriptUrl: string, target: HTMLBodyElement): void {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.type = 'text/javascript';
    target.appendChild(script);
}

export function nativeHistoryWrapper(eventType: string): () => ReturnType<typeof history['pushState']> {
    const origin = window.top.history[eventType];
    return function () {
        const rev = origin.apply(this, arguments);
        const event = new Event(eventType);
        // @ts-ignore
        event.args = arguments;
        window.dispatchEvent(event);
        return rev;
    }
}

interface GitDomainOwnerAndProject {
    domain: string;
    owner: string;
    project: string;
}

export function getGitHubDomainOwnerAndProject(rawRepoName: string): GitDomainOwnerAndProject {
    const [ domain, owner, project ] = rawRepoName.split('/');
    return {
        domain,
        owner,
        project,
    };
}

export function getGitHubCloneUrl(rawRepoName: string): string {
    const { domain, owner, project } = getGitHubDomainOwnerAndProject(rawRepoName);
    const cloneUrl = `git@${domain}:${owner}/${project}`;
    return cloneUrl;
}

interface CodingOwnerAndProject {
    domain: string;
    owner: string;
    project: string;
}

export function getCodingDomainOwnerAndProject(rawRepoName: string): GitDomainOwnerAndProject {
    const [ domain, project ] = rawRepoName.split('/');
    const [ owner ] = domain.split('.');
    return {
        domain,
        owner,
        project,
    };
}

export function getCodingCloneUrl(rawRepoName: string): string {
    const { owner, project } = getCodingDomainOwnerAndProject(rawRepoName);
    const cloneUrl = `git@e.coding.net:${owner}/${project}`;
    return cloneUrl;
}
