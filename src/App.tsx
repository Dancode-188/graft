import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { CommitListWithGraph } from "./components/CommitListWithGraph";
import { GraphLegend } from "./components/GraphLegend";
import { GraphStats } from "./components/GraphStats";
import { StagingArea } from "./components/staging/StagingArea";
import { DiffViewer } from "./components/DiffViewer";
import { BranchSidebar } from "./components/BranchSidebar";
import { BranchModal } from "./components/BranchModal";
import { RemoteStatusBar } from "./components/RemoteStatusBar";
import { ProgressToast } from "./components/ProgressToast";
import { PullDialog } from "./components/PullDialog";
import { PushDialog } from "./components/PushDialog";
import { ConflictNotification } from "./components/ConflictNotification";
import { 
  InteractiveRebaseModal,
  RebasePreviewModal,
  RebaseProgressModal,
  RebaseConflictModal,
  RebaseInstruction,
  RebasePlan,
  RebaseResult
} from "./components/rebase";
import { StashPanel } from "./components/stash";
import { CommandPalette, createCommands, type CommandActions } from "./components/command-palette";
import { KeyboardShortcuts } from "./components/keyboard";
import { QuickSearch } from "./components/quick-search";
import { StashEntry } from "./components/stash/types";
import { ThemeToggle } from "./components/ThemeToggle";

interface RepoInfo {
  name: string;
  path: string;
  current_branch: string;
  is_bare: boolean;
}

export interface Commit {
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
  tags: Array<{
    name: string;
    is_annotated: boolean;
    is_remote: boolean;
  }>;
}

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

