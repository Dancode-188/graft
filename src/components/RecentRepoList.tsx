import { useEffect, useState } from 'react';
import { getRecentRepos, clearRecentRepos, RecentRepo } from '../utils/recentRepos';


export interface RecentReposListProps {
  repos?: RecentRepo[];
  onOpenRepo: (path: string) => void;
  onRemoveRepo?: (path: string) => void;
}

export function RecentReposList({ repos, onOpenRepo, onRemoveRepo }: RecentReposListProps) {
  const [recent, setRecent] = useState<RecentRepo[]>(repos ?? []);

  useEffect(() => {
    if (!repos) setRecent(getRecentRepos());
  }, [repos]);

  const handleClear = () => {
    clearRecentRepos();
    setRecent([]);
  };

  const handleRemove = (path: string) => {
    if (onRemoveRepo) onRemoveRepo(path);
    setRecent(r => r.filter(repo => repo.path !== path));
  };

  if (recent.length === 0) {
    return <div className="p-4 text-theme-tertiary text-sm">No recent repositories.</div>;
  }

  return (
    <div className="p-2">
      <div className="mb-2 flex justify-between items-center">
        <span className="font-semibold text-theme-secondary text-xs">Recent Repositories</span>
        <button className="text-xs text-theme-tertiary hover:underline" onClick={handleClear}>
          Clear Recent
        </button>
      </div>
      <ul className="divide-y divide-theme-default">
        {recent.map(repo => (
          <li key={repo.path} className="py-2 flex items-center justify-between">
            <button
              className="text-left flex-1 truncate hover:underline text-theme-primary"
              title={repo.path}
              onClick={() => onOpenRepo(repo.path)}
            >
              <span className="font-mono text-xs mr-2">{repo.name}</span>
              <span className="text-theme-tertiary text-xs">{repo.path}</span>
            </button>
            <span className="ml-2 text-xs text-theme-tertiary">
              {new Date(repo.lastOpened).toLocaleDateString()}
            </span>
            {onRemoveRepo && (
              <button aria-label={`remove ${repo.name}`} className="ml-2 text-xs text-red-400" onClick={() => handleRemove(repo.path)}>
                ×
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
