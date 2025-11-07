// Run with: node scripts/graphLayout-benchmark.js
const { performance } = require('perf_hooks');
const { calculateGraphLayout } = require('../src/utils/graphLayout');

const commits = [];
for (let i = 0; i < 10000; i++) {
  commits.push({
    hash: `h${i}`,
    short_hash: `h${i}`,
    message: `Commit ${i}`,
    author_name: 'Test',
    author_email: 'test@example.com',
    timestamp: 1700000000 + i,
    parent_hashes: i === 0 ? [] : [`h${i-1}`],
    branches: [],
    tags: [],
  });
}

const start = performance.now();
const layout = calculateGraphLayout(commits);
const end = performance.now();
console.log(`Time taken: ${(end - start).toFixed(2)} ms`);
console.log(`Nodes: ${layout.nodes.size}`);
