// Phase 8: Stash Management - TypeScript Types

export interface StashEntry {
  index: number;          // Stash index (0 = most recent)
  message: string;        // Stash message
  branch: string;         // Branch where stash was created
  timestamp: number;      // Unix timestamp
  oid: string;            // Git OID
  file_count: number;     // Number of files changed
}

export interface StashCreateOptions {
  message?: string;
  include_untracked: boolean;
  keep_index: boolean;
}

export interface FileChange {
  path: string;
  status: string;
  insertions: number;
  deletions: number;
}
