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

function App() {
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
  const [commits, setCommits] = useState<Commit[]>([]);
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
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleOpenRepo = async () => {
    try {
      setLoading(true);
      setError(null);

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
      <main className="flex-1 flex items-center justify-center p-6">
        {!repoInfo ? (
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
        ) : (
          <div className="w-full h-full flex flex-col animate-fade-in">
            {/* Commit List */}
            <div className="flex-1 overflow-auto px-6 py-4">
              <div className="max-w-6xl mx-auto">
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
                    const commitMessage = commit.message.split('\n')[0]; // First line only

                    return (
                      <div
                        key={commit.hash}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 hover:border-zinc-700 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start gap-4">
                          {/* Commit Graph Placeholder */}
                          <div className="flex-shrink-0 w-8 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-graft-500"></div>
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
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono">Ready</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
