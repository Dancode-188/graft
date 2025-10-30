import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface RemoteStatus {
  has_remote: boolean;
  remote_name: string;
  remote_url: string;
  ahead: number;
  behind: number;
  up_to_date: boolean;
}

interface RemoteStatusBarProps {
  repoPath: string;
  currentBranch: string;
  onRefresh?: () => void;
}

export function RemoteStatusBar({ repoPath, currentBranch, onRefresh }: RemoteStatusBarProps) {
  const [status, setStatus] = useState<RemoteStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load remote status
  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<RemoteStatus>('get_remote_status', {
        path: repoPath,
        branchName: currentBranch,
      });
      setStatus(result);
    } catch (err) {
      setError(err as string);
      console.error('Failed to get remote status:', err);
    } finally {
      setLoading(false);
    }
  };

  // Load status on mount and when branch changes
  useEffect(() => {
    loadStatus();
    
    // Poll for status every 30 seconds
    const interval = setInterval(loadStatus, 30000);
    return () => clearInterval(interval);
  }, [repoPath, currentBranch]);

  // Handle refresh
  const handleRefresh = () => {
    loadStatus();
    if (onRefresh) {
      onRefresh();
    }
  };

  if (loading && !status) {
    return (
      <span className="text-xs text-zinc-500">
        Loading remote status...
      </span>
    );
  }

  if (error) {
    return (
      <span className="text-xs text-red-400" title={error}>
        ⚠️ Remote error
      </span>
    );
  }

  if (!status) {
    return null;
  }

  if (!status.has_remote) {
    return (
      <span className="text-xs text-zinc-500">
        No remote configured
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs">
      {/* Up to date status */}
      {status.up_to_date && (
        <span className="text-green-400 flex items-center gap-1">
          <span>✓</span>
          <span>Up to date</span>
        </span>
      )}

      {/* Ahead indicator */}
      {status.ahead > 0 && (
        <span className="text-graft-400 flex items-center gap-1" title={`${status.ahead} commit${status.ahead === 1 ? '' : 's'} ahead of ${status.remote_name}`}>
          <span>↑</span>
          <span className="font-mono">{status.ahead}</span>
          <span>ahead</span>
        </span>
      )}

      {/* Behind indicator */}
      {status.behind > 0 && (
        <span className="text-yellow-400 flex items-center gap-1" title={`${status.behind} commit${status.behind === 1 ? '' : 's'} behind ${status.remote_name}`}>
          <span>↓</span>
          <span className="font-mono">{status.behind}</span>
          <span>behind</span>
        </span>
      )}

      {/* Remote name (shown on hover) */}
      <span 
        className="text-zinc-600 cursor-help" 
        title={`Remote: ${status.remote_name}\nURL: ${status.remote_url}`}
      >
        ({status.remote_name})
      </span>

      {/* Refresh button */}
      <button
        onClick={handleRefresh}
        disabled={loading}
        className="text-zinc-500 hover:text-zinc-300 disabled:opacity-50 transition-colors"
        title="Refresh remote status"
      >
        {loading ? '⟳' : '↻'}
      </button>
    </div>
  );
}
