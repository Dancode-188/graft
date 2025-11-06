// Fetch all repositories for a specific GitHub user (up to 100)
export async function fetchUserRepos(username: string) {
  const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=100`);
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  return await response.json(); // Array of repositories
}
// Fetch all public repositories (first page, max 100)
export async function fetchAllPublicRepos() {
  const response = await fetch('https://api.github.com/repositories?per_page=100');
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  return await response.json(); // Array of repositories
}

// Search GitHub repositories by keyword using the public GitHub API
export async function searchGithubRepos(query: string) {
  const response = await fetch(`https://api.github.com/search/repositories?q=${encodeURIComponent(query)}&per_page=100`);
  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }
  const data = await response.json();
  return data.items; // Array of repositories
}
