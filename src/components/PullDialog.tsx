import { useState } from 'react';

interface PullDialogProps {
  remoteName: string;
  branchName: string;
  ahead: number;
  behind: number;
  onPull: (strategy: 'merge' | 'rebase') => void;
  onCancel: () => void;
}

export function PullDialog({
  remoteName,
  branchName,
  ahead,
  behind,
  onPull,
  onCancel,
}: PullDialogProps) {
  const [strategy, setStrategy] = useState<'merge' | 'rebase'>('merge');

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg w-[480px] shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">
            Pull '{branchName}' from '{remoteName}'
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Remote Status */}
          {behind > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-yellow-400">⚠️</span>
              <span className="text-zinc-300">
                {behind} commit{behind === 1 ? '' : 's'} behind remote
              </span>
            </div>
          )}

          {ahead > 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-graft-400">ℹ️</span>
              <span className="text-zinc-300">
                {ahead} local commit{ahead === 1 ? '' : 's'} not pushed
              </span>
            </div>
          )}

          {behind === 0 && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-green-400">✓</span>
              <span className="text-zinc-300">Already up to date</span>
            </div>
          )}

          {/* Strategy Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Pull Strategy:
            </label>
            
            <div className="space-y-2">
              {/* Merge Option */}
              <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="strategy"
                  value="merge"
                  checked={strategy === 'merge'}
                  onChange={() => setStrategy('merge')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-zinc-200">Merge (default)</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Creates a merge commit to combine changes
                  </div>
                </div>
              </label>

              {/* Rebase Option */}
              <label className="flex items-start gap-3 p-3 rounded-lg border border-zinc-800 hover:border-zinc-700 cursor-pointer transition-colors">
                <input
                  type="radio"
                  name="strategy"
                  value="rebase"
                  checked={strategy === 'rebase'}
                  onChange={() => setStrategy('rebase')}
                  className="mt-1"
                />
                <div className="flex-1">
                  <div className="font-medium text-zinc-200">Rebase</div>
                  <div className="text-xs text-zinc-500 mt-0.5">
                    Replays your commits on top of remote changes
                  </div>
                </div>
              </label>
            </div>
          </div>

          {/* Warning for uncommitted changes */}
          <div className="bg-yellow-950/30 border border-yellow-800/50 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-yellow-400 text-sm">💡</span>
              <div className="text-xs text-yellow-200/90">
                Make sure your working directory is clean before pulling.
                Uncommitted changes will prevent the pull operation.
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-zinc-800 hover:bg-zinc-700 rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onPull(strategy)}
            disabled={behind === 0}
            className="px-4 py-2 text-sm bg-graft-500 hover:bg-graft-600 active:bg-graft-700 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-lg font-medium transition-colors"
          >
            Pull
          </button>
        </div>
      </div>
    </div>
  );
}
