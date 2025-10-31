import { StashEntry } from './types';
import { StashItem } from './StashItem';

interface StashListProps {
  stashes: StashEntry[];
  onPreview: (stash: StashEntry) => void;
  onApply: (stashIndex: number, pop: boolean) => void;
  onDrop: (stashIndex: number) => void;
}

export function StashList({ stashes, onPreview, onApply, onDrop }: StashListProps) {
  return (
    <div className="space-y-1 p-2">
      {stashes.map((stash) => (
        <StashItem
          key={stash.oid}
          stash={stash}
          onPreview={onPreview}
          onApply={onApply}
          onDrop={onDrop}
        />
      ))}
    </div>
  );
}
