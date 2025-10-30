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
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-red-400">
            ⚠️ Conflicts Detected
          </h2>
          <p className="text-sm text-zinc-400 mt-1">
            Rebase paused at commit {currentIndex + 1} of {totalCommits}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Current Commit */}
          {currentCommitMessage && (
            <div className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
              <p className="text-xs text-zinc-400 mb-1">Current commit:</p>
              <p className="text-sm text-zinc-200">{currentCommitMessage}</p>
            </div>
          )}

          {/* Conflicts List */}
          <div>
            <h3 className="text-sm font-semibold text-zinc-300 mb-3">
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
                    <p className="text-sm text-zinc-200 font-mono truncate">
                      {conflict.path}
                    </p>
                    {conflict.conflict_type && (
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {conflict.conflict_type}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-zinc-300 mb-2">
              📝 How to resolve:
            </h4>
            <ol className="text-sm text-zinc-400 space-y-2 list-decimal list-inside">
              <li>Open the conflicted files in your editor</li>
              <li>Resolve all conflicts (look for &lt;&lt;&lt;&lt;&lt;&lt;&lt; markers)</li>
              <li>Stage the resolved files with git add</li>
              <li>Click "Mark as Resolved & Continue" below</li>
            </ol>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-zinc-800 bg-zinc-900">
          <button
            onClick={onAbort}
            className="px-4 py-2 text-sm font-medium bg-red-900/50 text-red-300 border border-red-800 rounded-lg hover:bg-red-900 transition-all"
          >
            Abort Rebase
          </button>
          <button
            onClick={onContinue}
            className="px-6 py-2 text-sm font-semibold bg-graft-500 text-zinc-900 rounded-lg hover:bg-graft-400 shadow-lg shadow-graft-500/20 transition-all"
          >
            Mark as Resolved & Continue
          </button>
        </div>
      </div>
    </div>
  );
}
