import { queryOptions } from '@tanstack/react-query';

export function getGitHubRepository(repo: string) {
  const match = repo.match(/^https:\/\/github\.com\/([^/?#]+)\/([^/?#]+)/i);

  if (!match) {
    return null;
  }

  const name = `${match[1]}/${match[2].replace(/\.git$/, '')}`;

  return {
    name,
    url: `https://github.com/${name}`,
    apiUrl: `https://api.github.com/repos/${name}`,
  };
}

export async function fetchGitHub(
  url: string,
  signal: AbortSignal,
  accept = 'application/vnd.github+json',
  cache?: RequestCache,
) {
  const response = await fetch(url, {
    cache,
    headers: { Accept: accept },
    signal,
  });

  if (!response.ok) {
    throw new Error(`GitHub 请求失败 (${response.status})`);
  }

  return response;
}

export type GitHubRepositoryStats = {
  stargazers_count: number;
  forks_count: number;
};

export function githubRepositoryQueryOptions(
  repo: string,
  initialData?: GitHubRepositoryStats,
) {
  const repository = getGitHubRepository(repo);

  return queryOptions({
    queryKey: ['github-repository', repository?.name],
    enabled: Boolean(repository),
    // 构建时数据先行展示，挂载后仍在后台刷新；请求失败（如限流）时保留该数据
    initialData,
    initialDataUpdatedAt: 0,
    staleTime: 10 * 60 * 1000,
    retry: false,
    queryFn: async ({ signal }) => {
      const response = await fetchGitHub(repository!.apiUrl, signal);
      const result: GitHubRepositoryStats = await response.json();

      return result;
    },
  });
}

/** 按 Star 数降序；无数据的项排在后面，同分保持原顺序 */
export function sortByGitHubStars<T>(
  items: T[],
  getStars: (item: T, index: number) => number | undefined,
) {
  return items
    .map((item, index) => ({ item, index, stars: getStars(item, index) ?? -1 }))
    .sort((a, b) => b.stars - a.stars || a.index - b.index)
    .map(({ item }) => item);
}
