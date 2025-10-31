import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { StashEntry } from './types';
import { StashList } from './StashList';
import { StashCreateModal } from './StashCreateModal';
import { StashPreviewModal } from './StashPreviewModal';

interface StashPanelProps {
  repoPath: string;
  onRefresh?: () => void;
}

export function StashPanel({ repoPath, onRefresh }: StashPanelProps) {
  const [stashes, setStashes] = useState<StashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [previewStash, setPreviewStash] = useState<StashEntry | null>(null);

  // Load stashes
  const loadStashes = async () => {
    if (!repoPath) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const stashList = await invoke<StashEntry[]>('list_stashes', { path: repoPath });
      setStashes(stashList);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStashes();
  }, [repoPath]);

  const handleCreateStash = () => {
    setShowCreateModal(true);
  };

  const handleStashCreated = async () => {
    setShowCreateModal(false);
    await loadStashes();
    onRefresh?.();
  };

  const handlePreview = (stash: StashEntry) => {
    setPreviewStash(stash);
  };

  const handleApply = async (stashIndex: number, pop: boolean) => {
    try {
      if (pop) {
        await invoke('pop_stash', {
          path: repoPath,
          stashIndex,
          reinstateIndex: true,
        });
      } else {
        await invoke('apply_stash', {
          path: repoPath,
          stashIndex,
          reinstateIndex: true,
        });
      }
      
      await loadStashes();
      onRefresh?.();
      setPreviewStash(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const handleDrop = async (stashIndex: number) => {
    const confirmed = confirm(
      `Are you sure you want to delete stash@{${stashIndex}}?\n\n` +
      `⚠️ This action cannot be undone. The stashed changes will be lost forever.`
    );

    if (!confirmed) return;

    try {
      await invoke('drop_stash', {
        path: repoPath,
        stashIndex,
      });
      
      await loadStashes();
      setPreviewStash(null);
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-zinc-800 p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-semibold text-zinc-200 uppercase tracking-wider">
            Stashes
          </h2>
          <button
            onClick={handleCreateStash}
            className="px-2 py-1 text-xs bg-graft-500 hover:bg-graft-600 text-white rounded transition-colors"
            title="Create new stash"
          >
            💾 New Stash
          </button>
        </div>
        {stashes.length > 0 && (
          <p className="text-xs text-zinc-500">
            {stashes.length} stash{stashes.length !== 1 ? 'es' : ''}
          </p>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-32 text-zinc-500 text-sm">
            Loading stashes...
          </div>
        ) : error ? (
          <div className="p-4 text-sm text-red-400">
            <p className="font-semibold mb-1">Error loading stashes</p>
            <p className="text-xs">{error}</p>
          </div>
        ) : stashes.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center">
            <div className="text-4xl mb-3 opacity-50">💾</div>
            <p className="text-sm text-zinc-400 mb-2">No stashes yet</p>
            <p className="text-xs text-zinc-600 mb-4 max-w-xs">
              Stashes let you save your work-in-progress without committing. 
              Perfect for switching branches or pulling updates.
            </p>
            <button
              onClick={handleCreateStash}
              className="px-3 py-1.5 text-xs bg-graft-500 hover:bg-graft-600 text-white rounded transition-colors"
            >
              Create Your First Stash
            </button>
          </div>
        ) : (
          <StashList
            stashes={stashes}
            onPreview={handlePreview}
            onApply={handleApply}
            onDrop={handleDrop}
          />
        )}
      </div>

      {/* Modals */}
      {showCreateModal && (
        <StashCreateModal
          repoPath={repoPath}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleStashCreated}
        />
      )}

      {previewStash && (
        <StashPreviewModal
          repoPath={repoPath}
          stash={previewStash}
          onClose={() => setPreviewStash(null)}
          onApply={(pop) => handleApply(previewStash.index, pop)}
          onDrop={() => handleDrop(previewStash.index)}
        />
      )}
    </div>
  );
}
