// Quick Search Engine - Unified search across all data types
import { SearchResult } from './types';
import type { SearchResultType } from './types';

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

/**
 * Search commits
 */
export function searchCommits(query: string, commits: any[]): SearchResult[] {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  
  for (const commit of commits) {
    const messageScore = fuzzyScore(query, commit.message);
    const authorScore = fuzzyScore(query, commit.author_name);
    const hashScore = fuzzyScore(query, commit.short_hash);
    
    const bestScore = Math.max(messageScore, authorScore, hashScore);
    
    if (bestScore > 0) {
      results.push({
        type: 'commit',
        id: commit.hash,
        title: commit.message.split('\n')[0], // First line only
        subtitle: `${commit.author_name} • ${commit.short_hash}`,
        icon: '📝',
        score: bestScore,
        data: commit,
      });
    }
  }
  
  return results.sort((a, b) => b.score - a.score);
}

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
export function searchAll(
  query: string,
  data: {
    commits: any[];
    branches: any[];
    stashes: any[];
  }
): SearchResult[] {
  if (!query.trim()) return [];
  
  const commitResults = searchCommits(query, data.commits);
  const branchResults = searchBranches(query, data.branches);
  const stashResults = searchStashes(query, data.stashes);
  
  // Combine and sort by score
  const allResults = [...commitResults, ...branchResults, ...stashResults];
  return allResults.sort((a, b) => b.score - a.score);
}
