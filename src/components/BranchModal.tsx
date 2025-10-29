import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';

interface BranchModalProps {
  isOpen: boolean;
  onClose: () => void;
  repoPath: string;
  mode: 'create' | 'rename' | 'delete';
  currentBranch?: string;
  onSuccess: () => void;
}

export function BranchModal({ 
  isOpen, 
  onClose, 
  repoPath, 
  mode,
  currentBranch,
  onSuccess 
}: BranchModalProps) {
  const [branchName, setBranchName] = useState('');
  const [startPoint, setStartPoint] = useState('HEAD');
  const [checkoutAfterCreate, setCheckoutAfterCreate] = useState(true);
  const [forceDelete, setForceDelete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setBranchName(mode === 'rename' && currentBranch ? currentBranch : '');
      setStartPoint('HEAD');
      setCheckoutAfterCreate(true);
      setForceDelete(false);
      setError(null);
    }
  }, [isOpen, mode, currentBranch]);

  // Handle close with escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Validate branch name
  const validateBranchName = (name: string): string | null => {
    if (!name.trim()) {
      return 'Branch name cannot be empty';
    }
    if (name.includes('..') || name.startsWith('/') || name.endsWith('/')) {
      return 'Invalid branch name';
    }
    if (name.includes(' ')) {
      return 'Branch name cannot contain spaces';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate branch name
    const validationError = validateBranchName(branchName);
    if (validationError && mode !== 'delete') {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (mode === 'create') {
        await invoke('create_branch', {
          path: repoPath,
          branchName,
          startPoint: startPoint === 'HEAD' ? null : startPoint,
          checkout: checkoutAfterCreate,
        });
      } else if (mode === 'rename') {
        await invoke('rename_branch', {
          path: repoPath,
          oldName: currentBranch,
          newName: branchName,
        });
      } else if (mode === 'delete') {
        await invoke('delete_branch', {
          path: repoPath,
          branchName: currentBranch,
          force: forceDelete,
        });
      }

      // Success - close modal and notify parent
      onSuccess();
      onClose();
    } catch (err) {
      setError(err as string);
      console.error(`Failed to ${mode} branch:`, err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl w-full max-w-md mx-4">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800">
          <h2 className="text-lg font-semibold text-zinc-100">
            {mode === 'create' && '🌿 Create New Branch'}
            {mode === 'rename' && '✏️ Rename Branch'}
            {mode === 'delete' && '🗑️ Delete Branch'}
          </h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 space-y-4">
            {mode === 'create' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Branch Name
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="e.g., feature/new-feature"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-graft-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Start Point
                  </label>
                  <input
                    type="text"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    placeholder="HEAD"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-graft-500 focus:border-transparent"
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Branch name or commit hash to start from (default: HEAD)
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="checkout"
                    checked={checkoutAfterCreate}
                    onChange={(e) => setCheckoutAfterCreate(e.target.checked)}
                    className="w-4 h-4 text-graft-500 bg-zinc-800 border-zinc-700 rounded focus:ring-graft-500"
                  />
                  <label htmlFor="checkout" className="ml-2 text-sm text-zinc-300">
                    Switch to new branch after creation
                  </label>
                </div>
              </>
            )}

            {mode === 'rename' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Current Name
                  </label>
                  <input
                    type="text"
                    value={currentBranch || ''}
                    disabled
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-500 cursor-not-allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    New Name
                  </label>
                  <input
                    type="text"
                    value={branchName}
                    onChange={(e) => setBranchName(e.target.value)}
                    placeholder="Enter new branch name"
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-graft-500 focus:border-transparent"
                    autoFocus
                  />
                </div>
              </>
            )}

            {mode === 'delete' && (
              <>
                <div className="p-4 bg-red-900/20 border border-red-800 rounded">
                  <p className="text-sm text-red-400">
                    Are you sure you want to delete branch <strong>"{currentBranch}"</strong>?
                  </p>
                  <p className="mt-2 text-xs text-red-500">
                    This action cannot be undone.
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="force"
                    checked={forceDelete}
                    onChange={(e) => setForceDelete(e.target.checked)}
                    className="w-4 h-4 text-red-500 bg-zinc-800 border-zinc-700 rounded focus:ring-red-500"
                  />
                  <label htmlFor="force" className="ml-2 text-sm text-zinc-300">
                    Force delete (even if not merged)
                  </label>
                </div>
              </>
            )}

            {/* Error Display */}
            {error && (
              <div className="p-3 bg-red-900/20 border border-red-800 rounded text-sm text-red-400">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                mode === 'delete'
                  ? 'bg-red-600 hover:bg-red-500 active:bg-red-700 text-white'
                  : 'bg-graft-600 hover:bg-graft-500 active:bg-graft-700 text-white'
              }`}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⟳</span>
                  {mode === 'create' && 'Creating...'}
                  {mode === 'rename' && 'Renaming...'}
                  {mode === 'delete' && 'Deleting...'}
                </span>
              ) : (
                <>
                  {mode === 'create' && 'Create Branch'}
                  {mode === 'rename' && 'Rename Branch'}
                  {mode === 'delete' && 'Delete Branch'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
