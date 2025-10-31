import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { StashEntry, FileChange } from './types';

interface StashPreviewModalProps {
  repoPath: string;
  stash: StashEntry;
  onClose: () => void;
  onApply: (pop: boolean) => void;
  onDrop: () => void;
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

export function StashPreviewModal({ 
  repoPath, 
  stash, 
  onClose, 
  onApply, 
  onDrop 
}: StashPreviewModalProps) {
  const [files, setFiles] = useState<FileChange[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStashDiff();
  }, [stash.index]);

  const loadStashDiff = async () => {
    setLoading(true);
    setError(null);

    try {
      const diff = await invoke<FileChange[]>('get_stash_diff', {
        path: repoPath,
        stashIndex: stash.index,
      });
      setFiles(diff);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const displayMessage = stash.message.startsWith('WIP on') 
    ? stash.message.split(':').slice(1).join(':').trim() || stash.message
    : stash.message;

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="border-b border-zinc-800 p-4 flex-shrink-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-mono text-graft-400 font-semibold">
                  stash@{'{' + stash.index + '}'}
                </span>
                <span className="text-xs text-zinc-500">•</span>
                <span className="text-xs text-zinc-400">
                  {formatDate(stash.timestamp)}
                </span>
              </div>
              <h3 className="text-base font-semibold text-zinc-100 mb-2">
                {displayMessage}
              </h3>
              <div className="flex items-center gap-3 text-xs text-zinc-500">
                <div className="flex items-center gap-1">
                  <span>🌿</span>
                  <span className="font-mono">{stash.branch}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <span>📄</span>
                  <span>{stash.file_count} file{stash.file_count !== 1 ? 's' : ''}</span>
                </div>
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="text-xs font-semibold text-zinc-300 mb-3 uppercase tracking-wider">
            Files Changed ({files.length})
          </h4>

          {loading ? (
            <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
              Loading stash contents...
            </div>
          ) : error ? (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded text-sm text-red-300">
              <p className="font-semibold mb-1">Error loading stash</p>
              <p className="text-xs">{error}</p>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8 text-zinc-500 text-sm">
              No files in this stash
            </div>
          ) : (
            <div className="space-y-1">
              {files.map((file) => {
                const { icon, color, label } = getStatusIcon(file.status);
                return (
                  <div
                    key={file.path}
                    className="flex items-center gap-3 py-2 px-3 bg-zinc-800/50 hover:bg-zinc-800 rounded border border-zinc-700/50 hover:border-zinc-600 transition-all"
                  >
                    <span className={`text-sm ${color} w-4 text-center`} title={label}>
                      {icon}
                    </span>
                    <span className="text-sm text-zinc-200 font-mono flex-1 min-w-0 truncate">
                      {file.path}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 p-4 flex-shrink-0">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onApply(false)}
                className="px-4 py-2 text-sm bg-graft-500 hover:bg-graft-600 text-white rounded transition-colors"
                title="Apply stash (keeps in list)"
              >
                ✅ Apply
              </button>
              <button
                onClick={() => onApply(true)}
                className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                title="Apply and remove from list"
              >
                ⚡ Pop
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={onDrop}
                className="px-4 py-2 text-sm bg-red-900/50 hover:bg-red-900 text-red-300 rounded transition-colors"
                title="Delete stash (cannot be undone)"
              >
                🗑️ Drop
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
