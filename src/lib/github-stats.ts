import { type GitHubRepositoryStats, getGitHubRepository } from './github';

/**
 * 构建时拉取仓库 Star/Fork 数，写入静态页面。
 * 配置 GITHUB_TOKEN 可提高 API 限额；请求失败时返回 undefined，不阻断构建。
 */
async function getGitHubRepositoryStats(repo?: string) {
  const repository = repo ? getGitHubRepository(repo) : null;

  if (!repository) {
    return undefined;
  }

  try {
    const token = process.env.GITHUB_TOKEN;
    const response = await fetch(repository.apiUrl, {
      headers: {
        Accept: 'application/vnd.github+json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return undefined;
    }

    const { stargazers_count, forks_count }: GitHubRepositoryStats =
      await response.json();

    return { stargazers_count, forks_count };
  } catch {
    return undefined;
  }
}

export async function getGitHubStatsBySlug(
  projects: { slug: string; repo?: string }[],
) {
  const entries = await Promise.all(
    projects.map(
      async (project) =>
        [project.slug, await getGitHubRepositoryStats(project.repo)] as const,
    ),
  );
  const stats: Record<string, GitHubRepositoryStats> = {};

  for (const [slug, value] of entries) {
    if (value) {
      stats[slug] = value;
    }
  }

  return stats;
}
