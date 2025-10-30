// Shared types for Interactive Rebase components

export interface RebaseCommit {
  hash: string;
  short_hash: string;
  message: string;
  author: string;
  timestamp: number;
  action: RebaseAction;
}

export type RebaseAction = "pick" | "squash" | "fixup" | "drop" | "reword" | "edit";

export interface RebaseInstruction {
  hash: string;
  action: RebaseAction;
  new_message?: string; // Used for "reword" action
}

export interface RebasePlan {
  total_commits: number;
  actions_summary: Record<string, number>;
  warnings: string[];
  can_proceed: boolean;
}

export interface RebaseResult {
  success: boolean;
  current_commit_index: number;
  total_commits: number;
  conflicts: ConflictFile[];
  message: string;
  rebase_state: "completed" | "in_progress" | "stopped_for_edit" | "conflict";
}

export interface RebaseStatus {
  is_in_progress: boolean;
  current_commit_index: number;
  total_commits: number;
  has_conflicts: boolean;
  conflicts: ConflictFile[];
  onto_commit: string;
  original_head: string;
}

export interface ConflictFile {
  path: string;
  conflict_type: string;
}

export interface ValidationResult {
  is_valid: boolean;
  errors: string[];
  warnings: string[];
}

// Action metadata for UI display
export interface ActionMetadata {
  label: string;
  description: string;
  color: string;
  icon: string;
}

export const ACTION_METADATA: Record<RebaseAction, ActionMetadata> = {
  pick: {
    label: "Pick",
    description: "Include commit as-is",
    color: "text-zinc-400",
    icon: "✓",
  },
  squash: {
    label: "Squash",
    description: "Combine with previous, keep both messages",
    color: "text-purple-400",
    icon: "⬆",
  },
  fixup: {
    label: "Fixup",
    description: "Combine with previous, discard message",
    color: "text-blue-400",
    icon: "⚡",
  },
  reword: {
    label: "Reword",
    description: "Change commit message",
    color: "text-yellow-400",
    icon: "✏",
  },
  edit: {
    label: "Edit",
    description: "Pause to edit commit",
    color: "text-orange-400",
    icon: "✎",
  },
  drop: {
    label: "Drop",
    description: "Remove commit entirely",
    color: "text-red-400",
    icon: "✕",
  },
};
