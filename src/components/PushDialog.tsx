import { useState, useEffect } from 'react';
import { Commit } from '../App';

interface PushDialogProps {
  remoteName: string;
  branchName: string;
  ahead: number;
  behind: number;
  commitsToPush: Commit[];
  onPush: (force: boolean, forceWithLease: boolean) => void;
  onCancel: () => void;
}

export function PushDialog({
  remoteName,
  branchName,
  ahead,
  behind,
  commitsToPush,
  onPush,
  onCancel,
}: PushDialogProps) {
  const [needsForce, setNeedsForce] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  useEffect(() => {
    // Check if force push is needed (remote has commits we don't have)
    setNeedsForce(behind > 0);
  }, [behind]);

  // Force push button hold logic
  useEffect(() => {
  let interval: ReturnType<typeof setInterval>;
    if (isHolding && holdProgress < 100) {
      interval = setInterval(() => {
        setHoldProgress((prev) => {
          const next = prev + 5; // 5% per 100ms = 2 seconds total
          if (next >= 100) {
            handleForcePush();
            return 100;
          }
          return next;
        });
      }, 100);
    } else if (!isHolding) {
      setHoldProgress(0);
    }
    return () => clearInterval(interval);
  }, [isHolding, holdProgress]);

  const handleNormalPush = () => {
    onPush(false, false);
  };

  const handleForcePush = () => {
    // Use force-with-lease for safety
    onPush(false, true);
    setIsHolding(false);
    setHoldProgress(0);
  };

  const handleMouseDown = () => {
    setIsHolding(true);
  };

  const handleMouseUp = () => {
    setIsHolding(false);
    if (holdProgress < 100) {
      setHoldProgress(0);
    }
  };

  const handleMouseLeave = () => {
    setIsHolding(false);
    setHoldProgress(0);
  };

  return (
    <div className="fixed inset-0 bg-theme-overlay flex items-center justify-center z-50">
      <div className="bg-theme-surface border border-theme-default rounded-lg w-[520px] shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-theme-default">
          <h2 className="text-lg font-semibold text-theme-primary">
            {needsForce ? '⚠️ Force Push Required' : `Push to '${remoteName}/${branchName}'`}
          </h2>
        </div>

        {/* Content */}
        <div className="px-6 py-4 space-y-4">
          {/* Normal Push Info */}
          {!needsForce && (
            <>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-graft-400">✓</span>
                <span className="text-theme-secondary">
                  {ahead} commit{ahead === 1 ? '' : 's'} ready to push
                </span>
              </div>

              {/* Commit List */}
              {commitsToPush.length > 0 && (
                <div className="max-h-48 overflow-y-auto space-y-1 bg-theme-bg rounded-lg p-3 border border-theme-default">
                  {commitsToPush.map((commit) => (
                    <div key={commit.hash} className="text-xs">
                      <div className="font-mono text-graft-400">• {commit.message}</div>
                      <div className="text-theme-tertiary ml-3">
                        {commit.author_name} • {new Date(commit.timestamp * 1000).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* Force Push Warning */}
          {needsForce && (
            <div className="space-y-3">
              <div className="bg-red-950/30 border border-red-800/50 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <span className="text-red-400 text-xl flex-shrink-0">⚠️</span>
                  <div className="text-sm text-red-200">
                    <p className="font-semibold mb-2">Remote has {behind} newer commit{behind === 1 ? '' : 's'}</p>
                    <p className="mb-2">
                      Force pushing will <span className="font-bold">OVERWRITE</span> these commits on the remote.
                    </p>
                    <p className="text-red-300/80">
                      This is a <span className="font-bold">DESTRUCTIVE</span> operation that cannot be undone!
                    </p>
                  </div>
                </div>
              </div>

              {/* Commits to push */}
              {commitsToPush.length > 0 && (
                <div>
                  <p className="text-xs text-theme-tertiary mb-2">Your local commits:</p>
                  <div className="max-h-32 overflow-y-auto space-y-1 bg-theme-bg rounded-lg p-3 border border-theme-default">
                    {commitsToPush.slice(0, 5).map((commit) => (
                      <div key={commit.hash} className="text-xs">
                        <div className="font-mono text-theme-secondary">• {commit.message}</div>
                      </div>
                    ))}
                    {commitsToPush.length > 5 && (
                      <div className="text-xs text-theme-tertiary">
                        ... and {commitsToPush.length - 5} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Safety info */}
              <div className="bg-blue-950/20 border border-blue-800/30 rounded-lg p-3">
                <div className="text-xs text-blue-200/80">
                  <span className="font-semibold">💡 Using --force-with-lease:</span> This safer alternative will fail if someone else pushed since you last fetched.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-theme-default flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm bg-theme-bg hover:bg-theme-surface-hover rounded-lg font-medium transition-colors"
          >
            Cancel
          </button>
          
          {!needsForce ? (
            <button
              onClick={handleNormalPush}
              disabled={ahead === 0}
              className="px-4 py-2 text-sm bg-graft-500 hover:bg-graft-600 active:bg-graft-700 disabled:bg-theme-bg disabled:text-theme-tertiary rounded-lg font-medium transition-colors"
            >
              Push
            </button>
          ) : (
            <div className="relative">
              <button
                onMouseDown={handleMouseDown}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                className="px-4 py-2 text-sm bg-red-600 hover:bg-red-700 active:bg-red-800 rounded-lg font-medium transition-colors relative overflow-hidden"
              >
                {/* Progress bar background */}
                <div
                  className="absolute inset-0 bg-red-700 transition-all duration-100"
                  style={{ width: `${holdProgress}%` }}
                />
                <span className="relative z-10">
                  {holdProgress > 0 && holdProgress < 100 ? 'Hold...' : 'Force Push (Hold 2s)'}
                </span>
              </button>
              {isHolding && holdProgress < 100 && (
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-xs text-red-400 whitespace-nowrap">
                  Keep holding...
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
