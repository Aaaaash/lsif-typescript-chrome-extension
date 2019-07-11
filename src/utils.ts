export const checkIsGitHubDotCom = (): boolean => /^https?:\/\/(www.)?github.com/.test(window.location.href)

export interface RawRepoSpec {
    /**
     * The name of this repository, unaffected by `repositoryPathPattern`.
     *
     * Example: `github.com/sourcegraph/sourcegraph`
     */
    rawRepoName: string
}

type GitHubURL =
    | ({ pageType: 'tree' | 'commit' | 'pull' | 'compare' | 'other' } & RawRepoSpec)
    | ({ pageType: 'blob'; revAndFilePath: string } & RawRepoSpec)

export function parseURL(loc: Pick<Location, 'host' | 'pathname'> = window.location): GitHubURL {
    const { host, pathname } = loc
    const [user, ghRepoName, pageType, ...rest] = pathname.slice(1).split('/')
    if (!user || !ghRepoName) {
        throw new Error(`Could not parse repoName from GitHub url: ${window.location}`)
    }
    const rawRepoName = `${host}/${user}/${ghRepoName}`
    switch (pageType) {
        case 'blob':
            return {
                pageType,
                rawRepoName,
                revAndFilePath: rest.join('/'),
            }
        case 'tree':
        case 'pull':
        case 'commit':
        case 'compare':
            return {
                pageType,
                rawRepoName,
            }
        default:
            return { pageType: 'other', rawRepoName }
    }
}
