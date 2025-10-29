import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface Branch {
  name: string;
  full_name: string;
  is_remote: boolean;
  is_current: boolean;
  commit_hash: string;
  commit_message: string;
  last_commit_date: number;
  upstream: string | null;
}

interface BranchSidebarProps {
  repoPath: string;
  onRefresh?: () => void;
  onBranchAction?: (action: 'create' | 'rename' | 'delete', branchName?: string) => void;
}

export function BranchSidebar({ repoPath, onRefresh, onBranchAction }: BranchSidebarProps) {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRemote, setShowRemote] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; branch: Branch } | null>(null);

  // Load branches on mount and when repoPath changes
  useEffect(() => {
    loadBranches();
  }, [repoPath]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  const loadBranches = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<Branch[]>('get_branches', { path: repoPath });
      setBranches(result);
      
      // Set the current branch as selected by default
      const currentBranch = result.find(b => b.is_current);
      if (currentBranch) {
        setSelectedBranch(currentBranch.name);
      }
    } catch (err) {
      setError(err as string);
      console.error('Failed to load branches:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filter branches based on search query
  const filteredBranches = branches.filter(branch => {
    const matchesSearch = branch.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = showRemote ? true : !branch.is_remote;
    return matchesSearch && matchesType;
  });

  const localBranches = filteredBranches.filter(b => !b.is_remote);
  const remoteBranches = filteredBranches.filter(b => b.is_remote);

  // Format last commit date
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  };

  // Handle branch click (switch branch)
  const handleBranchClick = async (branch: Branch) => {
    if (branch.is_current) {
      setSelectedBranch(branch.name);
      return; // Already on this branch
    }

    if (branch.is_remote) {
      // TODO: Handle remote branch checkout (create local tracking branch)
      return;
    }

    try {
      setLoading(true);
      await invoke('switch_branch', { path: repoPath, branchName: branch.name });
      
      // Reload branches to update current branch indicator
      await loadBranches();
      
      // Notify parent to refresh commit list
      if (onRefresh) {
        onRefresh();
      }
    } catch (err) {
      console.error('Failed to switch branch:', err);
      alert(`Failed to switch branch: ${err}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle right-click context menu
  const handleContextMenu = (e: React.MouseEvent, branch: Branch) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Don't show context menu for remote branches (not supported yet)
    if (branch.is_remote) return;

    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      branch,
    });
  };

  // Handle context menu actions
  const handleContextAction = (action: 'rename' | 'delete') => {
    if (contextMenu && onBranchAction) {
      onBranchAction(action, contextMenu.branch.name);
    }
    setContextMenu(null);
  };

  if (loading && branches.length === 0) {
    return (
      <div className="w-60 border-r border-zinc-800 bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-500 text-sm">Loading branches...</div>
      </div>
    );
  }

  return (
    <div className="w-60 border-r border-zinc-800 bg-zinc-900 flex flex-col relative">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-zinc-300">🌿 Branches</h2>
          <button
            onClick={loadBranches}
            disabled={loading}
            className="text-zinc-500 hover:text-zinc-300 disabled:opacity-50 transition-colors"
            title="Refresh branches"
          >
            {loading ? '⟳' : '↻'}
          </button>
        </div>
        
        {/* Search Input */}
        <input
          type="text"
          placeholder="Search branches..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-3 py-1.5 text-sm bg-zinc-800 border border-zinc-700 rounded focus:outline-none focus:ring-1 focus:ring-graft-500 focus:border-graft-500 text-zinc-200 placeholder-zinc-500"
        />
      </div>

      {/* Error Display */}
      {error && (
        <div className="px-4 py-2 bg-red-900/20 border-b border-red-800 text-red-400 text-xs">
          {error}
        </div>
      )}

      {/* Branch List */}
      <div className="flex-1 overflow-y-auto">
        {/* Local Branches */}
        <div>
          <div className="px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-950">
            📁 Local ({localBranches.length})
          </div>
          {localBranches.length === 0 ? (
            <div className="px-4 py-3 text-sm text-zinc-600">
              No local branches found
            </div>
          ) : (
            localBranches.map((branch) => (
              <button
                key={branch.full_name}
                onClick={() => handleBranchClick(branch)}
                onContextMenu={(e) => handleContextMenu(e, branch)}
                className={`w-full px-4 py-2.5 text-left hover:bg-zinc-800 transition-colors border-l-2 ${
                  branch.is_current
                    ? 'border-graft-500 bg-zinc-800/50'
                    : selectedBranch === branch.name
                    ? 'border-blue-500 bg-zinc-800/30'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-base">
                      {branch.is_current ? '★' : '🌿'}
                    </span>
                    <span className={`text-sm truncate ${
                      branch.is_current ? 'text-graft-400 font-semibold' : 'text-zinc-300'
                    }`}>
                      {branch.name}
                    </span>
                  </div>
                  {branch.is_current && (
                    <span className="text-xs text-graft-500 font-medium shrink-0">
                      *
                    </span>
                  )}
                </div>
                <div className="mt-1 text-xs text-zinc-500 truncate">
                  {branch.commit_message || 'No commit message'}
                </div>
                <div className="mt-0.5 text-xs text-zinc-600">
                  {formatDate(branch.last_commit_date)}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Remote Branches (Collapsible) */}
        <div className="mt-2">
          <button
            onClick={() => setShowRemote(!showRemote)}
            className="w-full px-4 py-2 text-xs font-semibold text-zinc-500 uppercase tracking-wider bg-zinc-950 hover:bg-zinc-900 flex items-center justify-between transition-colors"
          >
            <span>📁 Remote ({remoteBranches.length})</span>
            <span className="text-base">{showRemote ? '▼' : '▶'}</span>
          </button>
          
          {showRemote && (
            <>
              {remoteBranches.length === 0 ? (
                <div className="px-4 py-3 text-sm text-zinc-600">
                  No remote branches found
                </div>
              ) : (
                remoteBranches.map((branch) => (
                  <button
                    key={branch.full_name}
                    onClick={() => handleBranchClick(branch)}
                    className="w-full px-4 py-2.5 text-left hover:bg-zinc-800 transition-colors border-l-2 border-transparent"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">🌐</span>
                      <span className="text-sm text-zinc-400 truncate">
                        {branch.name.replace('origin/', '')}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 truncate">
                      {branch.commit_message || 'No commit message'}
                    </div>
                    <div className="mt-0.5 text-xs text-zinc-700">
                      {formatDate(branch.last_commit_date)}
                    </div>
                  </button>
                ))
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer Actions */}
      <div className="px-4 py-3 border-t border-zinc-800 bg-zinc-950">
        <button
          onClick={() => onBranchAction?.('create')}
          className="w-full px-3 py-2 text-sm bg-graft-600 hover:bg-graft-500 active:bg-graft-700 text-white rounded font-medium transition-colors"
          title="Create new branch (Cmd+N)"
        >
          + New Branch
        </button>
      </div>

      {/* Context Menu */}
      {contextMenu && (
        <div
          className="fixed bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl py-1 z-50 min-w-[160px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {!contextMenu.branch.is_current && (
            <button
              onClick={() => handleBranchClick(contextMenu.branch)}
              className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
            >
              ↪️ Switch to branch
            </button>
          )}
          <button
            onClick={() => handleContextAction('rename')}
            className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-700 transition-colors"
          >
            ✏️ Rename branch
          </button>
          {!contextMenu.branch.is_current && (
            <button
              onClick={() => handleContextAction('delete')}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-zinc-700 transition-colors"
            >
              🗑️ Delete branch
            </button>
          )}
        </div>
      )}
    </div>
  );
}
