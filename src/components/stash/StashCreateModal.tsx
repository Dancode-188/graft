import { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { StashCreateOptions } from './types';

interface StashCreateModalProps {
  repoPath: string;
  onClose: () => void;
  onSuccess: () => void;
}

export function StashCreateModal({ repoPath, onClose, onSuccess }: StashCreateModalProps) {
  const [message, setMessage] = useState('');
  const [includeUntracked, setIncludeUntracked] = useState(false);
  const [keepIndex, setKeepIndex] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);

    try {
      const options: StashCreateOptions = {
        message: message.trim() || undefined,
        include_untracked: includeUntracked,
        keep_index: keepIndex,
      };

      await invoke('create_stash', {
        path: repoPath,
        options,
      });

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleCreate();
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div 
        className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-full max-w-md"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="border-b border-zinc-800 p-4">
          <h2 className="text-lg font-semibold text-zinc-100">Create Stash</h2>
          <p className="text-xs text-zinc-500 mt-1">
            Save your work-in-progress without committing
          </p>
        </div>

        {/* Content */}
        <div className="p-4 space-y-4">
          {/* Message Input */}
          <div>
            <label className="block text-sm text-zinc-300 mb-2">
              Message (optional)
            </label>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Describe what you're stashing..."
              className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-graft-500"
              autoFocus
            />
            <p className="text-xs text-zinc-600 mt-1">
              Leave empty to auto-generate message
            </p>
          </div>

          {/* Options */}
          <div className="space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={includeUntracked}
                onChange={(e) => setIncludeUntracked(e.target.checked)}
                className="mt-0.5 w-4 h-4 bg-zinc-800 border-zinc-600 rounded text-graft-500 focus:ring-2 focus:ring-graft-500"
              />
              <div>
                <div className="text-sm text-zinc-300">Include untracked files</div>
                <div className="text-xs text-zinc-600">
                  Also stash new files that haven't been added to Git
                </div>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={keepIndex}
                onChange={(e) => setKeepIndex(e.target.checked)}
                className="mt-0.5 w-4 h-4 bg-zinc-800 border-zinc-600 rounded text-graft-500 focus:ring-2 focus:ring-graft-500"
              />
              <div>
                <div className="text-sm text-zinc-300">Keep staged changes</div>
                <div className="text-xs text-zinc-600">
                  Leave your staged changes in the index
                </div>
              </div>
            </label>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-900/20 border border-red-800 rounded text-sm text-red-300">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-zinc-800 p-4 flex items-center justify-between">
          <div className="text-xs text-zinc-600">
            Tip: {message.trim() ? 'Cmd/Ctrl+Enter' : 'Just click Create'} to stash quickly
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={loading}
              className="px-4 py-2 text-sm bg-graft-500 hover:bg-graft-600 text-white rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : '💾 Create Stash'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
