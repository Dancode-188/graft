import { useEffect } from 'react';

interface ProgressToastProps {
  operation: 'fetch' | 'pull' | 'push';
  stage: string;
  progress: number; // 0-100
  current?: number;
  total?: number;
  message?: string;
  isComplete?: boolean;
  isError?: boolean;
  onClose?: () => void;
}

export function ProgressToast({
  operation,
  stage,
  progress,
  current,
  total,
  message,
  isComplete = false,
  isError = false,
  onClose,
}: ProgressToastProps) {
  // Auto-dismiss on completion after 3 seconds
  useEffect(() => {
    if (isComplete && onClose) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [isComplete, onClose]);

  const operationIcons = {
    fetch: '🔄',
    pull: '⬇️',
    push: '⬆️',
  };

  const operationNames = {
    fetch: 'Fetching',
    pull: 'Pulling',
    push: 'Pushing',
  };

  return (
    <div 
      className={`fixed bottom-6 right-6 z-50 w-96 rounded-lg shadow-2xl border animate-slide-up ${
        isError 
          ? 'bg-red-950 border-red-800' 
          : isComplete
          ? 'bg-green-950 border-green-800'
          : 'bg-theme-surface border-theme-default'
      }`}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">
              {isError ? '⚠️' : isComplete ? '✅' : operationIcons[operation]}
            </span>
            <span className={`font-semibold ${
              isError ? 'text-red-200' : isComplete ? 'text-green-200' : 'text-theme-primary'
            }`}>
              {isError 
                ? `${operationNames[operation]} Failed` 
                : isComplete
                ? `${operationNames[operation]} Complete`
                : `${operationNames[operation]}...`
              }
            </span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-theme-tertiary hover:text-theme-secondary transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Progress Bar (only show if not complete and not error) */}
        {!isComplete && !isError && (
          <div className="mb-3">
            <div className="w-full h-2 bg-theme-bg rounded-full overflow-hidden">
              <div 
                className="h-full bg-graft-500 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-xs text-theme-tertiary">
              <span>{Math.round(progress)}%</span>
              {current !== undefined && total !== undefined && (
                <span>{current} / {total}</span>
              )}
            </div>
          </div>
        )}

        {/* Stage/Message */}
        <div className={`text-sm ${
          isError ? 'text-red-300' : isComplete ? 'text-green-300' : 'text-theme-tertiary'
        }`}>
          {message || stage}
        </div>
      </div>
    </div>
  );
}
