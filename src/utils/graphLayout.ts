/**
 * Git Graph Layout Algorithm
 * Calculates positions for commits and determines branch lanes
 */

export interface BranchRef {
  name: string;
  is_remote: boolean;
  is_current: boolean;
}

export interface TagRef {
  name: string;
  is_annotated: boolean;
  is_remote: boolean;
}

export interface Commit {
  hash: string;
  short_hash: string;
  message: string;
  author_name: string;
  author_email: string;
  timestamp: number;
  parent_hashes: string[];
  branches: BranchRef[];
  tags: TagRef[];
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
 * IMPROVED: Better handling of branch divergence and lane persistence
 */
export function calculateGraphLayout(commits: Commit[]): GraphLayout {
  const nodes = new Map<string, GraphNode>();
  const laneMap = new Map<string, number>(); // Track which lane each commit is on
  let maxLane = 0;

  // Build maps for efficient lookups
  const commitMap = new Map<string, number>();
  const childrenMap = new Map<string, string[]>(); // parent hash -> child hashes
  
  commits.forEach((commit, index) => {
    commitMap.set(commit.hash, index);
    
    // Build parent-to-children relationships
    commit.parent_hashes.forEach(parentHash => {
      if (!childrenMap.has(parentHash)) {
        childrenMap.set(parentHash, []);
      }
      childrenMap.get(parentHash)!.push(commit.hash);
    });
  });

  // Track which lanes are in use at each commit index
  const activeLanes = new Map<number, Set<number>>(); // index -> set of active lanes
  
  // Two-pass algorithm:
  // Pass 1: Identify branch points and assign lanes to branches
  // We process FORWARD (newest to oldest) and assign lanes when we see divergence
  
  for (let index = 0; index < commits.length; index++) {
    const commit = commits[index];
    
    // If this commit already has a lane assigned, skip
    if (laneMap.has(commit.hash)) {
      continue;
    }
    
    // Check if this commit is the first child of its parent
    if (commit.parent_hashes.length > 0) {
      const parentHash = commit.parent_hashes[0];
      const siblings = childrenMap.get(parentHash) || [];
      const isFirstChild = siblings[0] === commit.hash;
      
      if (isFirstChild) {
        // First child: check if parent has a lane, otherwise start at 0
        const parentLane = laneMap.get(parentHash);
        if (parentLane !== undefined) {
          laneMap.set(commit.hash, parentLane);
        } else {
          // Parent not assigned yet, assign based on available lanes
          const availableLanes = activeLanes.get(index) || new Set();
          const lane = findAvailableLane(availableLanes);
          laneMap.set(commit.hash, lane);
          laneMap.set(parentHash, lane); // Also assign to parent
          maxLane = Math.max(maxLane, lane);
        }
      } else {
        // NOT first child - this is a branch! Get new lane
        const availableLanes = activeLanes.get(index) || new Set();
        const lane = findAvailableLane(availableLanes);
        laneMap.set(commit.hash, lane);
        maxLane = Math.max(maxLane, lane);
      }
    } else {
      // Root commit - assign lane 0
      laneMap.set(commit.hash, 0);
    }
    
    // Mark this lane as active for subsequent commits
    const currentLane = laneMap.get(commit.hash) || 0;
    for (let i = index; i < commits.length; i++) {
      if (!activeLanes.has(i)) {
        activeLanes.set(i, new Set());
      }
      activeLanes.get(i)!.add(currentLane);
      
      // Stop if we reach a merge point for this lane
      const futureCommit = commits[i];
      if (futureCommit.parent_hashes.length > 1 && 
          futureCommit.parent_hashes.includes(commit.hash)) {
        break;
      }
    }
  }
  
  // Ensure all commits have lanes (fill in any gaps)
  commits.forEach((commit) => {
    if (!laneMap.has(commit.hash)) {
      laneMap.set(commit.hash, 0);
    }
  });
  
  // Second pass: Create graph nodes with assigned lanes
  commits.forEach((commit, index) => {
    const y = index * 80; // Vertical spacing between commits
    const lane = laneMap.get(commit.hash) || 0;
    const x = lane * 40; // Horizontal spacing between lanes

    // Create graph node
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
 * Find the first available lane (not in use)
 */
function findAvailableLane(usedLanes: Set<number>): number {
  let lane = 0;
  while (usedLanes.has(lane)) {
    lane++;
  }
  return lane;
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
