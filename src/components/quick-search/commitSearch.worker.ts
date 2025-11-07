import Fuse from 'fuse.js';

// This worker receives { commits, query } and returns filtered results
self.onmessage = function (e) {
  const { commits, query } = e.data;
  if (!query || !commits) {
    postMessage([]);
    return;
  }
  const fuse = new Fuse(commits, {
    keys: ['message', 'author_name', 'short_hash'],
    threshold: 0.4,
    ignoreLocation: true,
    minMatchCharLength: 2,
  });
  const results = fuse.search(query).map(res => res.item);
  postMessage(results);
};
