import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { FileListItem } from './FileListItem';
import { CommitMessageInput } from './CommitMessageInput';

interface WorkingDirectoryFile {
  path: string;
  status: string;
  is_staged: boolean;
}

interface WorkingDirectoryStatus {
  staged: WorkingDirectoryFile[];
  unstaged: WorkingDirectoryFile[];
}

interface StagingAreaProps {
  repoPath: string;
  onCommitCreated: () => void; // Callback to refresh commit history
}

export function StagingArea({ repoPath, onCommitCreated }: StagingAreaProps) {
  const [status, setStatus] = useState<WorkingDirectoryStatus>({ staged: [], unstaged: [] });
  const [commitMessage, setCommitMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [committing, setCommitting] = useState(false);
  // Load working directory status
  const loadStatus = async () => {
    setLoading(true);
    setError(null);
    try {
      const newStatus = await invoke<WorkingDirectoryStatus>('get_working_directory_status', {
        path: repoPath,
      });
      setStatus(newStatus);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  // Load status on mount and when repoPath changes
  useEffect(() => {
    loadStatus();
  }, [repoPath]);

  // Stage files
  const handleStageFiles = async (paths: string[]) => {
    try {
      await invoke('stage_files', {
        path: repoPath,
        filePaths: paths,
      });
      await loadStatus(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };
  // Unstage files
  const handleUnstageFiles = async (paths: string[]) => {
    try {
      await invoke('unstage_files', {
        path: repoPath,
        filePaths: paths,
      });
      await loadStatus(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // Create commit
  const handleCommit = async () => {
    if (commitMessage.trim() === '') {
      setError('Commit message cannot be empty');
      return;
    }

    if (status.staged.length === 0) {
      setError('No files staged for commit');
      return;
    }

    setCommitting(true);
    setError(null);

    try {
      await invoke('create_commit', {
        path: repoPath,
        message: commitMessage,
      });

      // Success! Clear message and refresh
      setCommitMessage('');
      await loadStatus();
      onCommitCreated(); // Notify parent to refresh commit history
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setCommitting(false);
    }
  };
  return (
    <div className="flex flex-col h-full bg-zinc-900">
      {/* Header */}
      <div className="px-4 py-3 border-b border-zinc-800">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">
            Staging Area
          </h3>
          <button
            onClick={loadStatus}
            disabled={loading}
            className="text-xs px-2 py-1 bg-zinc-800 hover:bg-zinc-700 active:bg-zinc-600 rounded transition-colors disabled:opacity-50"
          >
            {loading ? '↻' : '↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="mx-4 mt-3 p-3 bg-red-950 border border-red-800 rounded text-red-200 text-xs">
          {error}
        </div>
      )}

      {/* Split Pane: Unstaged | Staged */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {/* Unstaged Files */}
        <div className="flex-1 flex flex-col min-h-0 border-b border-zinc-800">
          <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Unstaged Changes ({status.unstaged.length})
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto">
            {status.unstaged.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-sm">
                No unstaged changes
              </div>
            ) : (
              <div className="divide-y divide-zinc-900">
                {status.unstaged.map((file) => (
                  <FileListItem
                    key={file.path}
                    path={file.path}
                    status={file.status}
                    isStaged={false}
                    onClick={() => handleStageFiles([file.path])}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Staged Files */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800">
            <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Staged Changes ({status.staged.length})
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto">
            {status.staged.length === 0 ? (
              <div className="p-8 text-center text-zinc-600 text-sm">
                No staged changes
              </div>
            ) : (
              <div className="divide-y divide-zinc-900">
                {status.staged.map((file) => (
                  <FileListItem
                    key={file.path}
                    path={file.path}
                    status={file.status}
                    isStaged={true}
                    onClick={() => handleUnstageFiles([file.path])}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Commit Section */}
      <div className="border-t border-zinc-800 p-4 bg-zinc-900">
        <CommitMessageInput
          value={commitMessage}
          onChange={setCommitMessage}
          onSubmit={handleCommit}
          disabled={committing || status.staged.length === 0}
        />

        <button
          onClick={handleCommit}
          disabled={committing || status.staged.length === 0 || commitMessage.trim() === ''}
          className="w-full mt-3 px-4 py-2 bg-graft-600 hover:bg-graft-700 active:bg-graft-800 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-graft-500"
        >
          {committing ? 'Committing...' : `Commit ${status.staged.length} file${status.staged.length !== 1 ? 's' : ''}`}
        </button>
      </div>
    </div>
  );
}
