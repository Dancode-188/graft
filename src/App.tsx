import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

interface RepoInfo {
  name: string;
  path: string;
  current_branch: string;
  is_bare: boolean;
}

interface Commit {
  hash: string;
  short_hash: string;
  message: string;
  author_name: string;
  author_email: string;
  timestamp: number;
  parent_hashes: string[];
}

interface FileChange {
  path: string;
  status: string;
  insertions: number;
  deletions: number;
}

// Helper function to format time ago
function getTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  
  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  };

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(seconds / secondsInUnit);
    if (interval >= 1) {
      return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
    }
  }

  return 'just now';
}

// Format date to readable string
function formatDate(timestamp: number): string {
  const date = new Date(timestamp * 1000);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

// Get icon and color for file status
function getStatusIcon(status: string): { icon: string; color: string; label: string } {
  const statusMap = {
    added: { icon: '✚', color: 'text-green-400', label: 'Added' },
    modified: { icon: '◆', color: 'text-blue-400', label: 'Modified' },
    deleted: { icon: '✕', color: 'text-red-400', label: 'Deleted' },
    renamed: { icon: '→', color: 'text-yellow-400', label: 'Renamed' },
    copied: { icon: '⊡', color: 'text-purple-400', label: 'Copied' },
    type_change: { icon: '◇', color: 'text-orange-400', label: 'Type Change' },
  };
  return statusMap[status as keyof typeof statusMap] || { icon: '?', color: 'text-gray-400', label: 'Unknown' };
}

// Commit Details Panel Component
function CommitDetailsPanel({ 
  commit, 
  repoPath,
  onClose 
}: { 
  commit: Commit | null; 
  repoPath: string;
  onClose: () => void;
}) {
  const [files, setFiles] = useState<FileChange[]>([]);
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Load files when commit is selected
  useEffect(() => {
    if (commit) {
      setLoadingFiles(true);
      setFileError(null);
      
      invoke<FileChange[]>("get_commit_files", {
        path: repoPath,
        commit_hash: commit.hash,
      })
        .then((files) => {
          setFiles(files);
        })
        .catch((err) => {
          setFileError(err instanceof Error ? err.message : String(err));
        })
        .finally(() => {
          setLoadingFiles(false);
        });
    }
  }, [commit, repoPath]);

  if (!commit) {
    return (
      <div className="w-96 border-l border-zinc-800 bg-zinc-900 flex items-center justify-center">
        <div className="text-center text-zinc-500">
          <p className="text-sm">Select a commit to view details</p>
        </div>
      </div>
    );
  }

  const date = new Date(commit.timestamp * 1000);

  return (
    <div className="w-96 border-l border-zinc-800 bg-zinc-900 flex flex-col overflow-hidden">
      {/* Details Header */}
      <div className="border-b border-zinc-800 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-zinc-100 mb-2 line-clamp-2">
              {commit.message.split('\n')[0]}
            </h3>
            <div className="space-y-1 text-xs text-zinc-400">
              <div className="font-mono">{commit.hash}</div>
              <div>{commit.author_name} ({commit.author_email})</div>
              <div>{formatDate(commit.timestamp)}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Full Message */}
      {commit.message.split('\n').length > 1 && (
        <div className="border-b border-zinc-800 p-4">
          <p className="text-xs text-zinc-300 whitespace-pre-wrap font-mono bg-zinc-950 p-2 rounded border border-zinc-800">
            {commit.message}
          </p>
        </div>
      )}

      {/* Files List */}
      <div className="flex-1 overflow-auto p-4">
        <h4 className="text-xs font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
          Files Changed ({files.length})
        </h4>

        {loadingFiles && (
          <div className="text-center py-8 text-zinc-500 text-sm">
            Loading files...
          </div>
        )}

        {fileError && (
          <div className="p-2 bg-red-950 border border-red-800 rounded text-red-200 text-xs mb-2">
            {fileError}
          </div>
        )}

        {!loadingFiles && files.length === 0 && (
          <div className="text-center py-8 text-zinc-500 text-sm">
            No files changed
          </div>
        )}

        {!loadingFiles && files.length > 0 && (
          <div className="space-y-1">
            {files.map((file, idx) => {
              const statusInfo = getStatusIcon(file.status);
              return (
                <div
                  key={idx}
                  className="p-2 rounded hover:bg-zinc-800 transition-colors text-xs font-mono"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={statusInfo.color}>{statusInfo.icon}</span>
                    <span className="text-zinc-300">{statusInfo.label}</span>
                  </div>
                  <div className="text-zinc-400 truncate pl-4 break-all">
                    {file.path}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Summary Footer */}
      <div className="border-t border-zinc-800 p-3 bg-zinc-950 text-xs text-zinc-400">
        <div className="flex items-center justify-between">
          <span>{files.length} files changed</span>
          <span>{commit.parent_hashes.length} parent(s)</span>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Detect OS for keyboard shortcut display
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+O (Mac) or Ctrl+O (Windows/Linux) to open repository
      if ((e.metaKey || e.ctrlKey) && e.key === "o") {
        e.preventDefault();
        handleOpenRepo();
      }
      
      // Escape to deselect commit
      if (e.key === "Escape") {
        setSelectedCommit(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenRepo = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCommit(null);

      // Open directory picker
      const selected = await open({
        directory: true,
        multiple: false,
        title: "Select Git Repository",
      });

      if (selected && typeof selected === "string") {
        // Call Rust backend to open the repo
        const info = await invoke<RepoInfo>("open_repository", {
          path: selected,
        });
        setRepoInfo(info);

        // Fetch commits from the repository
        const commitList = await invoke<Commit[]>("get_commits", {
          path: selected,
          limit: 100, // Fetch first 100 commits
        });
        setCommits(commitList);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setRepoInfo(null);
      setCommits([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-graft-500">Graft</span>
          </h1>
          <span className="text-xs text-zinc-500 font-mono">v0.1.0</span>
        </div>
        {repoInfo && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="text-zinc-600">│</span>
            <span className="font-mono">{repoInfo.name}</span>
            <span className="text-zinc-600">│</span>
            <span className="text-graft-500">{repoInfo.current_branch}</span>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex">
        {!repoInfo ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="flex flex-col items-center gap-6 max-w-md text-center animate-fade-in">
              <div className="text-6xl mb-4">🌿</div>
              <h2 className="text-3xl font-semibold mb-2">Welcome to Graft</h2>
              <p className="text-zinc-400 mb-6">
                A fast, beautiful, keyboard-first Git GUI that doesn't suck.
              </p>

              <button
                onClick={handleOpenRepo}
                disabled={loading}
                className="px-6 py-3 bg-graft-600 hover:bg-graft-700 active:bg-graft-800 disabled:bg-zinc-800 disabled:text-zinc-500 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-graft-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
              >
                {loading ? "Opening..." : "Open Repository"}
              </button>

              {error && (
                <div className="mt-4 p-4 bg-red-950 border border-red-800 rounded-lg text-red-200 text-sm">
                  <p className="font-semibold mb-1">Error</p>
                  <p>{error}</p>
                </div>
              )}

              <p className="text-xs text-zinc-600 mt-4">
                Press <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">{shortcutKey}+O</kbd> to open a repository
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Commits Section */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <div className="max-w-4xl mx-auto">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Commit History
                    <span className="ml-3 text-sm text-zinc-500 font-normal">
                      {commits.length} commits
                    </span>
                  </h2>
                  <button
                    onClick={handleOpenRepo}
                    className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg font-medium transition-all duration-200"
                  >
                    Open Different Repository
                  </button>
                </div>

                {/* Commit List */}
                <div className="space-y-2">
                  {commits.map((commit) => {
                    const date = new Date(commit.timestamp * 1000);
                    const timeAgo = getTimeAgo(date);
                    const commitMessage = commit.message.split('\n')[0];
                    const isSelected = selectedCommit?.hash === commit.hash;

                    return (
                      <div
                        key={commit.hash}
                        onClick={() => setSelectedCommit(commit)}
                        className={`bg-zinc-900 border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                          isSelected
                            ? 'border-graft-500 bg-zinc-800'
                            : 'border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          {/* Commit Graph Placeholder */}
                          <div className="flex-shrink-0 w-8 flex items-center justify-center">
                            <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-graft-400' : 'bg-graft-500'}`}></div>
                          </div>

                          {/* Commit Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-3 mb-1">
                              <p className="text-sm font-medium text-zinc-100 truncate">
                                {commitMessage}
                              </p>
                              <span className="flex-shrink-0 text-xs text-zinc-500 font-mono">
                                {commit.short_hash}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-zinc-500">
                              <span>{commit.author_name}</span>
                              <span>•</span>
                              <span>{timeAgo}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {commits.length === 0 && (
                  <div className="text-center py-12 text-zinc-500">
                    No commits found in this repository
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Details Panel */}
        {repoInfo && (
          <CommitDetailsPanel
            commit={selectedCommit}
            repoPath={repoInfo.path}
            onClose={() => setSelectedCommit(null)}
          />
        )}
      </main>

      {/* Status Bar */}
      <footer className="px-6 py-2 border-t border-zinc-800 bg-zinc-900 text-xs text-zinc-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Phase 1: Commit History 🚀</span>
          {commits.length > 0 && (
            <>
              <span className="text-zinc-600">│</span>
              <span>{commits.length} commits loaded</span>
            </>
          )}
          {selectedCommit && (
            <>
              <span className="text-zinc-600">│</span>
              <span className="text-graft-400">1 selected</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono">Ready</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
