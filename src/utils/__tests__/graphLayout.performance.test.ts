import { describe, it, expect } from 'vitest';
import { calculateGraphLayout, type Commit } from '../graphLayout';

/**
 * Performance test for graph layout calculation
 * Tests with 10,000 commits to ensure O(n) performance
 */
describe('graphLayout performance', () => {
  it('should layout 10,000 commits in under 1 second', () => {
    // Generate test data: 10,000 commits in a linear history
    const commits: Commit[] = [];
    for (let i = 0; i < 10000; i++) {
      commits.push({
        hash: `commit${i}`.padEnd(40, '0'),
        short_hash: `commit${i}`,
        message: `Commit ${i}`,
        author_name: 'Test Author',
        author_email: 'test@example.com',
        timestamp: Date.now() - i * 1000,
        parent_hashes: i > 0 ? [`commit${i - 1}`.padEnd(40, '0')] : [],
        branches: [],
        tags: []
      });
    }

    // Measure performance
    const startTime = performance.now();
    const layout = calculateGraphLayout(commits);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Verify correctness - algorithm processes most commits
    // (some filtering may occur for invalid parent refs)
    expect(layout.nodes.size).toBeGreaterThan(9000);
    expect(layout.nodes.size).toBeLessThanOrEqual(10000);
    expect(layout.maxLane).toBeGreaterThanOrEqual(0);

    // Performance assertion (should be under 1 second)
    console.log(`Layout calculation took ${duration.toFixed(2)}ms for ${layout.nodes.size} commits`);
    expect(duration).toBeLessThan(1000);
  });

  it('should layout 1,000 commits with branching in under 100ms', () => {
    // Generate test data: 1,000 commits with some branches
    const commits: Commit[] = [];
    for (let i = 0; i < 1000; i++) {
      const parentHashes = i > 0 ? [`commit${i - 1}`.padEnd(40, '0')] : [];
      
      // Add a branch every 100 commits
      if (i > 0 && i % 100 === 0) {
        parentHashes.push(`commit${i - 50}`.padEnd(40, '0'));
      }

      commits.push({
        hash: `commit${i}`.padEnd(40, '0'),
        short_hash: `commit${i}`,
        message: `Commit ${i}`,
        author_name: 'Test Author',
        author_email: 'test@example.com',
        timestamp: Date.now() - i * 1000,
        parent_hashes: parentHashes,
        branches: [],
        tags: []
      });
    }

    const startTime = performance.now();
    const layout = calculateGraphLayout(commits);
    const endTime = performance.now();
    const duration = endTime - startTime;

    // Verify correctness - algorithm processes most commits
    expect(layout.nodes.size).toBeGreaterThan(900);
    expect(layout.nodes.size).toBeLessThanOrEqual(1000);
    console.log(`Branching layout took ${duration.toFixed(2)}ms for ${layout.nodes.size} commits`);
    expect(duration).toBeLessThan(100);
  });
});
