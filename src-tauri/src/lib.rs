use git2::{Repository, Sort};
use serde::Serialize;
use std::path::Path;

#[derive(Debug, Serialize)]
struct RepoInfo {
    name: String,
    path: String,
    current_branch: String,
    is_bare: bool,
}

#[derive(Debug, Serialize)]
struct Commit {
    hash: String,
    short_hash: String,
    message: String,
    author_name: String,
    author_email: String,
    timestamp: i64,
    parent_hashes: Vec<String>,
}

#[derive(Debug, Serialize)]
struct FileChange {
    path: String,
    status: String, // "added", "modified", "deleted", "renamed"
    insertions: u32,
    deletions: u32,
}

#[tauri::command]
fn open_repository(path: String) -> Result<RepoInfo, String> {
    // Validate path exists
    let repo_path = Path::new(&path);
    if !repo_path.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    // Open the repository
    let repo = Repository::open(&path).map_err(|e| {
        match e.code() {
            git2::ErrorCode::NotFound => {
                format!("Not a Git repository: {}\n\nMake sure you've selected a folder that contains a .git directory.", path)
            }
            git2::ErrorCode::BareRepo => {
                format!("This is a bare repository: {}\n\nBare repositories don't have a working directory.", path)
            }
            _ => format!("Failed to open repository: {}", e),
        }
    })?;

    // Get repository name from path
    let name = repo_path
        .file_name()
        .and_then(|n| n.to_str())
        .unwrap_or("unknown")
        .to_string();

    // Get current branch
    let current_branch = match repo.head() {
        Ok(head) => {
            if head.is_branch() {
                head.shorthand().unwrap_or("unknown").to_string()
            } else {
                // Detached HEAD state
                let oid = head.target().unwrap_or_else(|| git2::Oid::zero());
                format!("HEAD (detached at {})", &oid.to_string()[..7])
            }
        }
        Err(e) => {
            // Handle unborn HEAD (new repo with no commits)
            if e.code() == git2::ErrorCode::UnbornBranch {
                "main (no commits yet)".to_string()
            } else {
                return Err(format!("Failed to get branch information: {}", e));
            }
        }
    };

    // Check if bare repository
    let is_bare = repo.is_bare();

    Ok(RepoInfo {
        name,
        path: path.clone(),
        current_branch,
        is_bare,
    })
}

#[tauri::command]
fn get_commits(path: String, limit: Option<usize>) -> Result<Vec<Commit>, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Get the HEAD reference
    let head = repo.head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;

    // Get the commit that HEAD points to
    let head_commit = head.peel_to_commit()
        .map_err(|e| format!("Failed to get HEAD commit: {}", e))?;

    // Create a revwalk (commit iterator)
    let mut revwalk = repo.revwalk()
        .map_err(|e| format!("Failed to create revwalk: {}", e))?;

    // Sort commits by time (newest first)
    revwalk.set_sorting(Sort::TIME)
        .map_err(|e| format!("Failed to set sorting: {}", e))?;

    // Start from HEAD
    revwalk.push(head_commit.id())
        .map_err(|e| format!("Failed to push HEAD: {}", e))?;

    // Collect commits
    let mut commits = Vec::new();
    let max_commits = limit.unwrap_or(100); // Default to 100 commits

    for (index, oid_result) in revwalk.enumerate() {
        if index >= max_commits {
            break;
        }

        let oid = oid_result.map_err(|e| format!("Failed to get commit OID: {}", e))?;
        let commit = repo.find_commit(oid)
            .map_err(|e| format!("Failed to find commit: {}", e))?;

        // Get commit message
        let message = commit.message()
            .unwrap_or("(no message)")
            .trim()
            .to_string();

        // Get author info
        let author = commit.author();
        let author_name = author.name().unwrap_or("Unknown").to_string();
        let author_email = author.email().unwrap_or("").to_string();
        let timestamp = author.when().seconds();

        // Get parent hashes
        let parent_hashes: Vec<String> = commit.parents()
            .map(|p| p.id().to_string())
            .collect();

        commits.push(Commit {
            hash: oid.to_string(),
            short_hash: oid.to_string()[..7].to_string(),
            message,
            author_name,
            author_email,
            timestamp,
            parent_hashes,
        });
    }

    Ok(commits)
}

#[tauri::command]
fn get_commit_files(path: String, commit_hash: String) -> Result<Vec<FileChange>, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Parse the commit hash
    let oid = git2::Oid::from_str(&commit_hash)
        .map_err(|e| format!("Invalid commit hash: {}", e))?;

    // Get the commit
    let commit = repo.find_commit(oid)
        .map_err(|e| format!("Failed to find commit: {}", e))?;

    // Get the tree for this commit
    let commit_tree = commit.tree()
        .map_err(|e| format!("Failed to get commit tree: {}", e))?;

    // Get the parent tree (or empty tree if no parent)
    let parent_tree = if commit.parent_count() > 0 {
        commit.parent(0)
            .ok()
            .and_then(|p| p.tree().ok())
    } else {
        None
    };

    // Diff the trees
    let diff = if let Some(parent_tree) = parent_tree {
        repo.diff_tree_to_tree(Some(&parent_tree), Some(&commit_tree), None)
            .map_err(|e| format!("Failed to create diff: {}", e))?
    } else {
        // First commit - diff against empty tree
        repo.diff_tree_to_tree(None, Some(&commit_tree), None)
            .map_err(|e| format!("Failed to create diff: {}", e))?
    };

    // Collect file changes
    let mut file_changes = Vec::new();

    diff.foreach(
        &mut |delta, _| {
            let path = delta.new_file()
                .path()
                .unwrap_or_else(|| delta.old_file().path().unwrap_or(std::path::Path::new("unknown")))
                .to_string_lossy()
                .to_string();

            let status = match delta.status() {
                git2::Delta::Added => "added",
                git2::Delta::Deleted => "deleted",
                git2::Delta::Modified => "modified",
                git2::Delta::Renamed => "renamed",
                git2::Delta::Copied => "copied",
                git2::Delta::TypeChange => "type_change",
                _ => "unknown",
            };

            file_changes.push(FileChange {
                path,
                status: status.to_string(),
                insertions: 0,
                deletions: 0,
            });

            true
        },
        None,
        None,
        None,
    ).map_err(|e| format!("Failed to iterate diff: {}", e))?;

    Ok(file_changes)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![open_repository, get_commits, get_commit_files])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
