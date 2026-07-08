"use server";

export interface GitHubStats {
  commits: number;
  repos: number;
  followers: number;
  stars: number;
  username: string;
}

export async function fetchGitHubStats(username: string, providerToken?: string): Promise<GitHubStats> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (providerToken) {
    headers['Authorization'] = `token ${providerToken}`;
  }

  try {
    // 1. Fetch basic user info from API
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userRes.ok) throw new Error('Failed to fetch user');
    const userData = await userRes.json();

    // 2. Fetch exact profile contributions by scraping the GitHub contributions graph
    let exactCommits = 0;
    try {
      const contribRes = await fetch(`https://github.com/users/${username}/contributions`);
      if (contribRes.ok) {
        const html = await contribRes.text();
        const match = html.match(/(\d+(?:,\d+)*)\s+contributions/);
        if (match && match[1]) {
          exactCommits = parseInt(match[1].replace(/,/g, ''), 10);
        }
      }
    } catch (e) {
      console.warn("Could not fetch exact contributions from profile", e);
    }

    if (exactCommits === 0) {
      try {
        const searchRes = await fetch(`https://api.github.com/search/commits?q=author:${username}`, { 
          headers: { ...headers, 'Accept': 'application/vnd.github.cloak-preview+json' } 
        });
        if (searchRes.ok) {
          const searchData = await searchRes.json();
          exactCommits = searchData.total_count || 0;
        }
      } catch (e) {
        // Ignore
      }
    }

    // 3. Fetch Stars (sum of stargazers_count across up to 100 repos)
    let totalStars = 0;
    try {
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?per_page=100`, { headers });
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        totalStars = reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0);
      }
    } catch (e) {
      console.warn("Could not fetch repos for stars", e);
    }

    return {
      commits: exactCommits,
      repos: userData.public_repos || 0,
      followers: userData.followers || 0,
      stars: totalStars,
      username: userData.login
    };

  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    return { commits: 0, repos: 0, followers: 0, stars: 0, username };
  }
}
