interface RebaseProgressModalProps {
  currentIndex: number;
  totalCommits: number;
  currentCommitMessage?: string;
  isComplete: boolean;
  onAbort: () => void;
}

export function RebaseProgressModal({
  currentIndex,
  totalCommits,
  currentCommitMessage,
  isComplete,
  onAbort,
}: RebaseProgressModalProps) {
  const progress = totalCommits > 0 ? (currentIndex / totalCommits) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-zinc-800">
          <h2 className="text-xl font-semibold text-zinc-100">
            {isComplete ? "✓ Rebase Complete" : "⏳ Rebasing..."}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!isComplete && (
            <>
              {/* Progress Text */}
              <p className="text-sm text-zinc-300">
                Applying commit {currentIndex + 1} of {totalCommits}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-graft-green transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Current Commit */}
              {currentCommitMessage && (
                <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
                  <p className="text-xs text-zinc-400 mb-1">Current:</p>
                  <p className="text-sm text-zinc-200 truncate">
                    {currentCommitMessage}
                  </p>
                </div>
              )}
            </>
          )}

          {isComplete && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 mb-4">
                <span className="text-3xl text-graft-green">✓</span>
              </div>
              <p className="text-lg font-medium text-zinc-200 mb-2">
                Rebase completed successfully!
              </p>
              <p className="text-sm text-zinc-400">
                {totalCommits} commits have been rebased.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isComplete && (
          <div className="flex items-center justify-center p-6 border-t border-zinc-800 bg-zinc-900">
            <button
              onClick={onAbort}
              className="px-6 py-2 text-sm font-medium bg-red-900/50 text-red-300 border border-red-800 rounded-lg hover:bg-red-900 transition-all"
            >
              Abort Rebase
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
