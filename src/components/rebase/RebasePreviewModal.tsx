import { RebasePlan } from "./types";

interface RebasePreviewModalProps {
  plan: RebasePlan;
  onBack: () => void;
  onConfirm: () => void;
}

export function RebasePreviewModal({
  plan,
  onBack,
  onConfirm,
}: RebasePreviewModalProps) {
  const picks = plan.actions_summary["pick"] || 0;
  const squashes = plan.actions_summary["squash"] || 0;
  const fixups = plan.actions_summary["fixup"] || 0;
  const rewords = plan.actions_summary["reword"] || 0;
  const drops = plan.actions_summary["drop"] || 0;

  const resultingCommits = plan.total_commits - drops - (squashes + fixups);

  return (
    <div className="fixed inset-0 bg-theme-overlay flex items-center justify-center z-50 p-4">
      <div className="bg-theme-surface rounded-lg shadow-2xl w-full max-w-2xl">
        {/* Header */}
        <div className="p-6 border-b border-theme-default">
          <h2 className="text-xl font-semibold text-theme-primary">
            📋 Rebase Preview
          </h2>
          <p className="text-sm text-theme-tertiary mt-1">
            Review changes before executing
          </p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div>
            <h3 className="text-sm font-semibold text-theme-secondary mb-3">
              This rebase will:
            </h3>
            <div className="space-y-2 text-sm">
              {picks > 0 && (
                <div className="flex items-center gap-2 text-theme-secondary">
                  <span className="text-theme-tertiary">✓</span>
                  Keep {picks} commit{picks !== 1 ? "s" : ""} as-is (pick)
                </div>
              )}
              {squashes > 0 && (
                <div className="flex items-center gap-2 text-purple-300">
                  <span className="text-purple-400">⬆</span>
                  Squash {squashes} commit{squashes !== 1 ? "s" : ""} into{" "}
                  {squashes === 1 ? "its" : "their"} parent
                </div>
              )}
              {fixups > 0 && (
                <div className="flex items-center gap-2 text-blue-300">
                  <span className="text-blue-400">⚡</span>
                  Fixup {fixups} commit{fixups !== 1 ? "s" : ""} (discard{" "}
                  {fixups === 1 ? "message" : "messages"})
                </div>
              )}
              {rewords > 0 && (
                <div className="flex items-center gap-2 text-yellow-300">
                  <span className="text-yellow-400">✏</span>
                  Reword {rewords} commit message{rewords !== 1 ? "s" : ""}
                </div>
              )}
              {drops > 0 && (
                <div className="flex items-center gap-2 text-red-300">
                  <span className="text-red-400">✕</span>
                  Drop {drops} commit{drops !== 1 ? "s" : ""}
                </div>
              )}
            </div>
          </div>

          {/* Result */}
          <div className="p-4 bg-theme-bg rounded-lg border border-theme-default">
            <p className="text-sm text-theme-secondary">
              <strong>Result:</strong> {plan.total_commits} commits →{" "}
              {resultingCommits} commits
            </p>
          </div>

          {/* Warnings */}
          {plan.warnings.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-yellow-400 mb-2">
                ⚠️ Important Notes:
              </h4>
              <ul className="text-xs text-yellow-200 space-y-1">
                {plan.warnings.map((warning, i) => (
                  <li key={i}>• {warning}</li>
                ))}
              </ul>
            </div>
          )}

          {/* History Warning */}
          <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-300">
              ⚠️ <strong>Warning:</strong> This will rewrite Git history!
            </p>
            <p className="text-xs text-red-400 mt-1">
              Don't rebase commits that have been pushed to a shared repository.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-theme-default bg-theme-surface">
          <button
            onClick={onBack}
            className="px-4 py-2 text-sm font-medium text-theme-tertiary hover:text-theme-primary hover:bg-theme-surface-hover rounded-lg transition-all"
          >
            Back to Edit
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-2 text-sm font-semibold bg-graft-500 text-zinc-900 rounded-lg hover:bg-graft-400 shadow-lg shadow-graft-500/20 transition-all"
          >
            Start Rebase
          </button>
        </div>
      </div>
    </div>
  );
}
