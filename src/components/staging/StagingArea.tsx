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
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: WorkingDirectoryFile;
  } | null>(null);
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

  // Close context menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setContextMenu(null);
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

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

  // Discard file changes
  const handleDiscardFile = async (filePath: string) => {
    try {
      await invoke('discard_file_changes', {
        path: repoPath,
        filePath: filePath,
      });
      await loadStatus(); // Refresh
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    }
  };

  // Context menu handlers
  const handleFileContextMenu = (file: WorkingDirectoryFile, x: number, y: number) => {
    setContextMenu({ x, y, file });
  };

  const handleFileContextAction = (action: 'stage' | 'unstage' | 'discard' | 'copyPath') => {
    if (!contextMenu) return;

    switch (action) {
      case 'stage':
        handleStageFiles([contextMenu.file.path]);
        break;
      case 'unstage':
        handleUnstageFiles([contextMenu.file.path]);
        break;
      case 'discard':
        const confirmed = confirm(
          `Discard changes to ${contextMenu.file.path}?\n\n` +
          `⚠️ This action cannot be undone. All changes will be lost.`
        );
        if (confirmed) {
          handleDiscardFile(contextMenu.file.path);
        }
        break;
      case 'copyPath':
        navigator.clipboard.writeText(contextMenu.file.path);
        break;
    }

    setContextMenu(null);
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
    <div className="flex flex-col h-full bg-theme-surface">
      {/* Header */}
      <div className="px-4 py-3 border-b border-theme-default">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-theme-primary uppercase tracking-wider">
            Staging Area
          </h3>
          <button
            onClick={loadStatus}
            disabled={loading}
            className="text-xs px-2 py-1 bg-theme-surface-hover hover:bg-theme-surface-hover active:bg-theme-surface-hover rounded transition-colors disabled:opacity-50"
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
        <div className="flex-1 flex flex-col min-h-0 border-b border-theme-default">
          <div className="px-4 py-2 bg-theme-surface border-b border-theme-default">
            <h4 className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
              Unstaged Changes ({status.unstaged.length})
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto">
            {status.unstaged.length === 0 ? (
              <div className="p-8 text-center text-theme-tertiary text-sm">
                No unstaged changes
              </div>
            ) : (
              <div className="divide-y divide-theme-default">
                {status.unstaged.map((file) => (
                  <FileListItem
                    key={file.path}
                    path={file.path}
                    status={file.status}
                    isStaged={false}
                    onClick={() => handleStageFiles([file.path])}
                    onContextMenu={(x, y) => handleFileContextMenu(file, x, y)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Staged Files */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="px-4 py-2 bg-theme-surface border-b border-theme-default">
            <h4 className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
              Staged Changes ({status.staged.length})
            </h4>
          </div>
          <div className="flex-1 overflow-y-auto">
            {status.staged.length === 0 ? (
              <div className="p-8 text-center text-theme-tertiary text-sm">
                No staged changes
              </div>
            ) : (
              <div className="divide-y divide-theme-default">
                {status.staged.map((file) => (
                  <FileListItem
                    key={file.path}
                    path={file.path}
                    status={file.status}
                    isStaged={true}
                    onClick={() => handleUnstageFiles([file.path])}
                    onContextMenu={(x, y) => handleFileContextMenu(file, x, y)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Commit Section */}
      <div className="border-t border-theme-default p-4 bg-theme-surface">
        <CommitMessageInput
          value={commitMessage}
          onChange={setCommitMessage}
          onSubmit={handleCommit}
          disabled={committing || status.staged.length === 0}
        />

        <button
          onClick={handleCommit}
          disabled={committing || status.staged.length === 0 || commitMessage.trim() === ''}
          className="w-full mt-3 px-4 py-2 bg-graft-600 hover:bg-graft-700 active:bg-graft-800 disabled:bg-theme-surface disabled:text-theme-tertiary rounded-lg font-medium text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-graft-500"
        >
          {committing ? 'Committing...' : `Commit ${status.staged.length} file${status.staged.length !== 1 ? 's' : ''}`}
        </button>
      </div>

      {/* Context Menu for Files */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-theme-surface border border-theme-default rounded-lg shadow-2xl py-1 min-w-[180px]"
          style={{
            left: contextMenu.x,
            top: contextMenu.y,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {!contextMenu.file.is_staged ? (
            <button
              onClick={() => handleFileContextAction('stage')}
              className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-theme-surface-hover transition-colors flex items-center gap-2"
            >
              <span>✅</span>
              <span>Stage File</span>
            </button>
          ) : (
            <button
              onClick={() => handleFileContextAction('unstage')}
              className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-theme-surface-hover transition-colors flex items-center gap-2"
            >
              <span>↩️</span>
              <span>Unstage File</span>
            </button>
          )}
          {!contextMenu.file.is_staged && contextMenu.file.status !== 'added' && (
            <button
              onClick={() => handleFileContextAction('discard')}
              className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-theme-surface-hover transition-colors flex items-center gap-2"
            >
              <span>🗑️</span>
              <span>Discard Changes</span>
            </button>
          )}
          <div className="h-px bg-theme-border my-1" />
          <button
            onClick={() => handleFileContextAction('copyPath')}
            className="w-full px-4 py-2 text-left text-sm text-theme-primary hover:bg-theme-surface-hover transition-colors flex items-center gap-2"
          >
            <span>📋</span>
            <span>Copy Path</span>
          </button>
        </div>
      )}
    </div>
  );
}
