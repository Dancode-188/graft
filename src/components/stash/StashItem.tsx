import { StashEntry } from './types';

interface StashItemProps {
  stash: StashEntry;
  onPreview: (stash: StashEntry) => void;
  onApply: (stashIndex: number, pop: boolean) => void;
  onDrop: (stashIndex: number) => void;
  onContextMenu?: (stash: StashEntry, x: number, y: number) => void;
}

// Format date to relative time
function getRelativeTime(timestamp: number): string {
  const now = Date.now() / 1000;
  const diff = now - timestamp;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  if (diff < 2592000) return `${Math.floor(diff / 604800)}w ago`;
  
  const date = new Date(timestamp * 1000);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function StashItem({ stash, onPreview, onApply, onDrop, onContextMenu }: StashItemProps) {
  // Extract the actual message (remove "WIP on branch:" prefix if present)
  const displayMessage = stash.message.startsWith('WIP on') 
    ? stash.message.split(':').slice(1).join(':').trim() || stash.message
    : stash.message;

  return (
    <div 
      className="bg-zinc-800/50 hover:bg-zinc-800 rounded border border-zinc-700 hover:border-zinc-600 transition-all p-3 group"
      onContextMenu={(e) => {
        e.preventDefault();
        if (onContextMenu) {
          onContextMenu(stash, e.clientX, e.clientY);
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-graft-400 font-semibold">
              stash@{'{' + stash.index + '}'}
            </span>
            <span className="text-xs text-zinc-500">•</span>
            <span className="text-xs text-zinc-400">
              {getRelativeTime(stash.timestamp)}
            </span>
          </div>
          <p className="text-sm text-zinc-200 line-clamp-2 mb-1">
            {displayMessage}
          </p>
        </div>
      </div>

      {/* Metadata */}
      <div className="flex items-center gap-3 text-xs text-zinc-500 mb-2">
        <div className="flex items-center gap-1">
          <span>🌿</span>
          <span className="font-mono">{stash.branch}</span>
        </div>
        <span>•</span>
        <div className="flex items-center gap-1">
          <span>📄</span>
          <span>{stash.file_count} file{stash.file_count !== 1 ? 's' : ''}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={() => onPreview(stash)}
          className="px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-zinc-200 rounded transition-colors"
          title="Preview stash contents"
        >
          👁️ Preview
        </button>
        <button
          onClick={() => onApply(stash.index, false)}
          className="px-2 py-1 text-xs bg-graft-500 hover:bg-graft-600 text-white rounded transition-colors"
          title="Apply stash (keeps in list)"
        >
          ✅ Apply
        </button>
        <button
          onClick={() => onApply(stash.index, true)}
          className="px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
          title="Apply and remove from list"
        >
          ⚡ Pop
        </button>
        <button
          onClick={() => onDrop(stash.index)}
          className="px-2 py-1 text-xs bg-red-900/50 hover:bg-red-900 text-red-300 rounded transition-colors ml-auto"
          title="Delete stash (cannot be undone)"
        >
          🗑️ Drop
        </button>
      </div>
    </div>
  );
}
