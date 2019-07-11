import { checkIsGitHubDotCom, parseURL } from './utils';

if(checkIsGitHubDotCom()) {
    console.log('[LSIF-TS] Extension is running.');

    const githubUrl = parseURL(window.location);
    console.log(githubUrl);
}
