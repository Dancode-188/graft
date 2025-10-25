import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { CommitGraph } from "./components/CommitGraph";
import { CommitListWithGraph } from "./components/CommitListWithGraph";
import { GraphLegend } from "./components/GraphLegend";
import { GraphStats } from "./components/GraphStats";

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
  branches: Array<{
    name: string;
    is_remote: boolean;
    is_current: boolean;
  }>;
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
        commitHash: commit.hash,
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

// Search Modal Component
function SearchModal({
  isOpen,
  onClose,
  commits,
  onSelect,
}: {
  isOpen: boolean;
  onClose: () => void;
  commits: Commit[];
  onSelect: (commit: Commit) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Commit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setResults([]);
    } else {
      // Focus input when modal opens
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (query.trim() === "") {
      setResults([]);
      return;
    }

    const q = query.toLowerCase();
    const filtered = commits.filter((commit) => {
      return (
        commit.message.toLowerCase().includes(q) ||
        commit.author_name.toLowerCase().includes(q) ||
        commit.author_email.toLowerCase().includes(q) ||
        commit.hash.toLowerCase().includes(q) ||
        commit.short_hash.toLowerCase().includes(q)
      );
    });

    setResults(filtered.slice(0, 20)); // Limit to first 20 results
  }, [query, commits]);

  const handleSelect = (commit: Commit) => {
    onSelect(commit);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-full max-w-2xl max-h-96 flex flex-col">
        {/* Search Input */}
        <div className="p-4 border-b border-zinc-800">
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commits by message, author, or hash... (Press Escape to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") {
                onClose();
              } else if (e.key === "Enter" && results.length > 0) {
                handleSelect(results[0]);
              }
            }}
            className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-graft-500"
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto">
          {query.trim() === "" ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              Start typing to search commits
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-zinc-500 text-sm">
              No commits found matching "{query}"
            </div>
          ) : (
            <div className="divide-y divide-zinc-800">
              {results.map((commit) => {
                const message = commit.message.split('\n')[0];
                return (
                  <button
                    key={commit.hash}
                    onClick={() => handleSelect(commit)}
                    className="w-full px-4 py-3 text-left hover:bg-zinc-800 transition-colors focus:outline-none focus:bg-zinc-800"
                  >
                    <div className="text-sm font-medium text-zinc-100 truncate">
                      {message}
                    </div>
                    <div className="text-xs text-zinc-400 flex items-center gap-2 mt-1">
                      <span>{commit.short_hash}</span>
                      <span>•</span>
                      <span>{commit.author_name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
  const [selectedCommitIndex, setSelectedCommitIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Detect OS for keyboard shortcut display
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘' : 'Ctrl';

  const selectedCommit = selectedCommitIndex >= 0 ? commits[selectedCommitIndex] : null;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+O (Mac) or Ctrl+O (Windows/Linux) to open repository
      if ((e.metaKey || e.ctrlKey) && e.key === "o") {
        e.preventDefault();
        handleOpenRepo();
      }

      // Cmd+F (Mac) or Ctrl+F (Windows/Linux) to search
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        setSearchOpen(true);
      }

      // Escape to close search or deselect
      if (e.key === "Escape") {
        if (searchOpen) {
          setSearchOpen(false);
        } else {
          setSelectedCommitIndex(-1);
        }
      }

      // Arrow keys for navigation (only when repo is open)
      if (repoInfo && commits.length > 0) {
        if (e.key === "ArrowDown") {
          e.preventDefault();
          setSelectedCommitIndex((prev) =>
            prev < commits.length - 1 ? prev + 1 : prev
          );
        } else if (e.key === "ArrowUp") {
          e.preventDefault();
          setSelectedCommitIndex((prev) => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === "Enter" && selectedCommitIndex >= 0) {
          // Enter already selects, but this confirms the selection
          e.preventDefault();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [repoInfo, commits.length, selectedCommitIndex, searchOpen]);

  // Scroll selected commit into view
  useEffect(() => {
    if (selectedCommitIndex >= 0 && listContainerRef.current) {
      const itemHeight = 104;
      const scrollTop = selectedCommitIndex * itemHeight;
      const containerHeight = listContainerRef.current.clientHeight;

      if (scrollTop < listContainerRef.current.scrollTop) {
        listContainerRef.current.scrollTop = scrollTop;
      } else if (scrollTop + itemHeight > listContainerRef.current.scrollTop + containerHeight) {
        listContainerRef.current.scrollTop = scrollTop + itemHeight - containerHeight;
      }
    }
  }, [selectedCommitIndex]);

  const handleOpenRepo = async () => {
    try {
      setLoading(true);
      setError(null);
      setSelectedCommitIndex(-1);

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
          limit: 1000, // Increased limit for virtual scrolling
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

  const handleSelectCommit = (commit: Commit) => {
    const index = commits.findIndex((c) => c.hash === commit.hash);
    setSelectedCommitIndex(index);
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
      <main className="flex-1 flex overflow-hidden">
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
                <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">{shortcutKey}+O</kbd> Open
                {" | "}
                <kbd className="px-2 py-1 bg-zinc-800 rounded text-zinc-300">{shortcutKey}+F</kbd> Search
              </p>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header Bar */}
            <div className="px-6 py-4 border-b border-zinc-800">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-xl font-semibold">
                  Commit History
                  <span className="ml-3 text-sm text-zinc-500 font-normal">
                    {commits.length} commits
                  </span>
                </h2>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowLegend(!showLegend)}
                    className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg font-medium transition-all duration-200"
                    title="Show graph legend (? key)"
                  >
                    ⓘ Legend
                  </button>
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg font-medium transition-all duration-200"
                    title="Show repository statistics"
                  >
                    📊 Stats
                  </button>
                  <button
                    onClick={handleOpenRepo}
                    className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg font-medium transition-all duration-200"
                  >
                    Open Different Repository
                  </button>
                </div>
              </div>
            </div>

            {/* Commit List with Graph */}
            <div className="relative flex-1">
              {commits.length > 0 ? (
                <CommitListWithGraph
                  commits={commits}
                  selectedCommit={selectedCommit}
                  onSelectCommit={handleSelectCommit}
                />
              ) : (
                <div className="flex-1 flex items-center justify-center text-zinc-500">
                  No commits found in this repository
                </div>
              )}

              {/* Legend and Stats Overlays */}
              {showLegend && (
                <div className="absolute top-4 left-4 z-40 max-w-xs">
                  <div className="relative">
                    <GraphLegend
                      maxLanes={commits.length > 0 
                        ? Math.max(...Array.from(new Map(
                            commits.map(c => [
                              c.hash,
                              (Math.max(...c.parent_hashes.map(ph => 
                                commits.findIndex(cm => cm.hash === ph)
                              ), -1) || 0) + 1
                            ])
                          ).values())) 
                        : 0}
                    />
                    <button
                      onClick={() => setShowLegend(false)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-zinc-400 hover:text-zinc-200 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {showStats && (
                <div className="absolute top-4 right-4 z-40 max-w-xs">
                  <div className="relative">
                    <GraphStats
                      commits={commits}
                      repoName={repoInfo?.name}
                    />
                    <button
                      onClick={() => setShowStats(false)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-zinc-800 hover:bg-zinc-700 rounded-full text-xs text-zinc-400 hover:text-zinc-200 flex items-center justify-center"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Details Panel */}
        {repoInfo && (
          <CommitDetailsPanel
            commit={selectedCommit}
            repoPath={repoInfo.path}
            onClose={() => setSelectedCommitIndex(-1)}
          />
        )}
      </main>

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        commits={commits}
        onSelect={handleSelectCommit}
      />

      {/* Status Bar */}
      <footer className="px-6 py-2 border-t border-zinc-800 bg-zinc-900 text-xs text-zinc-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Phase 2: Git Graph Visualization 🌳</span>
          {commits.length > 0 && (
            <>
              <span className="text-zinc-600">│</span>
              <span>{commits.length} commits loaded</span>
            </>
          )}
          {selectedCommit && (
            <>
              <span className="text-zinc-600">│</span>
              <span className="text-graft-400">{selectedCommitIndex + 1} of {commits.length}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono">↑↓</span>
          <span className="text-zinc-600">Navigate</span>
          <span className="text-zinc-600">│</span>
          <span className="font-mono">{shortcutKey}+F</span>
          <span className="text-zinc-600">Search</span>
          <span className="text-zinc-600">│</span>
          <span className="text-zinc-600">Ready</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
