import React, { useMemo } from 'react';
import { Commit } from '../App';
import {
  calculateGraphLayout,
  getEdgePaths,
  getBranchColor,
  GraphLayout,
} from '../utils/graphLayout';

interface CommitGraphProps {
  commits: Commit[];
  selectedCommitHash: string | null;
  onSelectCommit: (commit: Commit) => void;
}

export const CommitGraph: React.FC<CommitGraphProps> = ({
  commits,
  selectedCommitHash,
  onSelectCommit,
}) => {
  // Calculate graph layout
  const layout = useMemo(() => calculateGraphLayout(commits), [commits]);
  const edges = useMemo(() => getEdgePaths(commits, layout), [commits, layout]);

  // SVG dimensions - increase width for branch labels
  const graphWidth = Math.max(350, (layout.maxLane + 2) * 40 + 180);
  const graphHeight = commits.length * 80;

  // Create SVG path for connecting lines
  const renderEdges = () => {
    return edges.map((edge, idx) => {
      const x1 = edge.from.x + 10; // Center of dot
      const y1 = edge.from.y + 40; // Below dot
      const x2 = edge.to.x + 10; // Center of dot
      const y2 = edge.to.y + 40; // Below dot

      const color =
        edge.type === 'merge'
          ? getBranchColor(edge.to.lane)
          : getBranchColor(edge.from.lane);

      // Calculate path: vertical down, horizontal across, vertical down
      const midY = (y1 + y2) / 2;

      const pathD =
        edge.from.lane === edge.to.lane
          ? // Straight vertical line
            `M ${x1} ${y1} L ${x2} ${y2}`
          : // Curved line (merge)
            `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;

      return (
        <path
          key={`edge-${idx}`}
          d={pathD}
          stroke={color}
          strokeWidth={edge.type === 'merge' ? '2.5' : '2'}
          fill="none"
          opacity={edge.type === 'merge' ? 0.8 : 0.6}
          strokeDasharray={edge.type === 'merge' ? '4,2' : 'none'}
        />
      );
    });
  };

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
          onClick={() => onSelectCommit(commit)}
          style={{ cursor: 'pointer' }}
        >
          {/* Outer glow for selected */}
          {isSelected && (
            <circle
              cx={node.x + 10}
              cy={node.y + 40}
              r="9"
              fill="none"
              stroke={color}
              strokeWidth="1"
              opacity="0.3"
            />
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
      const localBranches = commit.branches.filter(b => !b.is_remote);
      const remoteBranches = commit.branches.filter(b => b.is_remote);
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
    </svg>
  );
};
