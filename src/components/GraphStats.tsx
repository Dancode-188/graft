import React, { useMemo } from 'react';
import { Commit } from '../App';

interface GraphStatsProps {
  commits: Commit[];
  repoName?: string;
}

export const GraphStats: React.FC<GraphStatsProps> = ({ commits, repoName }) => {
  const stats = useMemo(() => {
    if (commits.length === 0) {
      return {
        totalCommits: 0,
        localBranches: 0,
        remoteBranches: 0,
        mergeCommits: 0,
        uniqueAuthors: 0,
        dateRange: '',
        commitsPerDay: '0',
      };
    }

    // Total commits
    const totalCommits = commits.length;

    // Count branches
    const branchSet = new Set<string>();
    const remoteSet = new Set<string>();
    const localSet = new Set<string>();

    commits.forEach(commit => {
      commit.branches.forEach((branch: { name: string; is_remote: boolean }) => {
        branchSet.add(branch.name);
        if (branch.is_remote) {
          remoteSet.add(branch.name);
        } else {
          localSet.add(branch.name);
        }
      });
    });

    // Count merge commits
    const mergeCommits = commits.filter(c => c.parent_hashes.length > 1).length;

    // Count unique authors
    const authors = new Set(commits.map(c => c.author_email).filter(Boolean));

    // Calculate date range
    const now = new Date();
    const oldest = new Date(commits[commits.length - 1].timestamp * 1000);
    const daysDiff = Math.floor((now.getTime() - oldest.getTime()) / (1000 * 60 * 60 * 24));

    const dateRange =
      daysDiff === 0
        ? 'Today'
        : daysDiff === 1
          ? '1 day'
          : daysDiff < 7
            ? `${daysDiff} days`
            : daysDiff < 30
              ? `${Math.floor(daysDiff / 7)} weeks`
              : daysDiff < 365
                ? `${Math.floor(daysDiff / 30)} months`
                : `${Math.floor(daysDiff / 365)} years`;

    // Commits per day
    const commitsPerDay = daysDiff > 0 ? (totalCommits / daysDiff).toFixed(1) : totalCommits.toString();

    return {
      totalCommits,
      localBranches: localSet.size,
      remoteBranches: remoteSet.size,
      mergeCommits,
      uniqueAuthors: authors.size,
      dateRange,
      commitsPerDay,
    };
  }, [commits]);

  return (
    <div className="flex flex-col gap-3 p-4 bg-zinc-900 border border-zinc-800 rounded-lg text-xs">
      <div className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-1">
        Repository Statistics
      </div>

      <div className="grid grid-cols-2 gap-2">
        {/* Total Commits */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-xs mb-1">Commits</div>
          <div className="text-lg font-semibold text-green-400">{stats.totalCommits}</div>
        </div>

        {/* Merge Commits */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-xs mb-1">Merges</div>
          <div className="text-lg font-semibold text-blue-400">{stats.mergeCommits}</div>
        </div>

        {/* Local Branches */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-xs mb-1">Local Branches</div>
          <div className="text-lg font-semibold text-purple-400">{stats.localBranches}</div>
        </div>

        {/* Remote Branches */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-xs mb-1">Remote Branches</div>
          <div className="text-lg font-semibold text-blue-400">{stats.remoteBranches}</div>
        </div>

        {/* Unique Authors */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-xs mb-1">Authors</div>
          <div className="text-lg font-semibold text-amber-400">{stats.uniqueAuthors}</div>
        </div>

        {/* Commits Per Day */}
        <div className="bg-zinc-950 p-2 rounded border border-zinc-800">
          <div className="text-zinc-500 text-xs mb-1">Avg per Day</div>
          <div className="text-lg font-semibold text-pink-400">{stats.commitsPerDay}</div>
        </div>
      </div>

      {/* Date Range */}
      <div className="border-t border-zinc-800 pt-2 mt-1">
        <div className="text-zinc-500 text-xs mb-1">Activity Range</div>
        <div className="text-sm text-zinc-300">{stats.dateRange}</div>
      </div>

      {/* Additional Info */}
      {repoName && (
        <div className="border-t border-zinc-800 pt-2 mt-1">
          <div className="text-zinc-500 text-xs mb-1">Repository</div>
          <div className="text-sm text-zinc-300 truncate font-mono">{repoName}</div>
        </div>
      )}
    </div>
  );
};
