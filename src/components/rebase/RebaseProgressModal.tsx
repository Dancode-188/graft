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
    <div className="fixed inset-0 bg-theme-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface rounded-lg shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="p-6 border-b border-theme-default">
          <h2 className="text-xl font-semibold text-theme-primary">
            {isComplete ? "✓ Rebase Complete" : "⏳ Rebasing..."}
          </h2>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!isComplete && (
            <>
              {/* Progress Text */}
              <p className="text-sm text-theme-secondary">
                Applying commit {currentIndex + 1} of {totalCommits}
              </p>

              {/* Progress Bar */}
              <div className="w-full bg-theme-bg rounded-full h-2 overflow-hidden">
                <div
                  className="h-full bg-graft-500 transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              {/* Current Commit */}
              {currentCommitMessage && (
                <div className="p-3 bg-theme-bg rounded-lg border border-theme-default">
                  <p className="text-xs text-theme-tertiary mb-1">Current:</p>
                  <p className="text-sm text-theme-primary truncate">
                    {currentCommitMessage}
                  </p>
                </div>
              )}
            </>
          )}

          {isComplete && (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-900/30 mb-4">
                <span className="text-3xl text-graft-500">✓</span>
              </div>
              <p className="text-lg font-medium text-theme-primary mb-2">
                Rebase completed successfully!
              </p>
              <p className="text-sm text-theme-tertiary">
                {totalCommits} commits have been rebased.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isComplete && (
          <div className="flex items-center justify-center p-6 border-t border-theme-default bg-theme-surface">
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
