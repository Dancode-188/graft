interface FileListItemProps {
  path: string;
  status: string; // "modified", "added", "deleted", "renamed", "conflicted"
  isStaged: boolean;
  onClick: () => void;
  onContextMenu?: (x: number, y: number) => void;
}

// Get icon and color for file status
function getStatusIcon(status: string): { icon: string; color: string; label: string } {
  const statusMap = {
    modified: { icon: 'M', color: 'text-git-modified bg-git-modified/10 border-git-modified/30', label: 'Modified' },
    added: { icon: 'A', color: 'text-git-added bg-git-added/10 border-git-added/30', label: 'Added' },
    deleted: { icon: 'D', color: 'text-git-deleted bg-git-deleted/10 border-git-deleted/30', label: 'Deleted' },
    renamed: { icon: 'R', color: 'text-git-renamed bg-git-renamed/10 border-git-renamed/30', label: 'Renamed' },
    conflicted: { icon: 'C', color: 'text-git-conflict bg-git-conflict/10 border-git-conflict/30', label: 'Conflicted' },
  };
  return statusMap[status as keyof typeof statusMap] || { 
    icon: '?', 
    color: 'text-theme-tertiary bg-theme-surface border-theme-border', 
    label: 'Unknown' 
  };
}

export function FileListItem({ path, status, isStaged, onClick, onContextMenu }: FileListItemProps) {
  const statusInfo = getStatusIcon(status);

  return (
    <button
      onClick={onClick}
      onContextMenu={(e) => {
        e.preventDefault();
        if (onContextMenu) {
          onContextMenu(e.clientX, e.clientY);
        }
      }}
      className="w-full px-3 py-2 text-left hover:bg-theme-surface-hover active:bg-theme-surface-hover transition-colors group"
    >
      <div className="flex items-center gap-2">
        {/* Status Badge */}
        <span 
          className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold border ${statusInfo.color}`}
        >
          {statusInfo.icon}
        </span>

        {/* File Path */}
        <span className="text-sm text-theme-primary font-mono truncate flex-1">
          {path}
        </span>

        {/* Action Hint */}
        <span className="text-xs text-theme-tertiary group-hover:text-theme-secondary transition-colors">
          {isStaged ? '←' : '→'}
        </span>
      </div>
    </button>
  );
}
