interface FileListItemProps {
  path: string;
  status: string; // "modified", "added", "deleted", "renamed", "conflicted"
  isStaged: boolean;
  onClick: () => void;
}

// Get icon and color for file status
function getStatusIcon(status: string): { icon: string; color: string; label: string } {
  const statusMap = {
    modified: { icon: 'M', color: 'text-blue-400 bg-blue-950 border-blue-700', label: 'Modified' },
    added: { icon: 'A', color: 'text-green-400 bg-green-950 border-green-700', label: 'Added' },
    deleted: { icon: 'D', color: 'text-red-400 bg-red-950 border-red-700', label: 'Deleted' },
    renamed: { icon: 'R', color: 'text-yellow-400 bg-yellow-950 border-yellow-700', label: 'Renamed' },
    conflicted: { icon: 'C', color: 'text-orange-400 bg-orange-950 border-orange-700', label: 'Conflicted' },
  };
  return statusMap[status as keyof typeof statusMap] || { 
    icon: '?', 
    color: 'text-gray-400 bg-gray-950 border-gray-700', 
    label: 'Unknown' 
  };
}

export function FileListItem({ path, status, isStaged, onClick }: FileListItemProps) {
  const statusInfo = getStatusIcon(status);

  return (
    <button
      onClick={onClick}
      className="w-full px-3 py-2 text-left hover:bg-zinc-800 active:bg-zinc-700 transition-colors group"
    >
      <div className="flex items-center gap-2">
        {/* Status Badge */}
        <span 
          className={`flex-shrink-0 w-5 h-5 rounded flex items-center justify-center text-xs font-bold border ${statusInfo.color}`}
        >
          {statusInfo.icon}
        </span>

        {/* File Path */}
        <span className="text-sm text-zinc-300 font-mono truncate flex-1">
          {path}
        </span>

        {/* Action Hint */}
        <span className="text-xs text-zinc-600 group-hover:text-zinc-400 transition-colors">
          {isStaged ? '←' : '→'}
        </span>
      </div>
    </button>
  );
}
