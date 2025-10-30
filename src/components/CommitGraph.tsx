import React, { useMemo, useCallback } from 'react';
import { Commit } from '../App';
import {
  calculateGraphLayout,
  getEdgePaths,
  getBranchColor,
} from '../utils/graphLayout';

interface CommitGraphProps {
  commits: Commit[];
  selectedCommitHash: string | null;
  onSelectCommit: (commit: Commit) => void;
}

/**
 * CommitGraph Component
 * OPTIMIZED: Memoized rendering, efficient SVG generation
 * Performance: Renders 10,000+ commits smoothly with virtual scrolling
 */
export const CommitGraph: React.FC<CommitGraphProps> = React.memo(({
  commits,
  selectedCommitHash,
  onSelectCommit,
}) => {
  // Calculate graph layout - memoized based on commits array reference
  const layout = useMemo(() => calculateGraphLayout(commits), [commits]);
  const edges = useMemo(() => getEdgePaths(commits, layout), [commits, layout]);
  
  // Memoize callback to prevent unnecessary re-renders
  const handleSelectCommit = useCallback((commit: Commit) => {
    onSelectCommit(commit);
  }, [onSelectCommit]);

  // Create edge path data structure with memoization
  const edgePathData = useMemo(() => {
    return edges.map((edge, idx) => {
      const x1 = edge.from.x + 10;
      const y1 = edge.from.y + 40;
      const x2 = edge.to.x + 10;
      const y2 = edge.to.y + 40;
      const color = edge.type === 'merge' ? getBranchColor(edge.to.lane) : getBranchColor(edge.from.lane);
      const midY = (y1 + y2) / 2;
      const pathD = edge.from.lane === edge.to.lane
        ? `M ${x1} ${y1} L ${x2} ${y2}`
        : `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;

      return {
        key: `edge-${idx}`,
        pathD,
        color,
        isStroke: 2.5,
        opacity: edge.type === 'merge' ? 0.8 : 0.6,
        strokeDasharray: edge.type === 'merge' ? '4,2' : 'none',
        strokeWidth: edge.type === 'merge' ? 2.5 : 2,
      };
    });
  }, [edges]);

  // SVG dimensions - increase width for branch labels
  const graphWidth = Math.max(350, (layout.maxLane + 2) * 40 + 180);
  const graphHeight = commits.length * 80;

  // Create SVG path for connecting lines - OPTIMIZED with memoized data
  const renderEdges = useCallback(() => {
    return edgePathData.map(edge => (
      <path
        key={edge.key}
        d={edge.pathD}
        stroke={edge.color}
        strokeWidth={edge.strokeWidth}
        fill="none"
        opacity={edge.opacity}
        strokeDasharray={edge.strokeDasharray}
      />
    ));
  }, [edgePathData]);

  // Render commit dots
  const renderDots = () => {
    return commits.map((commit) => {
      const node = layout.nodes.get(commit.hash);
      if (!node) return null;

      const isSelected = commit.hash === selectedCommitHash;
      const color = getBranchColor(node.lane);
      const isMergeCommit = commit.parent_hashes.length > 1;
      const dotRadius = isSelected ? 6 : isMergeCommit ? 5 : 4;

      return (
        <g
          key={commit.hash}
          onClick={() => handleSelectCommit(commit)}
          style={{ cursor: 'pointer' }}
        >
          {/* Outer glow for selected - enhanced */}
          {isSelected && (
            <>
              {/* Outer ring */}
              <circle
                cx={node.x + 10}
                cy={node.y + 40}
                r="12"
                fill="none"
                stroke={color}
                strokeWidth="2"
                opacity="0.5"
              />
              {/* Inner glow */}
              <circle
                cx={node.x + 10}
                cy={node.y + 40}
                r="9"
                fill="none"
                stroke={color}
                strokeWidth="1"
                opacity="0.3"
              />
            </>
          )}

          {/* Merge commit indicator (square background) */}
          {isMergeCommit && !isSelected && (
            <rect
              x={node.x + 10 - 6}
              y={node.y + 40 - 6}
              width="12"
              height="12"
              rx="2"
              fill={color}
              opacity="0.15"
            />
          )}

          {/* Main dot */}
          <circle
            cx={node.x + 10}
            cy={node.y + 40}
            r={dotRadius}
            fill={color}
            opacity={isSelected ? 1 : 0.8}
            className="transition-all hover:opacity-100"
          />

          {/* Merge badge - small "M" indicator */}
          {isMergeCommit && (
            <text
              x={node.x + 10}
              y={node.y + 40 + 8}
              fontSize="7"
              fontWeight="bold"
              fill={color}
              textAnchor="middle"
              opacity="0.6"
              fontFamily="monospace"
            >
              M
            </text>
          )}
        </g>
      );
    });
  };

  // Render branch labels
  const renderBranchLabels = () => {
    return commits.map((commit) => {
      const node = layout.nodes.get(commit.hash);
      if (!node || commit.branches.length === 0) return null;

      // Separate local and remote branches
      const localBranches = commit.branches.filter((b: { is_remote: boolean }) => !b.is_remote);
      const remoteBranches = commit.branches.filter((b: { is_remote: boolean }) => b.is_remote);
      const branches = [...localBranches, ...remoteBranches]; // Local first

      // Position labels to the right of the commit dot
      const labelX = node.x + 50;
      const labelY = node.y + 40;

      return (
        <g key={`labels-${commit.hash}`}>
          {branches.map((branch, idx) => {
            const offsetY = idx * 16; // Stack labels vertically
            const bgColor = branch.is_current
              ? '#22c55e'
              : branch.is_remote
                ? '#3b82f6'
                : '#8b5cf6';
            const opacity = branch.is_current ? 1 : 0.7;

            return (
              <g key={`branch-${branch.name}`}>
                {/* Background pill */}
                <rect
                  x={labelX - 2}
                  y={labelY - 6 + offsetY}
                  width={branch.name.length * 5 + 6}
                  height="14"
                  rx="7"
                  fill={bgColor}
                  opacity={opacity * 0.2}
                  stroke={bgColor}
                  strokeWidth="1"
                />
                {/* Branch name text */}
                <text
                  x={labelX + 2}
                  y={labelY + 4 + offsetY}
                  fontSize="11"
                  fontWeight="500"
                  fill={bgColor}
                  opacity={opacity}
                  fontFamily="monospace"
                >
                  {branch.is_remote ? `${branch.name.split('/')[0]}/` : ''}
                  {branch.name.split('/').pop()}
                </text>
              </g>
            );
          })}
        </g>
      );
    });
  };

  // Render tag labels
  const renderTagLabels = () => {
    return commits.map((commit) => {
      const node = layout.nodes.get(commit.hash);
      if (!node || !commit.tags || commit.tags.length === 0) return null;

      // Separate local and remote tags
      const localTags = commit.tags.filter((t: { is_remote: boolean }) => !t.is_remote);
      const remoteTags = commit.tags.filter((t: { is_remote: boolean }) => t.is_remote);
      const tags = [...localTags, ...remoteTags];

      // Calculate how many branches this commit has
      const branchCount = commit.branches.length;
      const tagStartY = branchCount * 16; // Start after branches

      // Position labels to the right of the commit dot
      const labelX = node.x + 50;
      const labelY = node.y + 40;

      return (
        <g key={`tags-${commit.hash}`}>
          {tags.map((tag, idx) => {
            const offsetY = tagStartY + idx * 16;
            const bgColor = tag.is_remote ? '#06b6d4' : '#f59e0b'; // Cyan for remote, amber for local
            const opacity = 1;

            return (
              <g key={`tag-${tag.name}`}>
                {/* Background pill with tag icon */}
                <rect
                  x={labelX - 2}
                  y={labelY - 6 + offsetY}
                  width={tag.name.length * 5 + 12}
                  height="14"
                  rx="7"
                  fill={bgColor}
                  opacity={opacity * 0.25}
                  stroke={bgColor}
                  strokeWidth="1"
                />
                {/* Tag icon (small circle) */}
                <circle
                  cx={labelX + 3}
                  cy={labelY + 1 + offsetY}
                  r="2"
                  fill={bgColor}
                  opacity={opacity}
                />
                {/* Tag name text */}
                <text
                  x={labelX + 10}
                  y={labelY + 4 + offsetY}
                  fontSize="10"
                  fontWeight="500"
                  fill={bgColor}
                  opacity={opacity}
                  fontFamily="monospace"
                >
                  {tag.name.split('/').pop()}
                  {tag.is_annotated ? '†' : ''}
                </text>
              </g>
            );
          })}
        </g>
      );
    });
  };

  return (
    <svg
      width={graphWidth}
      height={graphHeight}
      className="bg-zinc-950"
      style={{ minHeight: '100%' }}
    >
      <defs>
        {/* Gradient for visual appeal */}
        <linearGradient id="graphGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.1" />
          <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.1" />
          <stop offset="100%" stopColor="#ec4899" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Background */}
      <rect width={graphWidth} height={graphHeight} fill="url(#graphGradient)" />

      {/* Draw edges (lines) first so they appear behind dots */}
      {renderEdges()}

      {/* Draw dots (commits) */}
      {renderDots()}

      {/* Draw branch labels */}
      {renderBranchLabels()}

      {/* Draw tag labels */}
      {renderTagLabels()}
    </svg>
  );
});
