import { searchGithubRepos, fetchAllPublicRepos } from '../../utils/githubSearch';
import { fetchUserRepos } from '../../utils/githubSearch';
/**
 * Search GitHub repositories online
 */
export async function searchGithubOnline(query: string): Promise<SearchResult[]> {
  try {
    let repos;
    const trimmed = query.trim();
    if (!trimmed) {
      // No query: show all public repos
      repos = await fetchAllPublicRepos();
    } else if (/^[a-zA-Z0-9-]{1,39}$/.test(trimmed)) {
      // Looks like a GitHub username: fetch user repos
      repos = await fetchUserRepos(trimmed);
    } else {
      repos = await searchGithubRepos(trimmed);
    }
    return repos.map((repo: any) => ({
      type: 'github',
      id: repo.id,
      title: repo.full_name || repo.name,
      subtitle: repo.description || '',
      icon: '🌐',
      score: 1000,
      data: repo,
    }));
  } catch (err) {
    return [];
  }
}
// Quick Search Engine - Unified search across all data types
import { SearchResult } from './types';
// Web Worker for commit search
let commitWorker: Worker | null = null;
function getCommitWorker(): Worker {
  if (!commitWorker) {
    commitWorker = new Worker(new URL('./commitSearch.worker.ts', import.meta.url));
  }
  return commitWorker;
}

/**
 * Search commits using a Web Worker and fuse.js
 */
export function searchCommitsAsync(query: string, commits: any[]): Promise<SearchResult[]> {
  return new Promise((resolve) => {
    if (!query.trim()) return resolve([]);
    const worker = getCommitWorker();
    const handleMessage = (e: MessageEvent) => {
      const filtered = e.data as any[];
      const results: SearchResult[] = filtered.map(commit => ({
        type: 'commit',
        id: commit.hash,
        title: commit.message.split('\n')[0],
        subtitle: `${commit.author_name} • ${commit.short_hash}`,
        icon: '📝',
        score: 1000, // fuse.js sorts by best match
        data: commit,
      }));
      resolve(results);
      worker.removeEventListener('message', handleMessage);
    };
    worker.addEventListener('message', handleMessage);
    worker.postMessage({ commits, query });
  });
}

/**
 * Simple fuzzy match score calculator
 * Returns score (higher = better match) or 0 for no match
 */
function fuzzyScore(query: string, text: string): number {
  if (!query || !text) return 0;
  
  const queryLower = query.toLowerCase();
  const textLower = text.toLowerCase();
  
  // Exact match - highest score
  if (textLower === queryLower) return 1000;
  
  // Starts with query - high score
  if (textLower.startsWith(queryLower)) return 800;
  
  // Contains query - good score
  const index = textLower.indexOf(queryLower);
  if (index !== -1) return 500 - index;
  
  // Fuzzy match - characters in order
  let queryIndex = 0;
  let score = 0;
  let lastIndex = -1;
  
  for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
    if (textLower[i] === queryLower[queryIndex]) {
      score += (i === lastIndex + 1) ? 5 : 1; // Bonus for consecutive
      lastIndex = i;
      queryIndex++;
    }
  }
  
  return queryIndex === queryLower.length ? score : 0;
}

// (searchCommits replaced by searchCommitsAsync)

/**
 * Search branches
 */
export function searchBranches(query: string, branches: any[]): SearchResult[] {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  
  for (const branch of branches) {
    const score = fuzzyScore(query, branch.name);
    
    if (score > 0) {
      const isRemote = branch.is_remote || false;
      const isCurrent = branch.is_current || false;
      
      results.push({
        type: 'branch',
        id: branch.name,
        title: branch.name,
        subtitle: isRemote ? 'Remote branch' : 'Local branch',
        description: isCurrent ? '(current)' : undefined,
        icon: isRemote ? '🌐' : '🌿',
        score,
        data: branch,
      });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Search stashes
 */
export function searchStashes(query: string, stashes: any[]): SearchResult[] {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  
  for (const stash of stashes) {
    const messageScore = fuzzyScore(query, stash.message || '');
    const indexScore = fuzzyScore(query, `stash@{${stash.index}}`);
    
    const bestScore = Math.max(messageScore, indexScore);
    
    if (bestScore > 0) {
      results.push({
        type: 'stash',
        id: `stash@{${stash.index}}`,
        title: stash.message || `Stash #{stash.index}`,
        subtitle: `stash@{${stash.index}}`,
        icon: '💾',
        score: bestScore,
        data: stash,
      });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}

/**
 * Unified search across all data types
 */
export async function searchAll(
  query: string,
  data: {
    commits: any[];
    branches: any[];
    stashes: any[];
  }
): Promise<SearchResult[]> {
  if (!query.trim()) return [];

  const [commitResults, branchResults, stashResults] = await Promise.all([
    searchCommitsAsync(query, data.commits),
    Promise.resolve(searchBranches(query, data.branches)),
    Promise.resolve(searchStashes(query, data.stashes)),
  ]);

  // Combine and sort by score
  const allResults = [...commitResults, ...branchResults, ...stashResults];
  return allResults.sort((a, b) => b.score - a.score);
}
