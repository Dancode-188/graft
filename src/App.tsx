import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";

interface RepoInfo {
  name: string;
  path: string;
  current_branch: string;
  is_bare: boolean;
}

function App() {
  const [repoInfo, setRepoInfo] = useState<RepoInfo | null>(null);
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
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setRepoInfo(null);
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
          <div className="w-full max-w-2xl animate-fade-in">
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Repository Info</h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Name:</dt>
                  <dd className="font-mono text-graft-400">{repoInfo.name}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Path:</dt>
                  <dd className="font-mono text-sm text-zinc-300 truncate max-w-md">
                    {repoInfo.path}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Current Branch:</dt>
                  <dd className="font-mono text-graft-400">{repoInfo.current_branch}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-zinc-400">Type:</dt>
                  <dd className="text-zinc-300">
                    {repoInfo.is_bare ? "Bare Repository" : "Working Directory"}
                  </dd>
                </div>
              </dl>

              <button
                onClick={handleOpenRepo}
                className="mt-6 w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded-lg font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-graft-500 focus:ring-offset-2 focus:ring-offset-zinc-900"
              >
                Open Different Repository
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Status Bar */}
      <footer className="px-6 py-2 border-t border-zinc-800 bg-zinc-900 text-xs text-zinc-500 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span>Phase 0: Foundation Complete ✅</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono">Ready</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
