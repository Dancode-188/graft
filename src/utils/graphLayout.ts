/**
 * Git Graph Layout Algorithm
 * Calculates positions for commits and determines branch lanes
 */

export interface Commit {
  hash: string;
  short_hash: string;
  message: string;
  author_name: string;
  author_email: string;
  timestamp: number;
  parent_hashes: string[];
}

export interface GraphNode {
  commitHash: string;
  lane: number;
  x: number;
  y: number;
  parents: string[];
}

export interface GraphLayout {
  nodes: Map<string, GraphNode>;
  maxLane: number;
}

/**
 * Calculate graph layout for commits
 * Assigns lane numbers to prevent overlapping
 */
export function calculateGraphLayout(commits: Commit[]): GraphLayout {
  const nodes = new Map<string, GraphNode>();
  const laneMap = new Map<string, number>(); // Track which lane each commit is on
  let maxLane = 0;

  // Build a map of commit hash to index for quick lookup
  const commitMap = new Map<string, number>();
  commits.forEach((commit, index) => {
    commitMap.set(commit.hash, index);
  });

  // Process commits in order
  commits.forEach((commit, index) => {
    const y = index * 80; // Vertical spacing between commits

    // Determine lane for this commit
    let lane = 0;

    if (commit.parent_hashes.length === 0) {
      // Initial commit - start at lane 0
      lane = 0;
    } else if (commit.parent_hashes.length === 1) {
      // Regular commit - continue on parent's lane
      const parentHash = commit.parent_hashes[0];
      lane = laneMap.get(parentHash) ?? 0;
    } else {
      // Merge commit - use parent lane, but could be different
      const parentHash = commit.parent_hashes[0];
      lane = laneMap.get(parentHash) ?? 0;
    }

    // Find an available lane (avoid conflicts with nearby commits)
    const usedLanes = new Set<number>();
    
    // Check nearby commits for lane conflicts
    for (let i = Math.max(0, index - 5); i < Math.min(commits.length, index + 5); i++) {
      const nearbyCommit = commits[i];
      const nearbyLane = laneMap.get(nearbyCommit.hash);
      if (nearbyLane !== undefined) {
        usedLanes.add(nearbyLane);
      }
    }

    // Find next available lane
    while (usedLanes.has(lane)) {
      lane++;
    }

    // Update tracking
    laneMap.set(commit.hash, lane);
    maxLane = Math.max(maxLane, lane);

    // Create graph node
    const x = lane * 40; // Horizontal spacing between lanes
    nodes.set(commit.hash, {
      commitHash: commit.hash,
      lane,
      x,
      y,
      parents: commit.parent_hashes,
    });
  });

  return {
    nodes,
    maxLane,
  };
}

/**
 * Get edge paths for drawing lines between commits
 */
export function getEdgePaths(
  commits: Commit[],
  layout: GraphLayout
): Array<{
  from: GraphNode;
  to: GraphNode;
  type: 'parent' | 'merge';
}> {
  const edges: Array<{
    from: GraphNode;
    to: GraphNode;
    type: 'parent' | 'merge';
  }> = [];

  const commitMap = new Map<string, Commit>();
  commits.forEach((commit) => {
    commitMap.set(commit.hash, commit);
  });

  commits.forEach((commit) => {
    const currentNode = layout.nodes.get(commit.hash);
    if (!currentNode) return;

    commit.parent_hashes.forEach((parentHash, index) => {
      const parentNode = layout.nodes.get(parentHash);
      if (!parentNode) return;

      // First parent is a regular parent, others are merge parents
      const isMerge = index > 0;
      edges.push({
        from: currentNode,
        to: parentNode,
        type: isMerge ? 'merge' : 'parent',
      });
    });
  });

  return edges;
}

/**
 * Assign colors to branches
 * Deterministic coloring based on lane
 */
const BRANCH_COLORS = [
  '#22c55e', // Green (graft primary)
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#f59e0b', // Amber
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
];

export function getBranchColor(lane: number): string {
  return BRANCH_COLORS[lane % BRANCH_COLORS.length];
}
