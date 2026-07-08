"use server";

export interface GitHubRepo {
  name: string;
  size: number;
  commits: number;
  language: string;
  created_at: string;
  updated_at: string;
}

async function fetchCommitCount(username: string, repoName: string, headers: any): Promise<number> {
  try {
    const res = await fetch(`https://api.github.com/repos/${username}/${repoName}/commits?per_page=1`, { headers });
    if (!res.ok) return 0;
    const link = res.headers.get('link');
    if (link) {
      const match = link.match(/page=(\d+)>; rel="last"/);
      if (match && match[1]) {
        return parseInt(match[1], 10);
      }
    }
    const data = await res.json();
    return Array.isArray(data) ? data.length : 0;
  } catch(e) {
    return 0;
  }
}

export interface GitHubActivity {
  type: string;
  repo: string;
  created_at: string;
}

export interface GitHubStats {
  commits: number;
  repos: number;
  followers: number;
  stars: number;
  username: string;
  topRepos: GitHubRepo[];
  activity: GitHubActivity[];
  heatmap: number[];
}

export async function fetchGitHubStats(username: string, providerToken?: string): Promise<GitHubStats> {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
  };

  if (providerToken) {
    headers['Authorization'] = `token ${providerToken}`;
  }

  const defaultStats: GitHubStats = {
    commits: 0, repos: 0, followers: 0, stars: 0, username,
    topRepos: [], activity: [], heatmap: []
  };

  try {
    // 1. Fetch User Info
    const userRes = await fetch(`https://api.github.com/users/${username}`, { headers });
    if (!userRes.ok) throw new Error('Failed to fetch user');
    const userData = await userRes.json();

    // 2. Fetch Contributions (Scraping the graph)
    let exactCommits = 0;
    let heatmapLevels: number[] = [];
    try {
      const contribRes = await fetch(`https://github.com/users/${username}/contributions`);
      if (contribRes.ok) {
        const html = await contribRes.text();
        
        // Extract total commits
        const match = html.match(/(\d+(?:,\d+)*)\s+contributions/);
        if (match && match[1]) {
          exactCommits = parseInt(match[1].replace(/,/g, ''), 10);
        }

        // Extract heatmap levels and dates
        const levelMatches = html.matchAll(/data-date="([^"]+)" data-level="([0-4])/g);
        
        let days: { date: string, level: number }[] = [];
        for (const m of levelMatches) {
          days.push({ date: m[1], level: parseInt(m[2], 10) });
        }
        
        // GitHub's HTML groups by day-of-week (all Sundays, then all Mondays). 
        // We must sort by date to get chronological order for our grid-flow-col layout.
        days.sort((a, b) => a.date.localeCompare(b.date));
        
        heatmapLevels = days.map(d => d.level);

        // Align the 1D array to the 7-row CSS grid perfectly
        // The last element is today. We calculate the Day of the Week (0-6) of the first element.
        const N = heatmapLevels.length;
        if (N > 0) {
          const firstDate = new Date(days[0].date);
          const firstDayOfWeek = firstDate.getDay(); // 0 (Sun) to 6 (Sat)
          
          const pad = Array(firstDayOfWeek).fill(0);
          heatmapLevels = [...pad, ...heatmapLevels];
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
      } catch (e) {}
    }

    // 3. Fetch Top Repositories & Stars
    let topRepos: GitHubRepo[] = [];
    let totalStars = 0;
    try {
      const reposRes = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=12`, { headers });
      if (reposRes.ok) {
        const reposData = await reposRes.json();
        totalStars = reposData.reduce((acc: number, repo: any) => acc + repo.stargazers_count, 0);
        
        const mappedRepos = reposData.map((repo: any) => ({
          name: repo.name,
          size: repo.size,
          commits: 0,
          language: repo.language || 'Unknown',
          created_at: repo.created_at,
          updated_at: repo.updated_at
        }));

        // Fetch exact commit counts for top repos in parallel
        await Promise.all(mappedRepos.map(async (repo: any) => {
          repo.commits = await fetchCommitCount(username, repo.name, headers);
        }));

        topRepos = mappedRepos;
      }
    } catch (e) {
      console.warn("Could not fetch repos", e);
    }

    // 4. Fetch Recent Activity Events
    let activity: GitHubActivity[] = [];
    try {
      const eventsRes = await fetch(`https://api.github.com/users/${username}/events?per_page=10`, { headers });
      if (eventsRes.ok) {
        const eventsData = await eventsRes.json();
        activity = eventsData.map((ev: any) => ({
          type: ev.type,
          repo: ev.repo?.name?.split('/')[1] || ev.repo?.name || "Unknown",
          created_at: ev.created_at
        }));
      }
    } catch (e) {
      console.warn("Could not fetch events", e);
    }

    return {
      commits: exactCommits,
      repos: userData.public_repos || 0,
      followers: userData.followers || 0,
      stars: totalStars,
      username: userData.login,
      topRepos,
      activity,
      heatmap: heatmapLevels
    };

  } catch (error) {
    console.error("Error fetching GitHub stats:", error);
    return defaultStats;
  }
}
