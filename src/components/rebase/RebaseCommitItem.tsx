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
    console.log(`✅ DRAGSTART on commit ${index}`, { hash: commit.short_hash });
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
    // Hide the default drag ghost
    const img = new Image();
    img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    e.dataTransfer.setDragImage(img, 0, 0);
    onDragStart(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    console.log(`🔥 DRAGOVER on commit ${index}`, { target: e.currentTarget });
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    onDragOver(index);
  };

  const handleDragEnter = (e: React.DragEvent) => {
    console.log(`👋 DRAGENTER on commit ${index}`);
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    console.log(`🎯 DROP on commit ${index}`);
    e.preventDefault();
    e.stopPropagation();
    onDrop(index);
  };

  return (
    <>
      {/* Drop Zone Indicator */}
      {isDropTarget && (
        <div className="h-1 bg-graft-500 rounded-full mx-2 transition-all duration-200" />
      )}

      {/* Commit Row */}
      <div
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDrop={handleDrop}
        style={{ userSelect: 'none' }}
        className={`
          group relative flex items-center gap-3 px-3 py-2.5
          bg-theme-bg hover:bg-theme-surface-hover 
          border border-theme-default rounded-lg
          transition-all duration-200 select-none
          ${isDragging ? "opacity-40 scale-95 pointer-events-none" : "opacity-100 scale-100"}
          ${isDropTarget ? "ring-2 ring-graft-500" : ""}
        `}
      >
        {/* Drag Handle */}
        <div 
          draggable={true}
          onDragStart={handleDragStart}
          onDragEnd={onDragEnd}
          onDragOver={(e) => { 
            console.log('⚠️ DragOver hit the handle, stopping propagation');
            e.stopPropagation(); 
            e.preventDefault();
          }}
          onDrop={(e) => { 
            console.log('⚠️ Drop hit the handle, stopping propagation');
            e.stopPropagation(); 
            e.preventDefault();
          }}
          className="flex-shrink-0 text-theme-tertiary group-hover:text-theme-secondary transition-colors cursor-grab active:cursor-grabbing select-none"
          style={{ userSelect: 'none', WebkitUserSelect: 'none', pointerEvents: 'auto' }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            style={{ pointerEvents: 'none' }}
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
            bg-theme-surface border border-theme-default
            ${actionMeta.color}
            hover:border-theme-default focus:outline-none focus:ring-2 focus:ring-graft-500
            transition-all cursor-pointer
          `}
          style={{ pointerEvents: 'auto' }}
        >
          {(Object.keys(ACTION_METADATA) as RebaseAction[]).map((action) => (
            <option key={action} value={action}>
              {ACTION_METADATA[action].label}
            </option>
          ))}
        </select>

        {/* Commit Info */}
        <div className="flex-1 min-w-0" style={{ pointerEvents: 'none' }}>
          <div className="flex items-baseline gap-2">
            <span className="font-mono text-xs text-theme-tertiary">
              {commit.short_hash}
            </span>
            <span className="text-sm text-theme-primary truncate">
              {commit.message}
            </span>
          </div>
          <div className="text-xs text-theme-tertiary mt-0.5">
            {commit.author}
          </div>
        </div>

        {/* Action Icon/Indicator */}
        <div
          className={`flex-shrink-0 text-lg ${actionMeta.color}`}
          title={actionMeta.description}
          style={{ pointerEvents: 'none' }}
        >
          {actionMeta.icon}
        </div>
      </div>
    </>
  );
}
