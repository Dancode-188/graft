import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { RebaseCommitItem } from "./RebaseCommitItem";
import { RebasePreviewModal } from "./RebasePreviewModal";
import {
  RebaseCommit,
  RebaseAction,
  RebaseInstruction,
  ValidationResult,
  RebasePlan,
} from "./types";

interface InteractiveRebaseModalProps {
  repoPath: string;
  baseCommit: string; // Commit hash to rebase onto
  onClose: () => void;
  onStartRebase: (instructions: RebaseInstruction[]) => void;
}

export function InteractiveRebaseModal({
  repoPath,
  baseCommit,
  onClose,
  onStartRebase,
}: InteractiveRebaseModalProps) {
  const [commits, setCommits] = useState<RebaseCommit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Load commits on mount
  useEffect(() => {
    loadCommits();
  }, [repoPath, baseCommit]);

  // Validate whenever commits change
  useEffect(() => {
    if (commits.length > 0) {
      validateInstructions();
    }
  }, [commits]);

  const loadCommits = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await invoke<RebaseCommit[]>("get_rebase_commits", {
        path: repoPath,
        baseCommit: baseCommit,
      });
      setCommits(result);
    } catch (err) {
      setError(err as string);
    } finally {
      setLoading(false);
    }
  };

  const validateInstructions = async () => {
    const instructions: RebaseInstruction[] = commits.map((c) => ({
      hash: c.hash,
      action: c.action,
    }));

    try {
      const result = await invoke<ValidationResult>("validate_rebase_order", {
        path: repoPath,
        instructions,
      });
      setValidation(result);
    } catch (err) {
      console.error("Validation error:", err);
    }
  };

  const handleActionChange = (index: number, action: RebaseAction) => {
    setCommits((prev) =>
      prev.map((c, i) => (i === index ? { ...c, action } : c))
    );
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (index: number) => {
    setDragOverIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleDrop = (targetIndex: number) => {
    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    setCommits((prev) => {
      const newCommits = [...prev];
      const [draggedCommit] = newCommits.splice(draggedIndex, 1);
      newCommits.splice(targetIndex, 0, draggedCommit);
      return newCommits;
    });

    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  const handleStartRebase = () => {
    const instructions: RebaseInstruction[] = commits.map((c) => ({
      hash: c.hash,
      action: c.action,
    }));
    onStartRebase(instructions);
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  const generateRebasePlan = (): RebasePlan => {
    const actionsSummary: Record<string, number> = {
      pick: 0,
      squash: 0,
      fixup: 0,
      reword: 0,
      drop: 0,
      edit: 0,
    };

    commits.forEach((commit) => {
      actionsSummary[commit.action] = (actionsSummary[commit.action] || 0) + 1;
    });

    return {
      total_commits: commits.length,
      actions_summary: actionsSummary,
      warnings: validation?.warnings || [],
      can_proceed: validation?.is_valid ?? false,
    };
  };

  const canProceed = validation?.is_valid ?? false;

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-zinc-900 rounded-lg p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-graft-green mx-auto mb-4"></div>
          <p className="text-zinc-400">Loading commits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
        <div className="bg-zinc-900 rounded-lg p-8 max-w-md">
          <h3 className="text-lg font-semibold text-red-400 mb-4">Error</h3>
          <p className="text-zinc-300 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-xl font-semibold text-zinc-100">
              Interactive Rebase
            </h2>
            <p className="text-sm text-zinc-400 mt-1">
              Rebasing onto{" "}
              <span className="font-mono text-graft-green">
                {baseCommit.substring(0, 7)}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Instructions */}
        <div className="px-6 py-4 bg-zinc-800/50 border-b border-zinc-800">
          <p className="text-sm text-zinc-300">
            📝 Edit commits below, then click <strong>Start Rebase</strong>
          </p>
          <p className="text-xs text-zinc-500 mt-1">
            💡 Drag to reorder • Select action for each commit
          </p>
        </div>

        {/* Commits List */}
        <div 
          className="flex-1 overflow-y-auto p-6 space-y-2"
          onDragOver={(e) => { 
            console.log('🌊 DRAGOVER on parent container');
            e.preventDefault();
            e.dataTransfer.dropEffect = "move";
          }}
        >
          {commits.map((commit, index) => (
            <RebaseCommitItem
              key={commit.hash}
              commit={commit}
              index={index}
              onActionChange={handleActionChange}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              isDragging={draggedIndex === index}
              dragOverIndex={dragOverIndex}
            />
          ))}
        </div>

        {/* Validation Messages */}
        {validation && (
          <div className="px-6 py-4 border-t border-zinc-800 space-y-3">
            {/* Errors */}
            {validation.errors.length > 0 && (
              <div className="bg-red-900/20 border border-red-800 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-red-400 mb-2">
                  ⚠️ Errors:
                </h4>
                <ul className="text-xs text-red-300 space-y-1">
                  {validation.errors.map((err, i) => (
                    <li key={i}>• {err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings */}
            {validation.warnings.length > 0 && (
              <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-3">
                <h4 className="text-sm font-semibold text-yellow-400 mb-2">
                  💡 Warnings:
                </h4>
                <ul className="text-xs text-yellow-300 space-y-1">
                  {validation.warnings.map((warn, i) => (
                    <li key={i}>• {warn}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 p-6 border-t border-zinc-800 bg-zinc-900">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 rounded-lg transition-all"
          >
            Cancel
          </button>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePreview}
              disabled={!canProceed}
              className={`
                px-5 py-2 text-sm font-medium rounded-lg transition-all
                ${
                  canProceed
                    ? "bg-graft-500/10 text-graft-500 border border-graft-500/30 hover:bg-graft-500/20 hover:border-graft-500/50"
                    : "bg-zinc-800 text-zinc-500 border border-zinc-700 cursor-not-allowed"
                }
              `}
            >
              Preview
            </button>
            
            <button
              onClick={handleStartRebase}
              disabled={!canProceed}
              className={`
                px-6 py-2 text-sm font-semibold rounded-lg transition-all
                ${
                  canProceed
                    ? "bg-graft-500 text-zinc-900 hover:bg-graft-400 shadow-lg shadow-graft-500/20"
                    : "bg-zinc-800 text-zinc-400 border-2 border-zinc-700 cursor-not-allowed"
                }
              `}
            >
              Start Rebase
            </button>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <RebasePreviewModal
          plan={generateRebasePlan()}
          onBack={() => setShowPreview(false)}
          onConfirm={() => {
            setShowPreview(false);
            handleStartRebase();
          }}
        />
      )}
    </div>
  );
}
