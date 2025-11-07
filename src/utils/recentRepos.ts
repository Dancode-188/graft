// Recent Repositories Tracker
// Stores and retrieves recently opened repositories from localStorage

const STORAGE_KEY = 'graft_recent_repos';
const MAX_RECENT = 10;

export interface RecentRepo {
  path: string;
  name: string;
  lastOpened: number;
}

export function saveRecentRepo(repo: RecentRepo): void {
  try {
    const recent = getRecentRepos();
    // Add repo to front, remove duplicates, limit to MAX_RECENT
    const updated = [
      repo,
      ...recent.filter(r => r.path !== repo.path)
    ].slice(0, MAX_RECENT);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save recent repo:', error);
  }
}

export function getRecentRepos(): RecentRepo[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load recent repos:', error);
    return [];
  }
}

export function clearRecentRepos(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear recent repos:', error);
  }
}
