import { StashEntry } from './types';
import { StashItem } from './StashItem';

interface StashListProps {
  stashes: StashEntry[];
  onPreview: (stash: StashEntry) => void;
  onApply: (stashIndex: number, pop: boolean) => void;
  onDrop: (stashIndex: number) => void;
  onContextMenu?: (stash: StashEntry, x: number, y: number) => void;
}

export function StashList({ stashes, onPreview, onApply, onDrop, onContextMenu }: StashListProps) {
  return (
    <div className="space-y-1 p-2">
      {stashes.map((stash) => (
        <StashItem
          key={stash.oid}
          stash={stash}
          onPreview={onPreview}
          onApply={onApply}
          onDrop={onDrop}
          onContextMenu={onContextMenu}
        />
      ))}
    </div>
  );
}
