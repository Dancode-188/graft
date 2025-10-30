import { RebaseCommit, RebaseAction, ACTION_METADATA } from "./types";

interface RebaseCommitItemProps {
  commit: RebaseCommit;
  index: number;
  onActionChange: (index: number, action: RebaseAction) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDragEnd: () => void;
  onDrop: (index: number) => void;
  isDragging: boolean;
  dragOverIndex: number | null;
}

export function RebaseCommitItem({
  commit,
  index,
  onActionChange,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDrop,
  isDragging,
  dragOverIndex,
}: RebaseCommitItemProps) {
  const actionMeta = ACTION_METADATA[commit.action];
  const isDropTarget = dragOverIndex === index;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    onDragStart(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    e.dataTransfer.dropEffect = "move";
    onDragOver(index);
    return false;
  };

  const handleDragEnter = (e: React.DragEvent) => {
    if (e.preventDefault) {
      e.preventDefault();
    }
    return false;
  };

  const handleDrop = (e: React.DragEvent) => {
    if (e.stopPropagation) {
      e.stopPropagation();
    }
    if (e.preventDefault) {
      e.preventDefault();
    }
    onDrop(index);
    return false;
  };

  return (
    <>
      {/* Drop Zone Indicator */}
      {isDropTarget && (
        <div className="h-1 bg-graft-green rounded-full mx-2 transition-all duration-200" />
      )}

      {/* Commit Row */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDrop={handleDrop}
        style={{ userSelect: 'none' }}
        className={`
          group relative flex items-center gap-3 px-3 py-2.5
          bg-zinc-800/50 hover:bg-zinc-800 
          border border-zinc-700 rounded-lg
          transition-all duration-200 select-none
          ${isDragging ? "opacity-40 scale-95 pointer-events-none" : "opacity-100 scale-100"}
          ${isDropTarget ? "ring-2 ring-graft-green" : ""}
        `}
      >
        {/* Drag Handle */}
        <div 
          draggable={true}
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
          className="flex-shrink-0 text-zinc-500 group-hover:text-zinc-300 transition-colors cursor-grab active:cursor-grabbing select-none"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="6" x2="12" y2="6" />
            <line x1="4" y1="10" x2="12" y2="10" />
          </svg>
        </div>

        {/* Action Dropdown */}
        <select
          value={commit.action}
          onChange={(e) => onActionChange(index, e.target.value as RebaseAction)}
          onMouseDown={(e) => e.stopPropagation()}
          className={`
            flex-shrink-0 px-2 py-1 text-xs font-medium rounded
            bg-zinc-900 border border-zinc-700
            ${actionMeta.color}
            hover:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-graft-green
            transition-all cursor-pointer
          `}
        >
          {(Object.keys(ACTION_METADATA) as RebaseAction[]).map((action) => (
            <option key={action} value={action}>
              {ACTION_METADATA[action].label}
            </option>
          ))}
        </select>

        {/* Commit Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs text-zinc-500">
              {commit.short_hash}
            </span>
            <span className="text-sm text-zinc-200 truncate">
              {commit.message}
            </span>
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            {commit.author}
          </div>
        </div>

        {/* Action Icon/Indicator */}
        <div
          className={`flex-shrink-0 text-lg ${actionMeta.color}`}
          title={actionMeta.description}
        >
          {actionMeta.icon}
        </div>
      </div>
    </>
  );
}
