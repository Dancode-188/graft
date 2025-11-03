interface ConflictNotificationProps {
  conflicts: Array<{ path: string; conflict_type: string }>;
  onDismiss: () => void;
}

export function ConflictNotification({
  conflicts,
  onDismiss,
}: ConflictNotificationProps) {
  const handleOpenInEditor = () => {
    // This could be enhanced to actually open VS Code or another editor
    // For now, we'll just dismiss
    alert('Feature coming soon! Please open your editor manually to resolve conflicts.');
    onDismiss();
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[420px] bg-red-950 border border-red-800 rounded-lg shadow-2xl animate-slide-up">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            <span className="font-semibold text-red-200">
              Merge Conflicts Detected
            </span>
          </div>
          <button
            onClick={onDismiss}
            className="text-red-400 hover:text-red-300 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Conflict List */}
        <div className="mb-4">
          <p className="text-sm text-red-300 mb-2">
            {conflicts.length} file{conflicts.length === 1 ? '' : 's'} {conflicts.length === 1 ? 'has' : 'have'} conflicts:
          </p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {conflicts.map((conflict, index) => (
              <div
                key={index}
                className="text-xs font-mono bg-red-900/30 px-2 py-1 rounded flex items-start gap-2"
              >
                <span className="text-red-400">•</span>
                <span className="text-red-200 flex-1">{conflict.path}</span>
                <span className="text-red-400/60 text-[10px]">
                  ({conflict.conflict_type})
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Message */}
        <p className="text-sm text-red-300 mb-4">
          Please resolve conflicts using your text editor or merge tool before continuing.
        </p>

        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenInEditor}
            className="flex-1 px-3 py-2 text-sm bg-red-800 hover:bg-red-700 rounded-lg font-medium transition-colors"
          >
            Open in Editor
          </button>
          <button
            onClick={onDismiss}
            className="px-3 py-2 text-sm bg-theme-bg hover:bg-theme-surface-hover rounded-lg font-medium transition-colors"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
