import { useState, useEffect, useRef } from 'react';
import { Commit } from '../App';
import { CommitGraph } from './CommitGraph';

interface CommitListWithGraphProps {
  commits: Commit[];
  selectedCommit: Commit | null;
  onSelectCommit: (commit: Commit) => void;
  onCommitContextMenu?: (commit: Commit, x: number, y: number) => void;
}

export const CommitListWithGraph: React.FC<CommitListWithGraphProps> = ({
  commits,
  selectedCommit,
  onSelectCommit,
  onCommitContextMenu,
}) => {
  const graphScrollRef = useRef<HTMLDivElement>(null);
  const listScrollRef = useRef<HTMLDivElement>(null);
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });

  const itemHeight = 104;

  // Auto-scroll to selected commit when it changes
  useEffect(() => {
    if (!selectedCommit || !listScrollRef.current || !graphScrollRef.current) return;

    // Find the index of the selected commit
    const selectedIndex = commits.findIndex(c => c.hash === selectedCommit.hash);
    if (selectedIndex === -1) return;

    // Calculate the scroll position to center the selected commit
    const containerHeight = listScrollRef.current.clientHeight;
    const targetScrollTop = selectedIndex * itemHeight - (containerHeight / 2) + (itemHeight / 2);
    const clampedScrollTop = Math.max(0, Math.min(targetScrollTop, commits.length * itemHeight - containerHeight));

    // Smooth scroll both containers
    listScrollRef.current.scrollTo({
      top: clampedScrollTop,
      behavior: 'smooth'
    });
    graphScrollRef.current.scrollTo({
      top: clampedScrollTop,
      behavior: 'smooth'
    });
  }, [selectedCommit, commits]);

  // Handle scroll sync between graph and list
  useEffect(() => {
    const graphContainer = graphScrollRef.current;
    const listContainer = listScrollRef.current;

    if (!graphContainer || !listContainer) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement;
      const scrollTop = target.scrollTop;

      // Sync other container
      if (target === graphContainer) {
        listContainer.scrollTop = scrollTop;
      } else {
        graphContainer.scrollTop = scrollTop;
      }

      // Update visible range for virtualization
      const containerHeight = listContainer.clientHeight;
      const start = Math.floor(scrollTop / itemHeight);
      const end = Math.ceil((scrollTop + containerHeight) / itemHeight);

      setVisibleRange({
        start: Math.max(0, start - 5),
        end: Math.min(commits.length, end + 5),
      });
    };

    graphContainer.addEventListener('scroll', handleScroll);
    listContainer.addEventListener('scroll', handleScroll);

    return () => {
      graphContainer.removeEventListener('scroll', handleScroll);
      listContainer.removeEventListener('scroll', handleScroll);
    };
  }, [commits.length]);

  // Calculate offsets for virtualization
  const offsetY = visibleRange.start * itemHeight;
  const visibleCommits = commits.slice(visibleRange.start, visibleRange.end);

  const getTimeAgo = (timestamp: number): string => {
    const date = new Date(timestamp * 1000);
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    const intervals: Record<string, number> = {
      year: 31536000,
      month: 2592000,
      week: 604800,
      day: 86400,
      hour: 3600,
      minute: 60,
    };

    for (const [unit, secondsInUnit] of Object.entries(intervals)) {
      const interval = Math.floor(seconds / secondsInUnit);
      if (interval >= 1) {
        return `${interval} ${unit}${interval === 1 ? '' : 's'} ago`;
      }
    }

    return 'just now';
  };

  return (
    <div className="flex flex-1 overflow-hidden gap-0 bg-zinc-950 w-full h-full">
      {/* Graph - Scrollable SVG */}
      <div
        ref={graphScrollRef}
        className="overflow-y-auto overflow-x-auto border-r border-zinc-800 bg-zinc-950"
        style={{ flex: '0 0 300px', height: '100%', minHeight: 0 }}
      >
        <CommitGraph
          commits={commits}
          selectedCommitHash={selectedCommit?.hash ?? null}
          onSelectCommit={onSelectCommit}
        />
      </div>

      {/* Commit List - Virtualized */}
      <div
        ref={listScrollRef}
        className="flex-1 overflow-auto"
        style={{ height: '100%', minHeight: 0 }}
      >
        <div className="space-y-2 px-6 py-4">
          {/* Invisible spacer for items above visible range */}
          <div style={{ height: `${offsetY}px` }} />

          {/* Visible items */}
          {visibleCommits.map((commit) => {
            const timeAgo = getTimeAgo(commit.timestamp);
            const commitMessage = commit.message.split('\n')[0];
            const isSelected = selectedCommit?.hash === commit.hash;

            return (
              <div
                key={commit.hash}
                onClick={() => onSelectCommit(commit)}
                onContextMenu={(e) => {
                  e.preventDefault();
                  if (onCommitContextMenu) {
                    onCommitContextMenu(commit, e.clientX, e.clientY);
                  }
                }}
                className={`bg-zinc-900 border rounded-lg p-4 transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'border-graft-500 bg-zinc-800 ring-2 ring-graft-500/50 shadow-lg shadow-graft-500/20'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-8 flex items-center justify-center">
                    <div
                      className={`w-3 h-3 rounded-full transition-all ${
                        isSelected ? 'bg-graft-400 scale-125' : 'bg-graft-500'
                      }`}
                    ></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-3 mb-1">
                      <p className="text-sm font-medium text-zinc-100 truncate">
                        {commitMessage}
                      </p>
                      <span className="flex-shrink-0 text-xs text-zinc-500 font-mono">
                        {commit.short_hash}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-zinc-500">
                      <span>{commit.author_name}</span>
                      <span>•</span>
                      <span>{timeAgo}</span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Invisible spacer for items below visible range */}
          <div
            style={{
              height: `${Math.max(0, (commits.length - visibleRange.end) * itemHeight)}px`,
            }}
          />
        </div>
      </div>
    </div>
  );
};
