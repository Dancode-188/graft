import { ConflictFile } from "./types";

interface RebaseConflictModalProps {
  currentIndex: number;
  totalCommits: number;
  currentCommitMessage?: string;
  conflicts: ConflictFile[];
  onContinue: () => void;
  onAbort: () => void;
}

export function RebaseConflictModal({
  currentIndex,
  totalCommits,
  currentCommitMessage,
  conflicts,
  onContinue,
  onAbort,
}: RebaseConflictModalProps) {
  return (
    <div className="fixed inset-0 bg-theme-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-theme-default">
          <h2 className="text-xl font-semibold text-red-400">
            ⚠️ Conflicts Detected
          </h2>
          <p className="text-sm text-theme-tertiary mt-1">
            Rebase paused at commit {currentIndex + 1} of {totalCommits}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Current Commit */}
          {currentCommitMessage && (
            <div className="p-4 bg-theme-bg rounded-lg border border-theme-default">
              <p className="text-xs text-theme-tertiary mb-1">Current commit:</p>
              <p className="text-sm text-theme-primary">{currentCommitMessage}</p>
            </div>
          )}

          {/* Conflicts List */}
          <div>
            <h3 className="text-sm font-semibold text-theme-secondary mb-3">
              Conflicts in {conflicts.length} file{conflicts.length !== 1 ? "s" : ""}:
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {conflicts.map((conflict, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 p-3 bg-red-900/20 border border-red-800 rounded-lg"
                >
                  <span className="text-red-400 flex-shrink-0">✕</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-theme-primary font-mono truncate">
                      {conflict.path}
                    </p>
                    {conflict.conflict_type && (
                      <p className="text-xs text-theme-tertiary mt-0.5">
                        {conflict.conflict_type}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-theme-bg border border-theme-default rounded-lg p-4">
            <h4 className="text-sm font-semibold text-theme-secondary mb-2">
              📝 How to resolve:
            </h4>
            <ol className="text-sm text-theme-tertiary space-y-2 list-decimal list-inside">
              <li>Open the conflicted files in your editor</li>
              <li>Resolve all conflicts (look for &lt;&lt;&lt;&lt;&lt;&lt;&lt; markers)</li>
              <li>Stage the resolved files with git add</li>
              <li>Click "Mark as Resolved & Continue" below</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-theme-default bg-theme-surface">
          <button
            onClick={onAbort}
            className="px-4 py-2 text-sm font-medium bg-red-900/50 text-red-300 border border-red-800 rounded-lg hover:bg-red-900 transition-all"
          >
            Abort Rebase
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-2 text-sm font-semibold bg-graft-500 text-white rounded-lg hover:bg-graft-400 shadow-lg shadow-graft-500/20 transition-all"
          >
            Mark as Resolved & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