interface FileChange {
  path: string;
  status: string;
  insertions: number;
  deletions: number;
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
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  // Load files when commit is selected
  useEffect(() => {
    if (commit) {
      setLoadingFiles(true);
      setFileError(null);
      setSelectedFile(null); // Reset selected file when commit changes
      
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
      <div className="flex-1 flex items-center justify-center bg-theme-surface p-6">
        <div className="text-center text-theme-tertiary">
          <p className="text-sm">Select a commit to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col overflow-hidden bg-theme-surface">
      {/* Scrollable Content Container */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        {/* Details Header */}
        <div className="border-b border-theme-default p-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-theme-primary mb-2 line-clamp-2">
                {commit.message.split('\n')[0]}
              </h3>
              <div className="space-y-1 text-xs text-theme-secondary">
                <div className="font-mono">{commit.hash}</div>
                <div>{commit.author_name} ({commit.author_email})</div>
                <div>{formatDate(commit.timestamp)}</div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 text-theme-secondary hover:text-theme-primary transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Full Message */}
        {commit.message.split('\n').length > 1 && (
          <div className="border-b border-theme-default p-4">
            <p className="text-xs text-theme-primary whitespace-pre-wrap font-mono bg-theme-bg p-2 rounded border border-theme-default">
              {commit.message}
            </p>
          </div>
        )}

        {/* Tags Section */}
        {commit.tags && commit.tags.length > 0 && (
          <div className="border-b border-theme-default p-4">
            <h4 className="text-xs font-semibold text-theme-primary mb-2 uppercase tracking-wider">
              Tags ({commit.tags.length})
            </h4>
            <div className="flex flex-wrap gap-2">
              {commit.tags.map((tag) => (
                <div
                  key={tag.name}
                  className={`px-2 py-1 rounded text-xs font-mono flex items-center gap-1 ${
                    tag.is_remote
                      ? 'bg-cyan-500 bg-opacity-20 border border-cyan-600 text-cyan-300'
                      : 'bg-amber-500 bg-opacity-20 border border-amber-600 text-amber-300'
                  }`}
                >
                  <span className="text-xs">🏷️</span>
                  <span>{tag.name.split('/').pop()}</span>
                  {tag.is_annotated && <span className="text-xs opacity-60">†</span>}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files List and Diff Section */}
        <div className="p-4">
        <h4 className="text-xs font-semibold text-theme-primary mb-3 uppercase tracking-wider">
          Files Changed ({files.length})
        </h4>

        {loadingFiles && (
          <div className="text-center py-8 text-theme-tertiary text-sm">
            Loading files...
          </div>
        )}

        {fileError && (
          <div className="p-2 bg-red-950 border border-red-800 rounded text-red-200 text-xs mb-2">
            {fileError}
          </div>
        )}

        {!loadingFiles && files.length === 0 && (
          <div className="text-center py-8 text-theme-tertiary text-sm">
            No files changed
          </div>
        )}

        {!loadingFiles && files.length > 0 && (
          <div className="space-y-1">
            {files.map((file, idx) => {
              const statusInfo = getStatusIcon(file.status);
              const isSelected = selectedFile === file.path;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedFile(file.path)}
                  className={`p-2 rounded transition-colors text-xs font-mono cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-900 bg-opacity-30 border border-cyan-700'
                      : 'hover:bg-theme-surface-hover border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={statusInfo.color}>{statusInfo.icon}</span>
                    <span className="text-theme-primary">{statusInfo.label}</span>
                  </div>
                  <div className="text-theme-secondary truncate pl-4 break-all">
                    {file.path}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Diff Viewer - Show when a file is selected */}
        {selectedFile && commit && (
          <div className="mt-4">
            <DiffViewer
              repoPath={repoPath}
              commitHash={commit.hash}
              filePath={selectedFile}
              fileName={selectedFile.split('/').pop() || selectedFile}
            />
          </div>
        )}
        </div>
      </div>

      {/* Summary Footer - Fixed at bottom */}
      <div className="flex-shrink-0 border-t border-theme-default p-3 bg-theme-bg text-xs text-theme-tertiary">
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
    <div className="fixed inset-0 bg-theme-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface border border-theme-default rounded-lg shadow-2xl w-full max-w-2xl max-h-96 flex flex-col">
        {/* Search Input */}
        <div className="p-4 border-b border-theme-default">
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
            className="w-full bg-theme-bg border border-theme-default rounded px-3 py-2 text-theme-primary placeholder-theme-tertiary focus:outline-none focus:ring-2 focus:ring-graft-500"
          />
        </div>

        {/* Results */}
        <div className="flex-1 overflow-auto">
          {query.trim() === "" ? (
            <div className="p-8 text-center text-theme-tertiary text-sm">
              Start typing to search commits
            </div>
          ) : results.length === 0 ? (
            <div className="p-8 text-center text-theme-tertiary text-sm">
              No commits found matching "{query}"
            </div>
          ) : (
            <div className="divide-y divide-theme-default">
              {results.map((commit) => {
                const message = commit.message.split('\n')[0];
                return (
                  <button
                    key={commit.hash}
                    onClick={() => handleSelect(commit)}
                    className="w-full px-4 py-3 text-left hover:bg-theme-surface-hover transition-colors focus:outline-none focus:bg-theme-surface-hover"
                  >
                    <div className="text-sm font-medium text-theme-primary truncate">
                      {message}
                    </div>
                    <div className="text-xs text-theme-secondary flex items-center gap-2 mt-1">
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
  const [branches, setBranches] = useState<Branch[]>([]);
  const [stashes, setStashes] = useState<StashEntry[]>([]);
  const [selectedCommitIndex, setSelectedCommitIndex] = useState<number>(-1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [shortcutsOverlayOpen, setShortcutsOverlayOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<'details' | 'staging'>('staging');
  
  // Branch sidebar collapsed by default, with localStorage persistence
  const [showBranchSidebar, setShowBranchSidebar] = useState(() => {
    const saved = localStorage.getItem('graft-show-branch-sidebar');
    return saved ? JSON.parse(saved) : false; // Default: collapsed
  });

  // Stash sidebar collapsed by default, with localStorage persistence
  const [showStashSidebar, setShowStashSidebar] = useState(() => {
    const saved = localStorage.getItem('graft-show-stash-sidebar');
    return saved ? JSON.parse(saved) : false; // Default: collapsed
  });
  
  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchModalMode, setBranchModalMode] = useState<'create' | 'rename' | 'delete'>('create');
  const [selectedBranch, setSelectedBranch] = useState<string | undefined>(undefined);
  
  // Fetch operation state
  const [fetchInProgress, setFetchInProgress] = useState(false);
  const [fetchProgress, setFetchProgress] = useState({ current: 0, total: 0, message: '' });
  const [fetchComplete, setFetchComplete] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  
  // Pull operation state
  const [pullDialogOpen, setPullDialogOpen] = useState(false);
  const [pullInProgress, setPullInProgress] = useState(false);
  const [pullComplete, setPullComplete] = useState(false);
  const [pullError, setPullError] = useState<string | null>(null);
  const [pullConflicts, setPullConflicts] = useState<Array<{ path: string; conflict_type: string }>>([]);
  const [remoteStatus, setRemoteStatus] = useState<{ ahead: number; behind: number; remoteName: string } | null>(null);
  
  // Push operation state
  const [pushDialogOpen, setPushDialogOpen] = useState(false);
  const [pushInProgress, setPushInProgress] = useState(false);
  const [pushComplete, setPushComplete] = useState(false);
  const [pushError, setPushError] = useState<string | null>(null);
  const [commitsToPush, setCommitsToPush] = useState<Commit[]>([]);
  
  // Interactive Rebase state
  const [rebaseModalOpen, setRebaseModalOpen] = useState(false);
  const [rebaseBaseCommit, setRebaseBaseCommit] = useState<string | null>(null);
  const [rebasePreviewOpen, setRebasePreviewOpen] = useState(false);
  const [rebasePreviewPlan, setRebasePreviewPlan] = useState<RebasePlan | null>(null);
  const [rebaseInstructions, setRebaseInstructions] = useState<RebaseInstruction[]>([]);
  const [rebaseProgressOpen, setRebaseProgressOpen] = useState(false);
  const [rebaseProgress, setRebaseProgress] = useState({ current: 0, total: 0, message: '' });
  const [rebaseConflictOpen, setRebaseConflictOpen] = useState(false);
  const [rebaseConflicts, setRebaseConflicts] = useState<Array<{ path: string; conflict_type: string }>>([]);
  const [rebaseCurrentCommit, setRebaseCurrentCommit] = useState<string | null>(null);
  
  // Context menu state
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; commit: Commit } | null>(null);
  
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Save branch sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('graft-show-branch-sidebar', JSON.stringify(showBranchSidebar));
  }, [showBranchSidebar]);

  // Save stash sidebar state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('graft-show-stash-sidebar', JSON.stringify(showStashSidebar));
  }, [showStashSidebar]);

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

      // Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
      }

      // Cmd+/ (Mac) or Ctrl+/ (Windows/Linux) to show keyboard shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === "/") {
        e.preventDefault();
        setShortcutsOverlayOpen(true);
      }

      // Cmd+P (Mac) or Ctrl+P (Windows/Linux) to open quick search
      if ((e.metaKey || e.ctrlKey) && e.key === "p") {
        e.preventDefault();
        if (repoInfo) {
          setQuickSearchOpen(true);
        }
      }

      // Cmd+B (Mac) or Ctrl+B (Windows/Linux) to toggle branch sidebar
      if ((e.metaKey || e.ctrlKey) && e.key === "b") {
        e.preventDefault();
        if (repoInfo) {
          setShowBranchSidebar((prev: boolean) => !prev);
        }
      }

      // Cmd+Shift+S (Mac) or Ctrl+Shift+S (Windows/Linux) to toggle stash sidebar
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "S") {
        e.preventDefault();
        if (repoInfo) {
          setShowStashSidebar((prev: boolean) => !prev);
        }
      }

      // Cmd+N (Mac) or Ctrl+N (Windows/Linux) to create new branch
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        if (repoInfo) {
          setBranchModalMode('create');
          setBranchModalOpen(true);
        }
      }

      // Cmd+R (Mac) or Ctrl+R (Windows/Linux) to refresh repository
      if ((e.metaKey || e.ctrlKey) && e.key === "r") {
        e.preventDefault();
        if (repoInfo) {
          handleBranchChange(); // Refresh everything
        }
      }

      // Cmd+Shift+P (Mac) or Ctrl+Shift+P (Windows/Linux) to push
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "P") {
        e.preventDefault();
        if (repoInfo) {
          setPushDialogOpen(true);
        }
      }

      // Cmd+Shift+L (Mac) or Ctrl+Shift+L (Windows/Linux) to pull
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "L") {
        e.preventDefault();
        if (repoInfo) {
          setPullDialogOpen(true);
        }
      }

      // Cmd+Shift+F (Mac) or Ctrl+Shift+F (Windows/Linux) to fetch
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === "F") {
        e.preventDefault();
        if (repoInfo) {
          handleFetch();
        }
      }

      // Escape to close search or deselect
      if (e.key === "Escape") {
        if (searchOpen) {
          setSearchOpen(false);
        } else if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (quickSearchOpen) {
          setQuickSearchOpen(false);
        } else if (shortcutsOverlayOpen) {
          setShortcutsOverlayOpen(false);
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
  }, [repoInfo, commits.length, selectedCommitIndex, searchOpen, commandPaletteOpen]);

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu) {
        setContextMenu(null);
      }
    };

    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

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

  // Load branches from repository
  const loadBranches = async (repoPath: string) => {
    try {
      const result = await invoke<Branch[]>('get_branches', { path: repoPath });
      setBranches(result);
    } catch (err) {
      console.error('Failed to load branches:', err);
      setBranches([]);
    }
  };

  // Load stashes from repository
  const loadStashes = async (repoPath: string) => {
    try {
      const result = await invoke<StashEntry[]>('list_stashes', { path: repoPath });
      setStashes(result);
    } catch (err) {
      console.error('Failed to load stashes:', err);
      setStashes([]);
    }
  };

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

        // Load branches and stashes
        await loadBranches(selected);
        await loadStashes(selected);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setRepoInfo(null);
      setCommits([]);
      setBranches([]);
      setStashes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCommit = (commit: Commit) => {
    const index = commits.findIndex((c) => c.hash === commit.hash);
    setSelectedCommitIndex(index);
    setRightPanelTab('details'); // Switch to details when selecting a commit
  };

  const handleSelectBranch = (branchName: string) => {
    // Show the branch sidebar when a branch is selected from quick search
    setShowBranchSidebar(true);
    // The BranchSidebar will highlight the selected branch
  };

  const handleSelectStash = (stashIndex: number) => {
    // Show the stash sidebar when a stash is selected from quick search
    setShowStashSidebar(true);
    // The StashPanel will show the selected stash
  };

  const handleCommitCreated = async () => {
    // Refresh commit history after creating a commit
    if (repoInfo) {
      try {
        const commitList = await invoke<Commit[]>("get_commits", {
          path: repoInfo.path,
          limit: 1000,
        });
        setCommits(commitList);
        setSelectedCommitIndex(-1); // Deselect after refresh
      } catch (err) {
        console.error("Failed to refresh commits:", err);
      }
    }
  };

  const handleBranchChange = async () => {
    // Refresh commits and repo info after branch operations
    if (repoInfo) {
      try {
        // Refresh repo info to get updated current branch
        const info = await invoke<RepoInfo>("open_repository", {
          path: repoInfo.path,
        });
        setRepoInfo(info);

        // Refresh commit list
        const commitList = await invoke<Commit[]>("get_commits", {
          path: repoInfo.path,
          limit: 1000,
        });
        setCommits(commitList);
        setSelectedCommitIndex(-1);

        // Refresh branches and stashes
        await loadBranches(repoInfo.path);
        await loadStashes(repoInfo.path);
      } catch (err) {
        console.error("Failed to refresh after branch change:", err);
      }
    }
  };

  const handleFetch = async () => {
    if (!repoInfo) return;

    setFetchInProgress(true);
    setFetchComplete(false);
    setFetchError(null);
    setFetchProgress({ current: 0, total: 0, message: 'Connecting to remote...' });

    try {
      const result = await invoke<{ success: boolean; bytes_received: number; objects_received: number; message: string }>(
        'fetch_from_remote',
        {
          path: repoInfo.path,
          remoteName: 'origin',
        }
      );

      setFetchProgress({
        current: result.objects_received,
        total: result.objects_received,
        message: result.message,
      });
      setFetchComplete(true);
      
      // Refresh the UI after fetch
      setTimeout(() => {
        handleBranchChange();
      }, 500);
    } catch (err) {
      setFetchError(err as string);
      console.error('Fetch failed:', err);
    } finally {
      setFetchInProgress(false);
    }
  };

  const handleOpenPullDialog = async () => {
    if (!repoInfo) return;

    try {
      // Get remote status to show in dialog
      const status = await invoke<{ 
        has_remote: boolean; 
        remote_name: string;
        ahead: number;
        behind: number;
      }>('get_remote_status', {
        path: repoInfo.path,
        branchName: repoInfo.current_branch,
      });

      if (status.has_remote) {
        setRemoteStatus({
          ahead: status.ahead,
          behind: status.behind,
          remoteName: status.remote_name,
        });
        setPullDialogOpen(true);
      }
    } catch (err) {
      console.error('Failed to get remote status:', err);
    }
  };

  const handlePull = async (strategy: 'merge' | 'rebase') => {
    if (!repoInfo) return;

    setPullDialogOpen(false);
    setPullInProgress(true);
    setPullComplete(false);
    setPullError(null);
    setPullConflicts([]);

    try {
      const result = await invoke<{
        success: boolean;
        conflicts: Array<{ path: string; conflict_type: string }>;
        commits_received: number;
        message: string;
      }>('pull_from_remote', {
        path: repoInfo.path,
        remoteName: remoteStatus?.remoteName || 'origin',
        strategy: strategy === 'merge' ? 'Merge' : 'Rebase',
      });

      if (!result.success && result.conflicts.length > 0) {
        // Show conflict notification
        setPullConflicts(result.conflicts);
        setPullError('Merge conflicts detected');
      } else {
        setPullComplete(true);
        // Refresh the UI after successful pull
        setTimeout(() => {
          handleBranchChange();
        }, 500);
      }
    } catch (err) {
      setPullError(err as string);
      console.error('Pull failed:', err);
    } finally {
      setPullInProgress(false);
    }
  };

  const handleOpenPushDialog = async () => {
    if (!repoInfo) return;

    try {
      // Get remote status to show in dialog
      const status = await invoke<{ 
        has_remote: boolean; 
        remote_name: string;
        ahead: number;
        behind: number;
      }>('get_remote_status', {
        path: repoInfo.path,
        branchName: repoInfo.current_branch,
      });

      if (status.has_remote) {
        setRemoteStatus({
          ahead: status.ahead,
          behind: status.behind,
          remoteName: status.remote_name,
        });

        // Get commits to push (only if ahead)
        if (status.ahead > 0) {
          // Get the commits that are ahead
          const allCommits = await invoke<Commit[]>('get_commits', {
            path: repoInfo.path,
            limit: status.ahead,
          });
          setCommitsToPush(allCommits.slice(0, status.ahead));
        } else {
          setCommitsToPush([]);
        }

        setPushDialogOpen(true);
      }
    } catch (err) {
      console.error('Failed to get remote status:', err);
    }
  };

  const handlePush = async (force: boolean, forceWithLease: boolean) => {
    if (!repoInfo) return;

    setPushDialogOpen(false);
    setPushInProgress(true);
    setPushComplete(false);
    setPushError(null);

    try {
      const result = await invoke<{
        success: boolean;
        rejected: boolean;
        rejection_reason: string;
        bytes_sent: number;
        message: string;
      }>('push_to_remote', {
        path: repoInfo.path,
        remoteName: remoteStatus?.remoteName || 'origin',
        branchName: repoInfo.current_branch,
        force: force,
        forceWithLease: forceWithLease,
      });

      if (result.success) {
        setPushComplete(true);
        // Refresh the UI after successful push
        setTimeout(() => {
          handleBranchChange();
        }, 500);
      } else if (result.rejected) {
        setPushError(result.message);
      }
    } catch (err) {
      setPushError(err as string);
      console.error('Push failed:', err);
    } finally {
      setPushInProgress(false);
    }
  };

  const handleBranchAction = (action: 'create' | 'rename' | 'delete', branchName?: string) => {
    setBranchModalMode(action);
    setSelectedBranch(branchName);
    setBranchModalOpen(true);
  };

  // Interactive Rebase Handlers
  const handleOpenRebaseModal = (baseCommit: string) => {
    setRebaseBaseCommit(baseCommit);
    setRebaseModalOpen(true);
  };

  const handleStartRebase = async (instructions: RebaseInstruction[]) => {
    if (!repoInfo || !rebaseBaseCommit) return;

    // First, prepare and preview the rebase
    try {
      const plan = await invoke<RebasePlan>('prepare_interactive_rebase', {
        path: repoInfo.path,
        baseCommit: rebaseBaseCommit,
        instructions,
      });

      setRebasePreviewPlan(plan);
      setRebaseInstructions(instructions);
      setRebaseModalOpen(false);
      setRebasePreviewOpen(true);
    } catch (err) {
      console.error('Failed to prepare rebase:', err);
      alert(`Failed to prepare rebase: ${err}`);
    }
  };

  const handleConfirmRebase = async () => {
    if (!repoInfo || !rebaseBaseCommit || rebaseInstructions.length === 0) return;

    setRebasePreviewOpen(false);
    setRebaseProgressOpen(true);
    setRebaseProgress({ current: 0, total: rebaseInstructions.length, message: 'Starting rebase...' });

    try {
      const result = await invoke<RebaseResult>('start_interactive_rebase', {
        path: repoInfo.path,
        baseCommit: rebaseBaseCommit,
        instructions: rebaseInstructions,
      });

      if (result.success) {
        // Rebase completed successfully
        setRebaseProgress({
          current: result.total_commits,
          total: result.total_commits,
          message: result.message,
        });
        
        // Refresh commits after successful rebase
        setTimeout(() => {
          setRebaseProgressOpen(false);
          handleBranchChange();
        }, 2000);
      } else if (result.conflicts.length > 0) {
        // Conflicts detected
        setRebaseProgressOpen(false);
        setRebaseConflicts(result.conflicts);
        setRebaseCurrentCommit(result.message);
        setRebaseConflictOpen(true);
      }
    } catch (err) {
      console.error('Rebase failed:', err);
      setRebaseProgressOpen(false);
      alert(`Rebase failed: ${err}`);
    }
  };

  const handleContinueRebase = async () => {
    if (!repoInfo) return;

    setRebaseConflictOpen(false);
    setRebaseProgressOpen(true);

    try {
      const result = await invoke<RebaseResult>('continue_rebase', {
        path: repoInfo.path,
      });

      if (result.success) {
        // Rebase continued and completed
        setTimeout(() => {
          setRebaseProgressOpen(false);
          handleBranchChange();
        }, 2000);
      } else if (result.conflicts.length > 0) {
        // More conflicts detected
        setRebaseProgressOpen(false);
        setRebaseConflicts(result.conflicts);
        setRebaseConflictOpen(true);
      }
    } catch (err) {
      console.error('Continue rebase failed:', err);
      setRebaseProgressOpen(false);
      alert(`Failed to continue rebase: ${err}`);
    }
  };

  const handleAbortRebase = async () => {
    if (!repoInfo) return;

    try {
      await invoke('abort_rebase', {
        path: repoInfo.path,
      });

      // Close all rebase modals
      setRebaseModalOpen(false);
      setRebasePreviewOpen(false);
      setRebaseProgressOpen(false);
      setRebaseConflictOpen(false);
      
      // Refresh the UI
      handleBranchChange();
    } catch (err) {
      console.error('Abort rebase failed:', err);
      alert(`Failed to abort rebase: ${err}`);
    }
  };

  const handleCommitContextMenu = (commit: Commit, x: number, y: number) => {
    setContextMenu({ x, y, commit });
  };

  const handleContextMenuAction = (action: 'rebase' | 'checkout' | 'cherrypick' | 'revert' | 'copyHash' | 'copyMessage') => {
    if (!contextMenu) return;

    switch (action) {
      case 'rebase':
        // Start interactive rebase from the selected commit
        handleOpenRebaseModal(contextMenu.commit.hash);
        break;
      
      case 'checkout':
        // Checkout commit (detached HEAD)
        if (confirm(`Checkout commit ${contextMenu.commit.short_hash}? This will put you in detached HEAD state.`)) {
          handleCheckoutCommit(contextMenu.commit.hash);
        }
        break;
      
      case 'cherrypick':
        // Cherry-pick commit
        if (confirm(`Cherry-pick commit ${contextMenu.commit.short_hash}?`)) {
          handleCherryPickCommit(contextMenu.commit.hash);
        }
        break;
      
      case 'revert':
        // Revert commit
        if (confirm(`Revert commit ${contextMenu.commit.short_hash}? This creates a new commit that undoes these changes.`)) {
          handleRevertCommit(contextMenu.commit.hash);
        }
        break;
      
      case 'copyHash':
        // Copy commit hash to clipboard
        navigator.clipboard.writeText(contextMenu.commit.hash);
        break;
      
      case 'copyMessage':
        // Copy commit message to clipboard
        navigator.clipboard.writeText(contextMenu.commit.message);
        break;
    }

    setContextMenu(null);
  };

  const handleCheckoutCommit = async (commitHash: string) => {
    if (!repoInfo) return;
    
    try {
      await invoke('checkout_commit', { path: repoInfo.path, commitHash });
      await handleBranchChange(); // Refresh to show detached HEAD state
    } catch (err) {
      console.error('Failed to checkout commit:', err);
      alert(`Failed to checkout commit: ${err}`);
    }
  };

  const handleCherryPickCommit = async (commitHash: string) => {
    if (!repoInfo) return;
    
    try {
      await invoke('cherrypick_commit', { path: repoInfo.path, commitHash });
      await handleBranchChange(); // Refresh commits
    } catch (err) {
      console.error('Failed to cherry-pick commit:', err);
      alert(`Failed to cherry-pick commit: ${err}`);
    }
  };

  const handleRevertCommit = async (commitHash: string) => {
    if (!repoInfo) return;
    
    try {
      await invoke('revert_commit', { path: repoInfo.path, commitHash });
      await handleBranchChange(); // Refresh commits
    } catch (err) {
      console.error('Failed to revert commit:', err);
      alert(`Failed to revert commit: ${err}`);
    }
  };

  // Create command actions for command palette
  const commandActions: CommandActions = {
    // Repository
    openRepository: handleOpenRepo,
    refreshRepository: handleBranchChange, // Reuse branch change handler which refreshes everything
    
    // Staging
    stageAll: () => {
      // This will be handled by StagingArea component, just focus on it
      setRightPanelTab('staging');
    },
    unstageAll: () => {
      setRightPanelTab('staging');
    },
    discardAll: () => {
      setRightPanelTab('staging');
    },
    commit: () => {
      setRightPanelTab('staging');
    },
    
    // Branches
    toggleBranchSidebar: () => setShowBranchSidebar((prev: boolean) => !prev),
    createBranch: () => {
      if (repoInfo) {
        setBranchModalMode('create');
        setBranchModalOpen(true);
      }
    },
    switchBranch: () => {
      if (repoInfo) {
        setShowBranchSidebar(true); // Show sidebar so user can select
      }
    },
    deleteBranch: () => {
      if (repoInfo) {
        setShowBranchSidebar(true); // Show sidebar so user can right-click to delete
      }
    },
    
    // Remote
    push: () => {
      if (repoInfo) setPushDialogOpen(true);
    },
    pull: () => {
      if (repoInfo) setPullDialogOpen(true);
    },
    fetch: handleFetch,
    
    // Stash
    toggleStashSidebar: () => setShowStashSidebar((prev: boolean) => !prev),
    createStash: () => {
      setShowStashSidebar(true); // Show stash sidebar so user can create
    },
    applyStash: () => {
      setShowStashSidebar(true); // Show stash sidebar so user can apply
    },
    popStash: () => {
      setShowStashSidebar(true); // Show stash sidebar so user can pop
    },
    
    // View
    toggleSearch: () => setSearchOpen(prev => !prev),
    focusStaging: () => setRightPanelTab('staging'),
    focusCommits: () => {
      setRightPanelTab('details');
      if (commits.length > 0 && selectedCommitIndex < 0) {
        setSelectedCommitIndex(0); // Select first commit
      }
    },
    
    // Search
    searchCommits: () => setSearchOpen(true),
    quickSearch: () => setQuickSearchOpen(true),
    
    // Help
    showShortcuts: () => setShortcutsOverlayOpen(true),
    showCommandPalette: () => setCommandPaletteOpen(true),
    
    // Context checks
    hasRepo: () => repoInfo !== null,
    hasChanges: () => repoInfo !== null, // Simplified for now
    hasBranches: () => repoInfo !== null,
    hasStashes: () => repoInfo !== null,
  };

  // Create commands with actions for the command palette
  const paletteCommands = createCommands(commandActions);

  return (
    <div className="flex flex-col h-screen bg-theme-bg text-theme-primary">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-theme-default">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight">
            <span className="text-graft-500">Graft</span>
          </h1>
          <span className="text-xs text-theme-tertiary font-mono">v0.5.0</span>
          
          {/* Branch Sidebar Toggle Button (only show when repo is open) */}
          {repoInfo && (
            <>
              <button
                onClick={() => setShowBranchSidebar(!showBranchSidebar)}
                className={`ml-2 px-3 py-1.5 text-xs rounded transition-all ${
                  showBranchSidebar
                    ? 'bg-graft-600/20 text-graft-400 border border-graft-600/30'
                    : 'bg-theme-surface text-theme-secondary border border-theme-default hover:border-theme-hover hover:text-theme-primary'
                }`}
                title={`${showBranchSidebar ? 'Hide' : 'Show'} Branches (${shortcutKey}+B)`}
              >
                🌿 Branches
              </button>

              {/* Stash Sidebar Toggle Button */}
              <button
                onClick={() => setShowStashSidebar(!showStashSidebar)}
                className={`ml-2 px-3 py-1.5 text-xs rounded transition-all ${
                  showStashSidebar
                    ? 'bg-graft-600/20 text-graft-400 border border-graft-600/30'
                    : 'bg-theme-surface text-theme-secondary border border-theme-default hover:border-theme-hover hover:text-theme-primary'
                }`}
                title={`${showStashSidebar ? 'Hide' : 'Show'} Stashes (${shortcutKey}+Shift+S)`}
              >
                💾 Stashes
              </button>
            </>
          )}
        </div>
        {repoInfo && (
          <div className="flex items-center gap-2 text-sm text-theme-secondary">
            <span className="text-theme-tertiary">│</span>
            <span className="font-mono">{repoInfo.name}</span>
            <span className="text-theme-tertiary">│</span>
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
              <p className="text-theme-secondary mb-6">
                A fast, beautiful, keyboard-first Git GUI that doesn't suck.
              </p>

              <button
                onClick={handleOpenRepo}
                disabled={loading}
                className="px-6 py-3 bg-graft-600 hover:bg-graft-700 active:bg-graft-800 disabled:bg-theme-surface disabled:text-theme-tertiary rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-graft-500 focus:ring-offset-2 focus:ring-offset-theme-bg"
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
          <>
            {/* Branch Sidebar with smooth transition */}
            {showBranchSidebar && (
              <div className="animate-slide-in-left">
                <BranchSidebar
                  repoPath={repoInfo.path}
                  onRefresh={handleBranchChange}
                  onBranchAction={handleBranchAction}
                />
              </div>
            )}

            {/* Center Panel - Commit List */}
            <div className="flex-1 flex flex-col overflow-hidden">
            {/* Header Bar */}
            <div className="px-6 py-4 border-b border-theme-default">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-xl font-semibold">
                    Commit History
                    <span className="ml-3 text-sm text-theme-tertiary font-normal">
                      {commits.length} commits
                    </span>
                  </h2>
                  {/* Remote Status Bar */}
                  <span className="text-theme-tertiary">│</span>
                  <RemoteStatusBar
                    repoPath={repoInfo.path}
                    currentBranch={repoInfo.current_branch}
                    onRefresh={handleBranchChange}
                  />
                  {/* Fetch Button */}
                  <button
                    onClick={handleFetch}
                    disabled={fetchInProgress}
                    className="px-3 py-1.5 text-xs bg-theme-surface hover:bg-theme-surface-hover active:bg-theme-surface-hover disabled:bg-theme-surface disabled:text-theme-tertiary rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5"
                    title="Fetch updates from remote"
                  >
                    {fetchInProgress ? (
                      <>
                        <span className="animate-spin">⟳</span>
                        <span>Fetching...</span>
                      </>
                    ) : (
                      <>
                        <span>↻</span>
                        <span>Fetch</span>
                      </>
                    )}
                  </button>
                  {/* Pull Button */}
                  <button
                    onClick={handleOpenPullDialog}
                    disabled={pullInProgress}
                    className="px-3 py-1.5 text-xs bg-theme-surface hover:bg-theme-surface-hover active:bg-theme-surface-hover disabled:bg-theme-surface disabled:text-theme-tertiary rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5"
                    title="Pull from remote"
                  >
                    {pullInProgress ? (
                      <>
                        <span className="animate-spin">⟳</span>
                        <span>Pulling...</span>
                      </>
                    ) : (
                      <>
                        <span>⬇</span>
                        <span>Pull</span>
                      </>
                    )}
                  </button>
                  {/* Push Button */}
                  <button
                    onClick={handleOpenPushDialog}
                    disabled={pushInProgress}
                    className="px-3 py-1.5 text-xs bg-theme-surface hover:bg-theme-surface-hover active:bg-theme-surface-hover disabled:bg-theme-surface disabled:text-theme-tertiary rounded-lg font-medium transition-all duration-200 flex items-center gap-1.5"
                    title="Push to remote"
                  >
                    {pushInProgress ? (
                      <>
                        <span className="animate-spin">⟳</span>
                        <span>Pushing...</span>
                      </>
                    ) : (
                      <>
                        <span>⬆</span>
                        <span>Push</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowLegend(!showLegend)}
                    className="px-4 py-2 text-sm bg-theme-surface hover:bg-theme-surface-hover active:bg-theme-surface-hover rounded-lg font-medium transition-all duration-200"
                    title="Show graph legend (? key)"
                  >
                    ⓘ Legend
                  </button>
                  <button
                    onClick={() => setShowStats(!showStats)}
                    className="px-4 py-2 text-sm bg-theme-surface hover:bg-theme-surface-hover active:bg-theme-surface-hover rounded-lg font-medium transition-all duration-200"
                    title="Show repository statistics"
                  >
                    📊 Stats
                  </button>
                  <button
                    onClick={handleOpenRepo}
                    className="px-4 py-2 text-sm bg-theme-surface hover:bg-theme-surface-hover active:bg-theme-surface-hover rounded-lg font-medium transition-all duration-200"
                  >
                    Open Different Repository
                  </button>
                </div>
              </div>
            </div>

            {/* Commit List with Graph */}
            <div className="relative flex-1 overflow-hidden h-full">
              {commits.length > 0 ? (
                <CommitListWithGraph
                  commits={commits}
                  selectedCommit={selectedCommit}
                  onSelectCommit={handleSelectCommit}
                  onCommitContextMenu={handleCommitContextMenu}
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

          {/* Stash Sidebar with smooth transition */}
          {showStashSidebar && (
            <div className="animate-slide-in-right w-64">
              <StashPanel
                repoPath={repoInfo.path}
                onRefresh={handleBranchChange}
              />
            </div>
          )}

        {/* Right Panel with Tabs */}
        {repoInfo && (
          <div className="w-80 border-l border-theme-default bg-theme-surface flex flex-col">
            {/* Tab Header */}
            <div className="border-b border-theme-default flex">
              <button
                onClick={() => setRightPanelTab('staging')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  rightPanelTab === 'staging'
                    ? 'bg-theme-bg text-theme-primary border-b-2 border-graft-500'
                    : 'text-theme-tertiary hover:text-theme-primary hover:bg-theme-surface-hover'
                }`}
              >
                📝 Staging
              </button>
              <button
                onClick={() => setRightPanelTab('details')}
                className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                  rightPanelTab === 'details'
                    ? 'bg-theme-bg text-theme-primary border-b-2 border-graft-500'
                    : 'text-theme-tertiary hover:text-theme-primary hover:bg-theme-surface-hover'
                }`}
              >
                🔍 Details
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-hidden">
              {rightPanelTab === 'staging' ? (
                <StagingArea
                  repoPath={repoInfo.path}
                  onCommitCreated={handleCommitCreated}
                />
              ) : (
                <CommitDetailsPanel
                  commit={selectedCommit}
                  repoPath={repoInfo.path}
                  onClose={() => setSelectedCommitIndex(-1)}
                />
              )}
            </div>
          </div>
        )}
          </>
        )}
      </main>

      {/* Branch Modal */}
      {repoInfo && (
        <BranchModal
          isOpen={branchModalOpen}
          onClose={() => setBranchModalOpen(false)}
          repoPath={repoInfo.path}
          mode={branchModalMode}
          currentBranch={selectedBranch}
          onSuccess={handleBranchChange}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        commits={commits}
        onSelect={handleSelectCommit}
      />

      {/* Command Palette */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        commands={paletteCommands}
      />

      {/* Keyboard Shortcuts Overlay */}
      <KeyboardShortcuts
        isOpen={shortcutsOverlayOpen}
        onClose={() => setShortcutsOverlayOpen(false)}
      />

      {/* Quick Search */}
      <QuickSearch
        isOpen={quickSearchOpen}
        onClose={() => setQuickSearchOpen(false)}
        commits={commits}
        branches={branches}
        stashes={stashes}
        onSelectCommit={(index) => {
          setSelectedCommitIndex(index);
          setRightPanelTab('details');
        }}
        onSelectBranch={handleSelectBranch}
        onSelectStash={handleSelectStash}
      />

      {/* Context Menu for Commits */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 min-w-[200px]"
          style={{
            left: `${contextMenu.x}px`,
            top: `${contextMenu.y}px`,
          }}
        >
          <button
            onClick={() => handleContextMenuAction('rebase')}
            className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <span>🔀</span>
            <span>Interactive Rebase from Here</span>
          </button>
          <button
            onClick={() => handleContextMenuAction('checkout')}
            className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <span>↪️</span>
            <span>Checkout Commit</span>
          </button>
          <button
            onClick={() => handleContextMenuAction('cherrypick')}
            className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <span>🍒</span>
            <span>Cherry-pick</span>
          </button>
          <button
            onClick={() => handleContextMenuAction('revert')}
            className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <span>⎌</span>
            <span>Revert Commit</span>
          </button>
          <div className="h-px bg-zinc-700 my-1" />
          <button
            onClick={() => handleContextMenuAction('copyHash')}
            className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <span>📋</span>
            <span>Copy Hash</span>
          </button>
          <button
            onClick={() => handleContextMenuAction('copyMessage')}
            className="w-full px-4 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 transition-colors flex items-center gap-2"
          >
            <span>📝</span>
            <span>Copy Message</span>
          </button>
        </div>
      )}

      {/* Interactive Rebase Modal */}
      {repoInfo && rebaseModalOpen && rebaseBaseCommit && (
        <InteractiveRebaseModal
          repoPath={repoInfo.path}
          baseCommit={rebaseBaseCommit}
          onClose={() => setRebaseModalOpen(false)}
          onStartRebase={handleStartRebase}
        />
      )}

      {/* Rebase Preview Modal */}
      {rebasePreviewOpen && rebasePreviewPlan && (
        <RebasePreviewModal
          plan={rebasePreviewPlan}
          onBack={() => {
            setRebasePreviewOpen(false);
            setRebaseModalOpen(true);
          }}
          onConfirm={handleConfirmRebase}
        />
      )}

      {/* Rebase Progress Modal */}
      {rebaseProgressOpen && (
        <RebaseProgressModal
          currentIndex={rebaseProgress.current}
          totalCommits={rebaseProgress.total}
          currentCommitMessage={rebaseProgress.message}
          isComplete={rebaseProgress.current >= rebaseProgress.total}
          onAbort={handleAbortRebase}
        />
      )}

      {/* Rebase Conflict Modal */}
      {rebaseConflictOpen && (
        <RebaseConflictModal
          currentIndex={rebaseProgress.current}
          totalCommits={rebaseProgress.total}
          currentCommitMessage={rebaseCurrentCommit || undefined}
          conflicts={rebaseConflicts}
          onContinue={handleContinueRebase}
          onAbort={handleAbortRebase}
        />
      )}

      {/* Status Bar */}
      <footer className="px-6 py-2 border-t border-theme-default bg-theme-surface text-xs text-theme-tertiary flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Phase 9: Keyboard & Speed ⚡ (In Progress)</span>
          {commits.length > 0 && (
            <>
              <span className="text-theme-tertiary">│</span>
              <span>{commits.length} commits loaded</span>
            </>
          )}
          {selectedCommit && (
            <>
              <span className="text-theme-tertiary">│</span>
              <span className="text-graft-400">{selectedCommitIndex + 1} of {commits.length}</span>
            </>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="font-mono">{shortcutKey}+K</span>
          <span className="text-theme-tertiary">Commands</span>
          <span className="text-theme-tertiary">│</span>
          <span className="font-mono">↑↓</span>
          <span className="text-theme-tertiary">Navigate</span>
          <span className="text-theme-tertiary">│</span>
          <span className="font-mono">{shortcutKey}+B</span>
          <span className="text-theme-tertiary">Branches</span>
          <span className="text-theme-tertiary">│</span>
          <span className="font-mono">{shortcutKey}+F</span>
          <span className="text-theme-tertiary">Search</span>
          <span className="text-theme-tertiary">│</span>
          <span className="text-theme-tertiary">Ready</span>
        </div>
      </footer>

      {/* Progress Toast for Fetch/Pull/Push Operations */}
      {(fetchInProgress || fetchComplete || fetchError) && (
        <ProgressToast
          operation="fetch"
          stage={fetchProgress.message}
          progress={fetchProgress.total > 0 ? (fetchProgress.current / fetchProgress.total) * 100 : 0}
          current={fetchProgress.current}
          total={fetchProgress.total}
          isComplete={fetchComplete}
          isError={!!fetchError}
          message={fetchError || fetchProgress.message}
          onClose={() => {
            setFetchComplete(false);
            setFetchError(null);
          }}
        />
      )}

      {/* Progress Toast for Pull Operations */}
      {(pullInProgress || pullComplete || (pullError && pullConflicts.length === 0)) && (
        <ProgressToast
          operation="pull"
          stage={pullInProgress ? 'Pulling changes...' : pullComplete ? 'Pull complete' : 'Pull failed'}
          progress={pullInProgress ? 50 : 100}
          isComplete={pullComplete}
          isError={!!pullError && pullConflicts.length === 0}
          message={pullError && pullConflicts.length === 0 ? pullError : pullComplete ? 'Successfully pulled changes' : 'Pulling changes...'}
          onClose={() => {
            setPullComplete(false);
            if (pullConflicts.length === 0) {
              setPullError(null);
            }
          }}
        />
      )}

      {/* Pull Dialog */}
      {pullDialogOpen && remoteStatus && (
        <PullDialog
          remoteName={remoteStatus.remoteName}
          branchName={repoInfo?.current_branch || ''}
          ahead={remoteStatus.ahead}
          behind={remoteStatus.behind}
          onPull={handlePull}
          onCancel={() => setPullDialogOpen(false)}
        />
      )}

      {/* Conflict Notification */}
      {pullConflicts.length > 0 && (
        <ConflictNotification
          conflicts={pullConflicts}
          onDismiss={() => {
            setPullConflicts([]);
            setPullError(null);
          }}
        />
      )}

      {/* Progress Toast for Push Operations */}
      {(pushInProgress || pushComplete || pushError) && (
        <ProgressToast
          operation="push"
          stage={pushInProgress ? 'Pushing changes...' : pushComplete ? 'Push complete' : 'Push failed'}
          progress={pushInProgress ? 50 : 100}
          isComplete={pushComplete}
          isError={!!pushError}
          message={pushError || (pushComplete ? 'Successfully pushed changes' : 'Pushing changes...')}
          onClose={() => {
            setPushComplete(false);
            setPushError(null);
          }}
        />
      )}

      {/* Push Dialog */}
      {pushDialogOpen && remoteStatus && (
        <PushDialog
          remoteName={remoteStatus.remoteName}
          branchName={repoInfo?.current_branch || ''}
          ahead={remoteStatus.ahead}
          behind={remoteStatus.behind}
          commitsToPush={commitsToPush}
          onPush={handlePush}
          onCancel={() => setPushDialogOpen(false)}
        />
      )}

      {/* Theme Toggle - Debug/Testing Component */}
      <ThemeToggle />
    </div>
  );
}

export default App;
