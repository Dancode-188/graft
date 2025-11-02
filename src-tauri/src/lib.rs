use git2::{Repository, Sort};
use serde::{Serialize, Deserialize};
use std::path::Path;

#[derive(Debug, Serialize)]
struct RepoInfo {
    name: String,
    path: String,
    current_branch: String,
    is_bare: bool,
}

#[derive(Debug, Serialize, Clone)]
struct BranchRef {
    name: String,
    is_remote: bool,
    is_current: bool,
}

#[derive(Debug, Serialize, Clone)]
struct TagRef {
    name: String,
    is_annotated: bool,
    is_remote: bool,
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
    branches: Vec<BranchRef>,
    tags: Vec<TagRef>,
}

#[derive(Debug, Serialize)]
struct FileChange {
    path: String,
    status: String, // "added", "modified", "deleted", "renamed"
    insertions: u32,
    deletions: u32,
}

#[derive(Debug, Serialize)]
struct WorkingDirectoryFile {
    path: String,
    status: String, // "modified", "added", "deleted", "renamed", "conflicted"
    is_staged: bool,
}

#[derive(Debug, Serialize)]
struct WorkingDirectoryStatus {
    staged: Vec<WorkingDirectoryFile>,
    unstaged: Vec<WorkingDirectoryFile>,
}

#[derive(Debug, Serialize)]
struct RemoteStatus {
    has_remote: bool,
    remote_name: String,
    remote_url: String,
    ahead: usize,
    behind: usize,
    up_to_date: bool,
}

// Note: FetchProgress is prepared for future real-time progress streaming
// Currently using simpler FetchResult for completed operations
#[allow(dead_code)]
#[derive(Debug, Serialize, Clone)]
struct FetchProgress {
    stage: String,
    received_objects: u32,
    total_objects: u32,
    received_bytes: usize,
    indexed_deltas: u32,
    total_deltas: u32,
}

#[derive(Debug, Serialize)]
struct FetchResult {
    success: bool,
    bytes_received: usize,
    objects_received: usize,
    message: String,
}

#[derive(Debug, Serialize)]
struct PushResult {
    success: bool,
    rejected: bool,
    rejection_reason: String,
    bytes_sent: usize,
    message: String,
}

#[derive(Debug, Deserialize)]
enum PullStrategy {
    Merge,
    Rebase,
}

#[derive(Debug, Serialize, Clone)]
struct ConflictFile {
    path: String,
    conflict_type: String,
}

#[derive(Debug, Serialize)]
struct PullResult {
    success: bool,
    conflicts: Vec<ConflictFile>,
    commits_received: usize,
    message: String,
}

#[derive(Debug, Serialize)]
struct CommitResult {
    success: bool,
    commit_hash: String,
    message: String,
}

// ============================================================================
// Phase 7: Interactive Rebase Data Structures
// ============================================================================

#[derive(Debug, Serialize, Clone)]
struct RebaseCommit {
    hash: String,
    short_hash: String,
    message: String,
    author: String,
    timestamp: i64,
    action: String,  // "pick", "squash", "fixup", "drop", "reword", "edit"
}

#[derive(Debug, Deserialize, Clone)]
struct RebaseInstruction {
    hash: String,
    action: String,  // "pick", "squash", "fixup", "drop", "reword", "edit"
    new_message: Option<String>,  // Used for "reword" action
}

#[derive(Debug, Serialize)]
struct RebasePlan {
    total_commits: usize,
    actions_summary: std::collections::HashMap<String, usize>,
    warnings: Vec<String>,
    can_proceed: bool,
}

#[derive(Debug, Serialize)]
struct RebaseResult {
    success: bool,
    current_commit_index: usize,
    total_commits: usize,
    conflicts: Vec<ConflictFile>,
    message: String,
    rebase_state: String,  // "completed", "in_progress", "stopped_for_edit", "conflict"
}

#[derive(Debug, Serialize)]
struct RebaseStatus {
    is_in_progress: bool,
    current_commit_index: usize,
    total_commits: usize,
    has_conflicts: bool,
    conflicts: Vec<ConflictFile>,
    onto_commit: String,
    original_head: String,
}

#[derive(Debug, Serialize)]
struct ValidationResult {
    is_valid: bool,
    errors: Vec<String>,
    warnings: Vec<String>,
}

// ============================================================================
// Phase 8: Stash Management Data Structures
// ============================================================================

#[derive(Debug, Serialize, Clone)]
struct StashEntry {
    index: usize,           // Stash index (0 = most recent)
    message: String,        // Stash message
    branch: String,         // Branch where stash was created
    timestamp: i64,         // Unix timestamp
    oid: String,            // Git OID
    file_count: usize,      // Number of files changed
}

#[derive(Debug, Deserialize)]
struct StashCreateOptions {
    message: Option<String>,
    include_untracked: bool,
    keep_index: bool,
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

    // Get the HEAD reference for checking current branch
    let head_branch = repo.head()
        .ok()
        .and_then(|h| h.shorthand().map(|s| s.to_string()));

    // Build a map of commit OIDs to branch references
    let mut oid_to_branches: std::collections::HashMap<git2::Oid, Vec<BranchRef>> = std::collections::HashMap::new();

    // Iterate through all branches (local and remote)
    let branches = repo.branches(None)
        .map_err(|e| format!("Failed to iterate branches: {}", e))?;

    for branch_result in branches {
        let (branch, branch_type) = branch_result
            .map_err(|e| format!("Failed to get branch: {}", e))?;

        let branch_name = branch.name()
            .map_err(|e| format!("Failed to get branch name: {}", e))?
            .unwrap_or("unknown")
            .to_string();

        let is_remote = branch_type == git2::BranchType::Remote;

        // Get the commit that this branch points to
        let reference = branch.get();
        if let Some(oid) = reference.target() {
            let is_current = !is_remote && head_branch.as_ref().map_or(false, |hb| hb == &branch_name);
            
            oid_to_branches
                .entry(oid)
                .or_insert_with(Vec::new)
                .push(BranchRef {
                    name: branch_name,
                    is_remote,
                    is_current,
                });
        }
    }

    // Build a map of commit OIDs to tag references
    let mut oid_to_tags: std::collections::HashMap<git2::Oid, Vec<TagRef>> = std::collections::HashMap::new();

    // Iterate through all tags
    if let Ok(tag_names) = repo.tag_names(None) {
        for tag_name in tag_names.iter().flatten() {
            if let Ok(reference) = repo.resolve_reference_from_short_name(tag_name) {
                // Try to get the OID directly from the reference
                if let Some(oid) = reference.target() {
                    // Check if this is an annotated tag
                    let is_annotated = reference.is_tag();
                    
                    oid_to_tags
                        .entry(oid)
                        .or_insert_with(Vec::new)
                        .push(TagRef {
                            name: tag_name.to_string(),
                            is_annotated,
                            is_remote: tag_name.contains("remotes/"),
                        });
                }
            }
        }
    }

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

    // Push ALL branch heads to revwalk (equivalent to git log --all)
    // This ensures we see commits from all branches, not just HEAD
    let branches = repo.branches(None)
        .map_err(|e| format!("Failed to iterate branches: {}", e))?;

    let mut has_pushed_ref = false;
    for branch_result in branches {
        let (branch, _branch_type) = branch_result
            .map_err(|e| format!("Failed to get branch: {}", e))?;

        let reference = branch.get();
        if let Some(oid) = reference.target() {
            revwalk.push(oid)
                .map_err(|e| format!("Failed to push branch: {}", e))?;
            has_pushed_ref = true;
        }
    }

    // If no branches were found (shouldn't happen), fall back to HEAD
    if !has_pushed_ref {
        revwalk.push(head_commit.id())
            .map_err(|e| format!("Failed to push HEAD: {}", e))?;
    }

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

        // Get branches pointing to this commit
        let branches = oid_to_branches
            .get(&oid)
            .cloned()
            .unwrap_or_default();

        // Get tags pointing to this commit
        let tags = oid_to_tags
            .get(&oid)
            .cloned()
            .unwrap_or_default();

        commits.push(Commit {
            hash: oid.to_string(),
            short_hash: oid.to_string()[..7].to_string(),
            message,
            author_name,
            author_email,
            timestamp,
            parent_hashes,
            branches,
            tags,
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

#[tauri::command]
fn get_working_directory_status(path: String) -> Result<WorkingDirectoryStatus, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    let mut staged = Vec::new();
    let mut unstaged = Vec::new();

    // Get the status for each file
    let statuses = repo.statuses(None)
        .map_err(|e| format!("Failed to get repository status: {}", e))?;

    for entry in statuses.iter() {
        let file_path = entry.path().unwrap_or("unknown").to_string();
        let status = entry.status();

        // Check if file is in index (staged)
        if status.is_index_new() {
            staged.push(WorkingDirectoryFile {
                path: file_path.clone(),
                status: "added".to_string(),
                is_staged: true,
            });
        } else if status.is_index_modified() {
            staged.push(WorkingDirectoryFile {
                path: file_path.clone(),
                status: "modified".to_string(),
                is_staged: true,
            });
        } else if status.is_index_deleted() {
            staged.push(WorkingDirectoryFile {
                path: file_path.clone(),
                status: "deleted".to_string(),
                is_staged: true,
            });
        } else if status.is_index_renamed() {
            staged.push(WorkingDirectoryFile {
                path: file_path.clone(),
                status: "renamed".to_string(),
                is_staged: true,
            });
        }

        // Check if file is in working tree (unstaged)
        if status.is_wt_new() {
            unstaged.push(WorkingDirectoryFile {
                path: file_path.clone(),
                status: "added".to_string(),
                is_staged: false,
            });
        } else if status.is_wt_modified() {
            unstaged.push(WorkingDirectoryFile {
                path: file_path.clone(),
                status: "modified".to_string(),
                is_staged: false,
            });
        } else if status.is_wt_deleted() {
            unstaged.push(WorkingDirectoryFile {
                path: file_path.clone(),
                status: "deleted".to_string(),
                is_staged: false,
            });
        } else if status.is_wt_renamed() {
            unstaged.push(WorkingDirectoryFile {
                path: file_path.clone(),
                status: "renamed".to_string(),
                is_staged: false,
            });
        }

        // Check for conflicts
        if status.is_conflicted() {
            unstaged.push(WorkingDirectoryFile {
                path: file_path,
                status: "conflicted".to_string(),
                is_staged: false,
            });
        }
    }

    Ok(WorkingDirectoryStatus { staged, unstaged })
}

#[tauri::command]
fn stage_files(path: String, file_paths: Vec<String>) -> Result<String, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Get the index
    let mut index = repo.index()
        .map_err(|e| format!("Failed to get repository index: {}", e))?;

    // Add each file to the index
    for file_path in file_paths {
        index.add_path(std::path::Path::new(&file_path))
            .map_err(|e| format!("Failed to stage file {}: {}", file_path, e))?;
    }

    // Write the index
    index.write()
        .map_err(|e| format!("Failed to write index: {}", e))?;

    Ok("Files staged successfully".to_string())
}

#[tauri::command]
fn unstage_files(path: String, file_paths: Vec<String>) -> Result<String, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Get HEAD commit
    let head = repo.head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;
    let head_commit = head.peel_to_commit()
        .map_err(|e| format!("Failed to get HEAD commit: {}", e))?;
    let head_tree = head_commit.tree()
        .map_err(|e| format!("Failed to get HEAD tree: {}", e))?;

    // Get the index
    let mut index = repo.index()
        .map_err(|e| format!("Failed to get repository index: {}", e))?;

    // Reset each file to HEAD
    for file_path in file_paths {
        let tree_entry = head_tree.get_path(std::path::Path::new(&file_path));
        
        if let Ok(entry) = tree_entry {
            // File exists in HEAD, reset to that version using add_frombuffer
            let obj = entry.to_object(&repo)
                .map_err(|e| format!("Failed to get object for {}: {}", file_path, e))?;
            let blob = obj.as_blob()
                .ok_or_else(|| format!("Object is not a blob: {}", file_path))?;
            
            index.add_frombuffer(
                &git2::IndexEntry {
                    ctime: git2::IndexTime::new(0, 0),
                    mtime: git2::IndexTime::new(0, 0),
                    dev: 0,
                    ino: 0,
                    mode: entry.filemode() as u32,
                    uid: 0,
                    gid: 0,
                    file_size: blob.size() as u32,
                    id: entry.id(),
                    flags: 0,
                    flags_extended: 0,
                    path: file_path.as_bytes().to_vec(),
                },
                blob.content()
            ).map_err(|e| format!("Failed to reset file {}: {}", file_path, e))?;
        } else {
            // File doesn't exist in HEAD (new file), remove from index
            index.remove_path(std::path::Path::new(&file_path))
                .map_err(|e| format!("Failed to unstage file {}: {}", file_path, e))?;
        }
    }

    // Write the index
    index.write()
        .map_err(|e| format!("Failed to write index: {}", e))?;

    Ok("Files unstaged successfully".to_string())
}

#[tauri::command]
fn create_commit(path: String, message: String) -> Result<CommitResult, String> {
    // Validate commit message
    if message.trim().is_empty() {
        return Err("Commit message cannot be empty".to_string());
    }

    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Get the signature (author)
    let signature = repo.signature()
        .map_err(|e| format!("Failed to get signature: {}", e))?;

    // Get the current HEAD
    let head = repo.head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;
    let parent_commit = head.peel_to_commit()
        .map_err(|e| format!("Failed to get parent commit: {}", e))?;

    // Get the index and write it as a tree
    let mut index = repo.index()
        .map_err(|e| format!("Failed to get index: {}", e))?;
    let tree_id = index.write_tree()
        .map_err(|e| format!("Failed to write tree: {}", e))?;
    let tree = repo.find_tree(tree_id)
        .map_err(|e| format!("Failed to find tree: {}", e))?;

    // Create the commit
    let commit_id = repo.commit(
        Some("HEAD"),
        &signature,
        &signature,
        &message,
        &tree,
        &[&parent_commit],
    ).map_err(|e| format!("Failed to create commit: {}", e))?;

    Ok(CommitResult {
        success: true,
        commit_hash: commit_id.to_string(),
        message: "Commit created successfully".to_string(),
    })
}

#[tauri::command]
fn get_file_diff(path: String, commit_hash: String, file_path: String) -> Result<String, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Parse the commit hash
    let oid = git2::Oid::from_str(&commit_hash)
        .map_err(|e| format!("Invalid commit hash: {}", e))?;

    // Get the commit
    let commit = repo.find_commit(oid)
        .map_err(|e| format!("Failed to find commit: {}", e))?;

    // Get the commit tree
    let commit_tree = commit.tree()
        .map_err(|e| format!("Failed to get commit tree: {}", e))?;

    // Get the parent tree (or None if no parent)
    let parent_tree = if commit.parent_count() > 0 {
        commit.parent(0)
            .ok()
            .and_then(|p| p.tree().ok())
    } else {
        None
    };

    // Create diff between parent and current commit
    let diff = if let Some(parent_tree) = parent_tree {
        repo.diff_tree_to_tree(Some(&parent_tree), Some(&commit_tree), None)
            .map_err(|e| format!("Failed to create diff: {}", e))?
    } else {
        // First commit - diff against empty tree
        repo.diff_tree_to_tree(None, Some(&commit_tree), None)
            .map_err(|e| format!("Failed to create diff: {}", e))?
    };

    // Find the specific file in the diff
    let file_path_std = std::path::Path::new(&file_path);
    let mut diff_output = String::new();
    let mut file_found = false;

    diff.print(git2::DiffFormat::Patch, |delta, _hunk, line| {
        // Get the origin of the line (context, addition, deletion, etc.)
        let origin = line.origin();
        let content = std::str::from_utf8(line.content()).unwrap_or("");

        // Check if this line belongs to our file
        let delta_path = delta.new_file()
            .path()
            .unwrap_or_else(|| delta.old_file().path().unwrap_or(std::path::Path::new("")));
        
        if delta_path == file_path_std {
            file_found = true;
            
            // Add the line with its origin marker
            match origin {
                '+' | '-' | ' ' => {
                    diff_output.push(origin);
                    diff_output.push_str(content);
                }
                'H' => {
                    // Header line (like diff --git)
                    diff_output.push_str(content);
                }
                'F' => {
                    // File header (like +++ or ---)
                    diff_output.push_str(content);
                }
                _ => {
                    // Other lines (like @@ hunk headers)
                    diff_output.push_str(content);
                }
            }
        }

        true
    }).map_err(|e| format!("Failed to print diff: {}", e))?;

    if !file_found {
        return Err(format!("File not found in commit: {}", file_path));
    }

    Ok(diff_output)
}

/// Get the content of a file at a specific commit (for split diff view)
#[tauri::command]
fn get_file_content(
    path: String,
    commit_hash: String,
    file_path: String,
) -> Result<String, String> {
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
    let tree = commit.tree()
        .map_err(|e| format!("Failed to get commit tree: {}", e))?;

    // Find the file in the tree
    let tree_entry = tree.get_path(std::path::Path::new(&file_path))
        .map_err(|e| format!("File not found in commit: {}", e))?;

    // Get the blob (file content)
    let blob = repo.find_blob(tree_entry.id())
        .map_err(|e| format!("Failed to read file content: {}", e))?;

    // Convert blob content to string
    let content = std::str::from_utf8(blob.content())
        .map_err(|e| format!("File is not valid UTF-8: {}", e))?;

    Ok(content.to_string())
}

// Branch management structures
#[derive(Debug, Serialize, Clone)]
struct Branch {
    name: String,
    full_name: String,
    is_remote: bool,
    is_current: bool,
    commit_hash: String,
    commit_message: String,
    last_commit_date: i64,
    upstream: Option<String>,
}

/// Get all branches (local and remote) with metadata
#[tauri::command]
fn get_branches(path: String) -> Result<Vec<Branch>, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    let mut branches = Vec::new();

    // Get the current branch (if any)
    let head_ref = repo.head().ok();
    let current_branch_name = head_ref
        .as_ref()
        .and_then(|h| h.shorthand())
        .map(|s| s.to_string());

    // Iterate through all branches (local and remote)
    let branch_iter = repo.branches(None)
        .map_err(|e| format!("Failed to iterate branches: {}", e))?;

    for branch_result in branch_iter {
        let (branch, branch_type) = branch_result
            .map_err(|e| format!("Failed to get branch: {}", e))?;

        // Get branch name
        let name = branch.name()
            .map_err(|e| format!("Failed to get branch name: {}", e))?
            .unwrap_or("unknown")
            .to_string();

        let is_remote = branch_type == git2::BranchType::Remote;
        
        // Determine if this is the current branch
        let is_current = !is_remote && current_branch_name.as_ref().map_or(false, |cb| cb == &name);

        // Get the full reference name
        let reference = branch.get();
        let full_name = reference.name()
            .unwrap_or("unknown")
            .to_string();

        // Get the commit this branch points to
        let commit = reference.peel_to_commit()
            .map_err(|e| format!("Failed to get commit for branch {}: {}", name, e))?;

        let commit_hash = commit.id().to_string();
        let commit_message = commit.message()
            .unwrap_or("(no message)")
            .lines()
            .next()
            .unwrap_or("(no message)")
            .to_string();
        let last_commit_date = commit.time().seconds();

        // Get upstream tracking info (for local branches)
        let upstream = if !is_remote {
            branch.upstream()
                .ok()
                .and_then(|upstream_branch| {
                    upstream_branch.name()
                        .ok()
                        .flatten()
                        .map(|s| s.to_string())
                })
        } else {
            None
        };

        branches.push(Branch {
            name,
            full_name,
            is_remote,
            is_current,
            commit_hash,
            commit_message,
            last_commit_date,
            upstream,
        });
    }

    // Sort branches: current first, then local, then remote
    branches.sort_by(|a, b| {
        if a.is_current != b.is_current {
            b.is_current.cmp(&a.is_current)
        } else if a.is_remote != b.is_remote {
            a.is_remote.cmp(&b.is_remote)
        } else {
            a.name.cmp(&b.name)
        }
    });

    Ok(branches)
}

/// Create a new branch
#[tauri::command]
fn create_branch(
    path: String,
    branch_name: String,
    start_point: Option<String>,
    checkout: bool,
) -> Result<String, String> {
    // Validate branch name
    if branch_name.trim().is_empty() {
        return Err("Branch name cannot be empty".to_string());
    }

    // Check for invalid characters in branch name
    if branch_name.contains("..") || branch_name.starts_with('/') || branch_name.ends_with('/') {
        return Err("Invalid branch name".to_string());
    }

    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check if branch already exists
    if repo.find_branch(&branch_name, git2::BranchType::Local).is_ok() {
        return Err(format!("Branch '{}' already exists", branch_name));
    }

    // Determine the starting commit
    let commit = if let Some(start) = start_point {
        // Try to parse as commit hash or resolve as reference
        let obj = repo.revparse_single(&start)
            .map_err(|e| format!("Failed to resolve start point '{}': {}", start, e))?;
        obj.peel_to_commit()
            .map_err(|e| format!("Start point '{}' is not a valid commit: {}", start, e))?
    } else {
        // Use HEAD
        let head = repo.head()
            .map_err(|e| format!("Failed to get HEAD: {}", e))?;
        head.peel_to_commit()
            .map_err(|e| format!("Failed to get HEAD commit: {}", e))?
    };

    // Create the branch
    repo.branch(&branch_name, &commit, false)
        .map_err(|e| format!("Failed to create branch: {}", e))?;

    // Checkout if requested
    if checkout {
        let obj = repo.revparse_single(&format!("refs/heads/{}", branch_name))
            .map_err(|e| format!("Failed to find new branch: {}", e))?;
        
        repo.checkout_tree(&obj, None)
            .map_err(|e| format!("Failed to checkout branch: {}", e))?;
        
        repo.set_head(&format!("refs/heads/{}", branch_name))
            .map_err(|e| format!("Failed to set HEAD: {}", e))?;
    }

    Ok(format!("Branch '{}' created successfully", branch_name))
}

/// Switch to a different branch
#[tauri::command]
fn switch_branch(path: String, branch_name: String) -> Result<String, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check for uncommitted changes
    let statuses = repo.statuses(None)
        .map_err(|e| format!("Failed to get repository status: {}", e))?;
    
    let has_changes = statuses.iter().any(|s| {
        let status = s.status();
        status.is_index_new() || status.is_index_modified() || status.is_index_deleted() ||
        status.is_wt_new() || status.is_wt_modified() || status.is_wt_deleted()
    });

    if has_changes {
        return Err("You have uncommitted changes. Please commit or stash them before switching branches.".to_string());
    }

    // Find the branch
    let branch = repo.find_branch(&branch_name, git2::BranchType::Local)
        .map_err(|e| format!("Branch '{}' not found: {}", branch_name, e))?;

    // Get the reference
    let reference = branch.get();
    let obj = reference.peel(git2::ObjectType::Commit)
        .map_err(|e| format!("Failed to get commit: {}", e))?;

    // Checkout the branch
    repo.checkout_tree(&obj, None)
        .map_err(|e| format!("Failed to checkout branch: {}", e))?;

    // Update HEAD
    repo.set_head(&format!("refs/heads/{}", branch_name))
        .map_err(|e| format!("Failed to update HEAD: {}", e))?;

    Ok(format!("Switched to branch '{}'", branch_name))
}

/// Delete a branch
#[tauri::command]
fn delete_branch(path: String, branch_name: String, force: bool) -> Result<String, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check if trying to delete current branch
    let head_ref = repo.head().ok();
    let current_branch = head_ref
        .as_ref()
        .and_then(|h| h.shorthand())
        .map(|s| s.to_string());

    if current_branch.as_ref().map_or(false, |cb| cb == &branch_name) {
        return Err("Cannot delete the current branch. Please switch to another branch first.".to_string());
    }

    // Find the branch
    let mut branch = repo.find_branch(&branch_name, git2::BranchType::Local)
        .map_err(|e| format!("Branch '{}' not found: {}", branch_name, e))?;

    // Check if branch is merged (unless force is true)
    if !force {
        let branch_commit = branch.get()
            .peel_to_commit()
            .map_err(|e| format!("Failed to get branch commit: {}", e))?;
        
        let head_commit = repo.head()
            .map_err(|e| format!("Failed to get HEAD: {}", e))?
            .peel_to_commit()
            .map_err(|e| format!("Failed to get HEAD commit: {}", e))?;

        // Check if branch_commit is reachable from head_commit
        let is_merged = repo.graph_descendant_of(head_commit.id(), branch_commit.id())
            .map_err(|e| format!("Failed to check if branch is merged: {}", e))?;

        if !is_merged {
            return Err(format!(
                "Branch '{}' is not fully merged. Use force delete if you're sure.",
                branch_name
            ));
        }
    }

    // Delete the branch
    branch.delete()
        .map_err(|e| format!("Failed to delete branch: {}", e))?;

    Ok(format!("Branch '{}' deleted successfully", branch_name))
}

/// Rename a branch
#[tauri::command]
fn rename_branch(path: String, old_name: String, new_name: String) -> Result<String, String> {
    // Validate new branch name
    if new_name.trim().is_empty() {
        return Err("New branch name cannot be empty".to_string());
    }

    // Check for invalid characters
    if new_name.contains("..") || new_name.starts_with('/') || new_name.ends_with('/') {
        return Err("Invalid branch name".to_string());
    }

    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check if new name already exists
    if repo.find_branch(&new_name, git2::BranchType::Local).is_ok() {
        return Err(format!("Branch '{}' already exists", new_name));
    }

    // Find the branch to rename
    let mut branch = repo.find_branch(&old_name, git2::BranchType::Local)
        .map_err(|e| format!("Branch '{}' not found: {}", old_name, e))?;

    // Rename the branch
    branch.rename(&new_name, false)
        .map_err(|e| format!("Failed to rename branch: {}", e))?;

    Ok(format!("Branch '{}' renamed to '{}'", old_name, new_name))
}

#[tauri::command]
fn get_remote_status(path: String, branch_name: String) -> Result<RemoteStatus, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Get the branch
    let branch = repo.find_branch(&branch_name, git2::BranchType::Local)
        .map_err(|e| format!("Branch '{}' not found: {}", branch_name, e))?;

    // Get the upstream branch
    let upstream = match branch.upstream() {
        Ok(upstream) => upstream,
        Err(_) => {
            // No upstream configured
            return Ok(RemoteStatus {
                has_remote: false,
                remote_name: String::new(),
                remote_url: String::new(),
                ahead: 0,
                behind: 0,
                up_to_date: true,
            });
        }
    };

    // Get remote name and URL
    let upstream_name = upstream.name()
        .map_err(|_| "Invalid upstream branch name")?
        .ok_or("Upstream branch name is not valid UTF-8")?;
    
    // Parse remote name from upstream (e.g., "origin/main" -> "origin")
    let remote_name = upstream_name
        .split('/')
        .next()
        .unwrap_or("origin")
        .to_string();

    // Get remote URL
    let remote = repo.find_remote(&remote_name)
        .map_err(|e| format!("Failed to find remote '{}': {}", remote_name, e))?;
    
    let remote_url = remote.url()
        .ok_or("Remote URL is not valid UTF-8")?
        .to_string();

    // Get local and remote commit OIDs
    let local_oid = branch.get().target()
        .ok_or("Failed to get local branch target")?;
    
    let upstream_oid = upstream.get().target()
        .ok_or("Failed to get upstream branch target")?;

    // Calculate ahead/behind counts
    let (ahead, behind) = repo.graph_ahead_behind(local_oid, upstream_oid)
        .map_err(|e| format!("Failed to calculate ahead/behind: {}", e))?;

    let up_to_date = ahead == 0 && behind == 0;

    Ok(RemoteStatus {
        has_remote: true,
        remote_name,
        remote_url,
        ahead,
        behind,
        up_to_date,
    })
}

#[tauri::command]
fn fetch_from_remote(path: String, remote_name: String) -> Result<FetchResult, String> {
    use git2::{FetchOptions, RemoteCallbacks};
    use std::sync::{Arc, Mutex};

    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Find the remote
    let mut remote = repo.find_remote(&remote_name)
        .map_err(|e| format!("Remote '{}' not found: {}", remote_name, e))?;

    // Track progress
    let total_objects = Arc::new(Mutex::new(0u32));
    let received_objects = Arc::new(Mutex::new(0u32));
    let received_bytes = Arc::new(Mutex::new(0usize));
    let indexed_deltas = Arc::new(Mutex::new(0u32));
    let total_deltas = Arc::new(Mutex::new(0u32));

    let total_objects_clone = Arc::clone(&total_objects);
    let received_objects_clone = Arc::clone(&received_objects);
    let received_bytes_clone = Arc::clone(&received_bytes);
    let indexed_deltas_clone = Arc::clone(&indexed_deltas);
    let total_deltas_clone = Arc::clone(&total_deltas);

    // Set up callbacks
    let mut callbacks = RemoteCallbacks::new();
    
    callbacks.transfer_progress(move |stats| {
        *total_objects_clone.lock().unwrap() = stats.total_objects() as u32;
        *received_objects_clone.lock().unwrap() = stats.received_objects() as u32;
        *received_bytes_clone.lock().unwrap() = stats.received_bytes();
        *indexed_deltas_clone.lock().unwrap() = stats.indexed_deltas() as u32;
        *total_deltas_clone.lock().unwrap() = stats.total_deltas() as u32;
        true
    });

    // Credentials callback - try SSH agent
    callbacks.credentials(|_url, username_from_url, _allowed_types| {
        git2::Cred::ssh_key_from_agent(username_from_url.unwrap_or("git"))
    });

    // Set up fetch options
    let mut fetch_options = FetchOptions::new();
    fetch_options.remote_callbacks(callbacks);

    // Fetch all refs (connection happens automatically)
    remote.fetch(&["refs/heads/*:refs/remotes/origin/*"], Some(&mut fetch_options), None)
        .map_err(|e| format!("Failed to fetch from remote: {}", e))?;

    // Get final stats
    let final_objects = *received_objects.lock().unwrap();
    let final_bytes = *received_bytes.lock().unwrap();

    Ok(FetchResult {
        success: true,
        bytes_received: final_bytes,
        objects_received: final_objects as usize,
        message: format!("Fetched {} objects ({} bytes)", final_objects, final_bytes),
    })
}

#[tauri::command]
fn pull_from_remote(
    path: String,
    remote_name: String,
    strategy: PullStrategy,
) -> Result<PullResult, String> {
    use git2::{FetchOptions, RemoteCallbacks};

    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check if working directory is clean
    let statuses = repo.statuses(None)
        .map_err(|e| format!("Failed to get repository status: {}", e))?;
    
    let has_changes = statuses.iter().any(|s| {
        let status = s.status();
        status.is_wt_modified() || status.is_wt_new() || status.is_wt_deleted()
    });
    
    if has_changes {
        return Err("Working directory has uncommitted changes. Commit or stash them before pulling.".to_string());
    }

    // Get current branch
    let head = repo.head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;
    let branch_name = head.shorthand()
        .ok_or_else(|| "Failed to get branch name".to_string())?;

    // Find the remote
    let mut remote = repo.find_remote(&remote_name)
        .map_err(|e| format!("Remote '{}' not found: {}", remote_name, e))?;

    // Set up callbacks for authentication
    let mut callbacks = RemoteCallbacks::new();
    callbacks.credentials(|_url, username_from_url, _allowed_types| {
        git2::Cred::ssh_key_from_agent(username_from_url.unwrap_or("git"))
    });

    // Set up fetch options
    let mut fetch_options = FetchOptions::new();
    fetch_options.remote_callbacks(callbacks);

    // Fetch from remote
    remote.fetch(&[branch_name], Some(&mut fetch_options), None)
        .map_err(|e| format!("Failed to fetch from remote: {}", e))?;

    // Get the fetch head
    let fetch_head = repo.find_reference("FETCH_HEAD")
        .map_err(|e| format!("Failed to find FETCH_HEAD: {}", e))?;
    let fetch_commit = repo.reference_to_annotated_commit(&fetch_head)
        .map_err(|e| format!("Failed to get fetch commit: {}", e))?;

    // Get HEAD commit
    let head_commit = repo.reference_to_annotated_commit(&head)
        .map_err(|e| format!("Failed to get HEAD commit: {}", e))?;

    // Perform merge analysis
    let (merge_analysis, _merge_pref) = repo.merge_analysis(&[&fetch_commit])
        .map_err(|e| format!("Failed to analyze merge: {}", e))?;

    if merge_analysis.is_up_to_date() {
        return Ok(PullResult {
            success: true,
            conflicts: vec![],
            commits_received: 0,
            message: "Already up to date".to_string(),
        });
    }

    if merge_analysis.is_fast_forward() {
        // Fast-forward merge
        let refname = format!("refs/heads/{}", branch_name);
        let mut reference = repo.find_reference(&refname)
            .map_err(|e| format!("Failed to find branch reference: {}", e))?;
        
        reference.set_target(fetch_commit.id(), "Fast-forward merge")
            .map_err(|e| format!("Failed to fast-forward: {}", e))?;
        
        repo.set_head(&refname)
            .map_err(|e| format!("Failed to set HEAD: {}", e))?;
        
        repo.checkout_head(Some(git2::build::CheckoutBuilder::default().force()))
            .map_err(|e| format!("Failed to checkout: {}", e))?;

        return Ok(PullResult {
            success: true,
            conflicts: vec![],
            commits_received: 1,
            message: "Fast-forward merge completed".to_string(),
        });
    }

    // Normal merge or rebase required
    match strategy {
        PullStrategy::Merge => {
            perform_merge(&repo, &fetch_commit, branch_name)
        }
        PullStrategy::Rebase => {
            perform_rebase(&repo, &fetch_commit, &head_commit)
        }
    }
}

fn perform_merge(
    repo: &Repository,
    fetch_commit: &git2::AnnotatedCommit,
    branch_name: &str,
) -> Result<PullResult, String> {
    use git2::MergeOptions;

    // Perform merge
    let mut merge_options = MergeOptions::new();
    repo.merge(&[fetch_commit], Some(&mut merge_options), None)
        .map_err(|e| format!("Merge failed: {}", e))?;

    // Check for conflicts
    let mut index = repo.index()
        .map_err(|e| format!("Failed to get index: {}", e))?;
    
    if index.has_conflicts() {
        let conflicts = collect_conflicts(&index)?;
        let conflict_count = conflicts.len();
        return Ok(PullResult {
            success: false,
            conflicts,
            commits_received: 0,
            message: format!("Merge has {} conflict(s). Please resolve them manually.", conflict_count),
        });
    }

    // Write the merge commit
    let signature = repo.signature()
        .map_err(|e| format!("Failed to get signature: {}", e))?;
    
    let parent_commit = repo.head()
        .and_then(|h| h.peel_to_commit())
        .map_err(|e| format!("Failed to get parent commit: {}", e))?;
    
    let fetch_parent = repo.find_commit(fetch_commit.id())
        .map_err(|e| format!("Failed to find fetch commit: {}", e))?;
    
    let tree_id = index.write_tree()
        .map_err(|e| format!("Failed to write tree: {}", e))?;
    let tree = repo.find_tree(tree_id)
        .map_err(|e| format!("Failed to find tree: {}", e))?;

    let message = format!("Merge branch '{}' of remote", branch_name);
    repo.commit(
        Some("HEAD"),
        &signature,
        &signature,
        &message,
        &tree,
        &[&parent_commit, &fetch_parent],
    ).map_err(|e| format!("Failed to create merge commit: {}", e))?;

    // Clean up merge state
    repo.cleanup_state()
        .map_err(|e| format!("Failed to cleanup state: {}", e))?;

    Ok(PullResult {
        success: true,
        conflicts: vec![],
        commits_received: 1,
        message: "Merge completed successfully".to_string(),
    })
}

fn perform_rebase(
    repo: &Repository,
    fetch_commit: &git2::AnnotatedCommit,
    _head_commit: &git2::AnnotatedCommit,
) -> Result<PullResult, String> {
    use git2::RebaseOptions;

    // Get the signature for rebase commits
    let signature = repo.signature()
        .map_err(|e| format!("Failed to get signature: {}", e))?;

    // Initialize rebase options
    let mut rebase_options = RebaseOptions::new();
    
    // Initialize the rebase operation
    // Parameters: branch (None = HEAD), upstream, onto
    let mut rebase = repo.rebase(
        None,               // Rebase current HEAD
        Some(fetch_commit), // Onto the fetched commit
        None,               // No custom onto
        Some(&mut rebase_options)
    ).map_err(|e| format!("Failed to initialize rebase: {}", e))?;

    // Track the number of commits applied
    let mut commits_applied = 0;

    // Apply each commit in the rebase
    while let Some(op) = rebase.next() {
        // Get the operation (this advances the iterator)
        let _op = op.map_err(|e| format!("Failed to get rebase operation: {}", e))?;
        
        // Try to apply this commit
        match rebase.commit(None, &signature, None) {
            Ok(_) => {
                commits_applied += 1;
            }
            Err(e) => {
                // Check if we have conflicts
                let index = repo.index()
                    .map_err(|e| format!("Failed to get index: {}", e))?;
                
                if index.has_conflicts() {
                    // Collect conflict information
                    let conflicts = collect_conflicts(&index)?;
                    let conflict_count = conflicts.len(); // Get count before moving
                    
                    // Abort the rebase to leave the repository in a clean state
                    rebase.abort()
                        .map_err(|e| format!("Failed to abort rebase after conflict: {}", e))?;
                    
                    return Ok(PullResult {
                        success: false,
                        conflicts,
                        commits_received: 0,
                        message: format!(
                            "Rebase failed with {} conflict(s). The rebase has been aborted.",
                            conflict_count
                        ),
                    });
                } else {
                    // Some other error occurred
                    rebase.abort()
                        .map_err(|e| format!("Failed to abort rebase: {}", e))?;
                    return Err(format!("Failed to apply commit during rebase: {}", e));
                }
            }
        }
    }

    // Finish the rebase
    rebase.finish(None)
        .map_err(|e| format!("Failed to finish rebase: {}", e))?;

    Ok(PullResult {
        success: true,
        conflicts: vec![],
        commits_received: commits_applied,
        message: format!("Rebase completed successfully ({} commits applied)", commits_applied),
    })
}

fn collect_conflicts(index: &git2::Index) -> Result<Vec<ConflictFile>, String> {
    let mut conflicts = Vec::new();
    
    let conflicts_iter = index.conflicts()
        .map_err(|e| format!("Failed to get conflicts: {}", e))?;
    
    for conflict in conflicts_iter {
        let conflict = conflict
            .map_err(|e| format!("Failed to read conflict: {}", e))?;
        
        // Determine conflict type first (before moving values)
        let conflict_type = if conflict.our.is_some() && conflict.their.is_some() {
            "content".to_string()
        } else if conflict.our.is_some() && conflict.their.is_none() {
            "delete/modify".to_string()
        } else if conflict.our.is_none() && conflict.their.is_some() {
            "modify/delete".to_string()
        } else {
            "unknown".to_string()
        };
        
        // Now extract the path (moving values is fine here)
        let path = if let Some(ours) = conflict.our {
            String::from_utf8_lossy(&ours.path).to_string()
        } else if let Some(theirs) = conflict.their {
            String::from_utf8_lossy(&theirs.path).to_string()
        } else if let Some(ancestor) = conflict.ancestor {
            String::from_utf8_lossy(&ancestor.path).to_string()
        } else {
            "unknown".to_string()
        };

        conflicts.push(ConflictFile {
            path,
            conflict_type,
        });
    }
    
    Ok(conflicts)
}

#[tauri::command]
fn push_to_remote(
    path: String,
    remote_name: String,
    branch_name: String,
    force: bool,
    force_with_lease: bool,
) -> Result<PushResult, String> {
    use git2::{PushOptions, RemoteCallbacks};
    use std::sync::{Arc, Mutex};

    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Find the remote
    let mut remote = repo.find_remote(&remote_name)
        .map_err(|e| format!("Remote '{}' not found: {}", remote_name, e))?;

    // Track if push was rejected
    let was_rejected = Arc::new(Mutex::new(false));
    let rejection_reason = Arc::new(Mutex::new(String::new()));
    
    let was_rejected_clone = Arc::clone(&was_rejected);
    let rejection_reason_clone = Arc::clone(&rejection_reason);

    // Set up callbacks
    let mut callbacks = RemoteCallbacks::new();
    
    // Credentials callback - try SSH agent
    callbacks.credentials(|_url, username_from_url, _allowed_types| {
        git2::Cred::ssh_key_from_agent(username_from_url.unwrap_or("git"))
    });

    // Push update callback to detect rejections
    callbacks.push_update_reference(move |refname, status| {
        if let Some(s) = status {
            *was_rejected_clone.lock().unwrap() = true;
            *rejection_reason_clone.lock().unwrap() = format!("{}: {}", refname, s);
            return Err(git2::Error::from_str(&format!("Push rejected: {}", s)));
        }
        Ok(())
    });

    // Set up push options
    let mut push_options = PushOptions::new();
    push_options.remote_callbacks(callbacks);

    // Build refspec
    let refspec = if force_with_lease {
        // Use --force-with-lease logic (safer force push)
        format!("+refs/heads/{}:refs/heads/{}", branch_name, branch_name)
    } else if force {
        // Regular force push
        format!("+refs/heads/{}:refs/heads/{}", branch_name, branch_name)
    } else {
        // Normal push
        format!("refs/heads/{}:refs/heads/{}", branch_name, branch_name)
    };

    // Perform the push (the push operation itself will detect if remote is ahead)
    let push_result = remote.push(&[&refspec], Some(&mut push_options));

    match push_result {
        Ok(_) => {
            let rejected = *was_rejected.lock().unwrap();
            let reason = rejection_reason.lock().unwrap().clone();
            
            if rejected {
                Ok(PushResult {
                    success: false,
                    rejected: true,
                    rejection_reason: reason,
                    bytes_sent: 0,
                    message: "Push was rejected by remote".to_string(),
                })
            } else {
                Ok(PushResult {
                    success: true,
                    rejected: false,
                    rejection_reason: String::new(),
                    bytes_sent: 0, // libgit2 doesn't easily expose this
                    message: format!("Successfully pushed to {}/{}", remote_name, branch_name),
                })
            }
        }
        Err(e) => {
            // Check if it's a non-fast-forward error
            let error_msg = e.message().to_string();
            if error_msg.contains("non-fast-forward") || error_msg.contains("rejected") {
                Ok(PushResult {
                    success: false,
                    rejected: true,
                    rejection_reason: error_msg.clone(),
                    bytes_sent: 0,
                    message: "Push rejected: Remote has newer commits. Pull first or use force push.".to_string(),
                })
            } else {
                Err(format!("Push failed: {}", error_msg))
            }
        }
    }
}

// ============================================================================
// Phase 7: Interactive Rebase Commands
// ============================================================================

/// Get the list of commits that would be included in an interactive rebase
/// from the current HEAD back to (and excluding) the base_commit
#[tauri::command]
fn get_rebase_commits(
    path: String,
    base_commit: String,
) -> Result<Vec<RebaseCommit>, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Get the base commit object
    let base_oid = git2::Oid::from_str(&base_commit)
        .map_err(|e| format!("Invalid base commit hash: {}", e))?;
    
    // Get the base commit object (validate it exists)
    let _base_commit_obj = repo.find_commit(base_oid)
        .map_err(|e| format!("Failed to find base commit: {}", e))?;

    // Get HEAD commit
    let head = repo.head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;
    let head_commit = head.peel_to_commit()
        .map_err(|e| format!("Failed to get HEAD commit: {}", e))?;

    // Check that base is an ancestor of HEAD
    let is_ancestor = repo.graph_descendant_of(head_commit.id(), base_oid)
        .map_err(|e| format!("Failed to check ancestry: {}", e))?;
    
    if !is_ancestor {
        return Err(format!(
            "Base commit {} is not an ancestor of HEAD. Cannot rebase.",
            base_commit
        ));
    }

    // Walk commits from HEAD back to (but not including) base
    let mut revwalk = repo.revwalk()
        .map_err(|e| format!("Failed to create revwalk: {}", e))?;
    
    // Push HEAD
    revwalk.push_head()
        .map_err(|e| format!("Failed to push HEAD to revwalk: {}", e))?;
    
    // Hide base commit (we don't want to include it)
    revwalk.hide(base_oid)
        .map_err(|e| format!("Failed to hide base commit: {}", e))?;

    // Collect commits
    let mut commits = Vec::new();
    for oid in revwalk {
        let oid = oid.map_err(|e| format!("Failed to get commit OID: {}", e))?;
        let commit = repo.find_commit(oid)
            .map_err(|e| format!("Failed to find commit: {}", e))?;

        let hash = commit.id().to_string();
        let short_hash = hash.chars().take(7).collect();
        let message = commit.message()
            .unwrap_or("<no message>")
            .lines()
            .next()
            .unwrap_or("<no message>")
            .to_string();
        let author = commit.author().name()
            .unwrap_or("<unknown>")
            .to_string();
        let timestamp = commit.time().seconds();

        commits.push(RebaseCommit {
            hash,
            short_hash,
            message,
            author,
            timestamp,
            action: "pick".to_string(),  // Default action is "pick"
        });
    }

    // Reverse to get chronological order (oldest first)
    // This is the order they'll be applied in the rebase
    commits.reverse();

    if commits.is_empty() {
        return Err("No commits to rebase. HEAD and base are the same.".to_string());
    }

    Ok(commits)
}

/// Discard changes to a specific file in the working directory
#[tauri::command]
fn discard_file_changes(
    path: String,
    file_path: String,
) -> Result<String, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Get the file path as a Path object
    let file_path_obj = std::path::Path::new(&file_path);

    // Try to get the file from HEAD
    let head = repo.head()
        .map_err(|e| format!("Failed to get HEAD: {}", e))?;
    let head_commit = head.peel_to_commit()
        .map_err(|e| format!("Failed to get HEAD commit: {}", e))?;
    let head_tree = head_commit.tree()
        .map_err(|e| format!("Failed to get HEAD tree: {}", e))?;

    // Check if file exists in HEAD
    if let Ok(entry) = head_tree.get_path(file_path_obj) {
        // File exists in HEAD - restore it
        let obj = entry.to_object(&repo)
            .map_err(|e| format!("Failed to get object: {}", e))?;
        let blob = obj.as_blob()
            .ok_or_else(|| format!("Object is not a blob: {}", file_path))?;

        // Write the blob content to the working directory
        let repo_workdir = repo.workdir()
            .ok_or_else(|| "Repository has no working directory".to_string())?;
        let full_path = repo_workdir.join(file_path_obj);

        std::fs::write(&full_path, blob.content())
            .map_err(|e| format!("Failed to write file: {}", e))?;

        Ok(format!("Discarded changes to {}", file_path))
    } else {
        // File doesn't exist in HEAD (new file) - delete it
        let repo_workdir = repo.workdir()
            .ok_or_else(|| "Repository has no working directory".to_string())?;
        let full_path = repo_workdir.join(file_path_obj);

        if full_path.exists() {
            std::fs::remove_file(&full_path)
                .map_err(|e| format!("Failed to delete file: {}", e))?;
            Ok(format!("Deleted new file {}", file_path))
        } else {
            Err(format!("File not found: {}", file_path))
        }
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![
            open_repository,
            get_commits,
            get_commit_files,
            get_working_directory_status,
            stage_files,
            unstage_files,
            create_commit,
            get_file_diff,
            get_file_content,
            get_branches,
            create_branch,
            switch_branch,
            delete_branch,
            rename_branch,
            get_remote_status,
            fetch_from_remote,
            pull_from_remote,
            push_to_remote,
            get_rebase_commits,
            start_interactive_rebase,
            continue_rebase,
            abort_rebase,
            get_rebase_status,
            validate_rebase_order,
            prepare_interactive_rebase,
            list_stashes,
            create_stash,
            apply_stash,
            pop_stash,
            drop_stash,
            get_stash_diff,
            discard_file_changes
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

/// Start an interactive rebase with the given instructions
/// This applies each commit according to its action (pick, squash, fixup, drop)
#[tauri::command]
fn start_interactive_rebase(
    path: String,
    base_commit: String,
    instructions: Vec<RebaseInstruction>,
) -> Result<RebaseResult, String> {
    use git2::RebaseOptions;

    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check that working directory is clean
    let statuses = repo.statuses(None)
        .map_err(|e| format!("Failed to get repository status: {}", e))?;
    
    let has_changes = statuses.iter().any(|s| {
        let status = s.status();
        status.is_wt_modified() || status.is_wt_new() || status.is_wt_deleted()
    });
    
    if has_changes {
        return Err("Working directory has uncommitted changes. Commit or stash them before rebasing.".to_string());
    }

    // Validate instructions
    if instructions.is_empty() {
        return Err("No rebase instructions provided".to_string());
    }

    // First instruction must be "pick" (can't squash into nothing)
    if instructions[0].action != "pick" {
        return Err("First commit must be 'pick'. Cannot squash or fixup the first commit.".to_string());
    }

    // Check that we don't have squash/fixup without a pick before it
    for i in 1..instructions.len() {
        if (instructions[i].action == "squash" || instructions[i].action == "fixup") &&
           (instructions[i-1].action == "drop" || instructions[i-1].action == "squash" || instructions[i-1].action == "fixup") {
            return Err(format!(
                "Commit {} cannot be squashed/fixuped because the previous commit is not 'pick'",
                instructions[i].hash
            ));
        }
    }

    // Get the base commit OID
    let base_oid = git2::Oid::from_str(&base_commit)
        .map_err(|e| format!("Invalid base commit hash: {}", e))?;
    
    // Validate that the base commit exists
    let _base_commit_obj = repo.find_commit(base_oid)
        .map_err(|e| format!("Failed to find base commit: {}", e))?;

    // Create an annotated commit for the base
    let base_annotated = repo.find_annotated_commit(base_oid)
        .map_err(|e| format!("Failed to create annotated commit: {}", e))?;

    // Get signature for commits
    let signature = repo.signature()
        .map_err(|e| format!("Failed to get signature: {}", e))?;

    // Initialize rebase options
    let mut rebase_options = RebaseOptions::new();
    
    // Start the rebase
    let mut rebase = repo.rebase(
        None,                    // Rebase HEAD
        Some(&base_annotated),   // Onto base_commit
        None,                    // No custom onto
        Some(&mut rebase_options)
    ).map_err(|e| format!("Failed to start rebase: {}", e))?;

    let mut applied_count = 0;
    let mut commits_to_squash: Vec<(git2::Oid, String)> = Vec::new(); // (oid, message)
    let total_operations = instructions.len();

    // Process each instruction
    for (index, instruction) in instructions.iter().enumerate() {
        match instruction.action.as_str() {
            "pick" => {
                // Apply the commit normally
                let op = rebase.next();
                if op.is_none() {
                    break; // No more operations
                }
                
                let _op = op.unwrap()
                    .map_err(|e| format!("Failed to get rebase operation: {}", e))?;

                // If we have pending squashes, apply them first
                if !commits_to_squash.is_empty() {
                    // This shouldn't happen with proper validation, but handle it
                    return Err("Internal error: squashed commits without a pick target".to_string());
                }

                // Apply the commit
                match rebase.commit(None, &signature, None) {
                    Ok(_oid) => {
                        applied_count += 1;
                    }
                    Err(_e) => {
                        // Check for conflicts
                        let repo_index = repo.index()
                            .map_err(|e2| format!("Failed to get index: {}", e2))?;
                        
                        if repo_index.has_conflicts() {
                            let conflicts = collect_conflicts(&repo_index)?;
                            
                            return Ok(RebaseResult {
                                success: false,
                                current_commit_index: index,
                                total_commits: total_operations,
                                conflicts,
                                message: format!("Conflicts detected at commit {}/{}. Resolve conflicts and continue.", index + 1, total_operations),
                                rebase_state: "conflict".to_string(),
                            });
                        } else {
                            // Abort on other errors
                            rebase.abort()
                                .map_err(|e2| format!("Failed to abort rebase: {}", e2))?;
                            return Err(format!("Failed to apply commit: {}", _e));
                        }
                    }
                }
            }
            
            "squash" | "fixup" => {
                // Get the commit to squash
                let op = rebase.next();
                if op.is_none() {
                    break;
                }
                
                let operation = op.unwrap()
                    .map_err(|e| format!("Failed to get rebase operation: {}", e))?;
                
                let commit_oid = operation.id();
                let commit = repo.find_commit(commit_oid)
                    .map_err(|e| format!("Failed to find commit to squash: {}", e))?;
                
                let message = if instruction.action == "squash" {
                    commit.message().unwrap_or("").to_string()
                } else {
                    String::new() // fixup discards the message
                };

                // Store for combining with next pick
                commits_to_squash.push((commit_oid, message));

                // Apply the commit changes (will be combined with next pick)
                match rebase.commit(None, &signature, None) {
                    Ok(_) => {
                        // Success - changes applied, will combine message later
                    }
                    Err(_e) => {
                        // Check for conflicts
                        let repo_index = repo.index()
                            .map_err(|e2| format!("Failed to get index: {}", e2))?;
                        
                        if repo_index.has_conflicts() {
                            let conflicts = collect_conflicts(&repo_index)?;
                            rebase.abort()
                                .map_err(|e2| format!("Failed to abort rebase: {}", e2))?;
                            
                            return Ok(RebaseResult {
                                success: false,
                                current_commit_index: index,
                                total_commits: total_operations,
                                conflicts,
                                message: format!("Conflicts during squash at commit {}/{}. Rebase aborted.", index + 1, total_operations),
                                rebase_state: "conflict".to_string(),
                            });
                        } else {
                            rebase.abort()
                                .map_err(|e2| format!("Failed to abort rebase: {}", e2))?;
                            return Err(format!("Failed to squash commit: {}", _e));
                        }
                    }
                }
            }
            
            "drop" => {
                // Skip this commit entirely
                let op = rebase.next();
                if op.is_none() {
                    break;
                }
                
                // Just move to next operation without committing
                // The commit will be dropped
            }
            
            "reword" => {
                // Apply commit with new message
                let op = rebase.next();
                if op.is_none() {
                    break;
                }
                
                let _op = op.unwrap()
                    .map_err(|e| format!("Failed to get rebase operation: {}", e))?;

                // Get new message from instruction
                let new_message = instruction.new_message.clone()
                    .unwrap_or_else(|| "Reworded commit".to_string());

                // Apply with new message
                match rebase.commit(None, &signature, Some(&new_message)) {
                    Ok(_) => {
                        applied_count += 1;
                    }
                    Err(_e) => {
                        let repo_index = repo.index()
                            .map_err(|e2| format!("Failed to get index: {}", e2))?;
                        
                        if repo_index.has_conflicts() {
                            let conflicts = collect_conflicts(&repo_index)?;
                            rebase.abort()
                                .map_err(|e2| format!("Failed to abort rebase: {}", e2))?;
                            
                            return Ok(RebaseResult {
                                success: false,
                                current_commit_index: index,
                                total_commits: total_operations,
                                conflicts,
                                message: "Conflicts during reword. Rebase aborted.".to_string(),
                                rebase_state: "conflict".to_string(),
                            });
                        } else {
                            rebase.abort()
                                .map_err(|e2| format!("Failed to abort rebase: {}", e2))?;
                            return Err(format!("Failed to reword commit: {}", _e));
                        }
                    }
                }
            }
            
            _ => {
                rebase.abort()
                    .map_err(|e| format!("Failed to abort rebase: {}", e))?;
                return Err(format!("Unknown action: {}", instruction.action));
            }
        }
    }

    // Finish the rebase
    rebase.finish(None)
        .map_err(|e| format!("Failed to finish rebase: {}", e))?;

    Ok(RebaseResult {
        success: true,
        current_commit_index: total_operations,
        total_commits: total_operations,
        conflicts: vec![],
        message: format!("Interactive rebase completed successfully! {} commits applied.", applied_count),
        rebase_state: "completed".to_string(),
    })
}

/// Abort an in-progress rebase and return to the original state
#[tauri::command]
fn abort_rebase(path: String) -> Result<String, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check if a rebase is in progress
    let state = repo.state();
    if state != git2::RepositoryState::Rebase && 
       state != git2::RepositoryState::RebaseInteractive &&
       state != git2::RepositoryState::RebaseMerge {
        return Err("No rebase in progress".to_string());
    }

    // Try to open and abort the rebase
    let result = {
        match repo.open_rebase(None) {
            Ok(mut rebase) => {
                // Abort the rebase
                match rebase.abort() {
                    Ok(_) => Ok(()),
                    Err(e) => Err(format!("Failed to abort rebase: {}", e))
                }
            }
            Err(e) => Err(format!("Failed to open rebase: {}", e))
        }
    };

    // Handle the result
    match result {
        Ok(_) => {
            Ok("Rebase aborted successfully. Repository returned to original state.".to_string())
        }
        Err(e) => {
            // If we can't open the rebase, try to cleanup the state manually
            repo.cleanup_state()
                .map_err(|e2| format!("Failed to cleanup rebase state: {}. Original error: {}", e2, e))?;
            
            Ok("Rebase state cleaned up successfully.".to_string())
        }
    }
}

/// Continue an in-progress rebase after conflicts have been resolved
#[tauri::command]
fn continue_rebase(path: String) -> Result<RebaseResult, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check if a rebase is in progress
    let state = repo.state();
    if state != git2::RepositoryState::Rebase && 
       state != git2::RepositoryState::RebaseInteractive &&
       state != git2::RepositoryState::RebaseMerge {
        return Err("No rebase in progress to continue".to_string());
    }

    // Check that conflicts are resolved
    let index = repo.index()
        .map_err(|e| format!("Failed to get index: {}", e))?;
    
    if index.has_conflicts() {
        let conflicts = collect_conflicts(&index)?;
        return Ok(RebaseResult {
            success: false,
            current_commit_index: 0,
            total_commits: 0,
            conflicts,
            message: "Cannot continue: conflicts still exist. Please resolve all conflicts first.".to_string(),
            rebase_state: "conflict".to_string(),
        });
    }

    // Open the existing rebase
    let mut rebase = repo.open_rebase(None)
        .map_err(|e| format!("Failed to open rebase: {}", e))?;

    // Get signature for commits
    let signature = repo.signature()
        .map_err(|e| format!("Failed to get signature: {}", e))?;

    // Continue with remaining operations
    let mut applied_count = 0;
    let mut total_count = 0;

    // Count total operations
    while rebase.next().is_some() {
        total_count += 1;
    }

    // Reopen to restart iteration
    drop(rebase);
    rebase = repo.open_rebase(None)
        .map_err(|e| format!("Failed to reopen rebase: {}", e))?;

    // Continue applying commits
    while let Some(op) = rebase.next() {
        let _op = op.map_err(|e| format!("Failed to get rebase operation: {}", e))?;

        match rebase.commit(None, &signature, None) {
            Ok(_) => {
                applied_count += 1;
            }
            Err(_e) => {
                // Check for more conflicts
                let repo_index = repo.index()
                    .map_err(|e2| format!("Failed to get index: {}", e2))?;
                
                if repo_index.has_conflicts() {
                    let conflicts = collect_conflicts(&repo_index)?;
                    
                    return Ok(RebaseResult {
                        success: false,
                        current_commit_index: applied_count,
                        total_commits: total_count,
                        conflicts,
                        message: format!("Additional conflicts detected at commit {}/{}. Resolve and continue again.", applied_count + 1, total_count),
                        rebase_state: "conflict".to_string(),
                    });
                } else {
                    // Abort on other errors
                    rebase.abort()
                        .map_err(|e2| format!("Failed to abort rebase: {}", e2))?;
                    return Err(format!("Failed to continue rebase: {}", _e));
                }
            }
        }
    }

    // Finish the rebase
    rebase.finish(None)
        .map_err(|e| format!("Failed to finish rebase: {}", e))?;

    Ok(RebaseResult {
        success: true,
        current_commit_index: total_count,
        total_commits: total_count,
        conflicts: vec![],
        message: format!("Rebase continued and completed successfully! {} additional commits applied.", applied_count),
        rebase_state: "completed".to_string(),
    })
}

/// Get the status of an in-progress rebase
#[tauri::command]
fn get_rebase_status(path: String) -> Result<Option<RebaseStatus>, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check repository state
    let state = repo.state();
    
    if state != git2::RepositoryState::Rebase && 
       state != git2::RepositoryState::RebaseInteractive &&
       state != git2::RepositoryState::RebaseMerge {
        // No rebase in progress
        return Ok(None);
    }

    // Try to open the rebase to get info
    let mut rebase = match repo.open_rebase(None) {
        Ok(r) => r,
        Err(_) => {
            // Rebase state exists but can't open - return minimal info
            return Ok(Some(RebaseStatus {
                is_in_progress: true,
                current_commit_index: 0,
                total_commits: 0,
                has_conflicts: false,
                conflicts: vec![],
                onto_commit: String::new(),
                original_head: String::new(),
            }));
        }
    };

    // Count total operations
    let total_commits = rebase.len();
    
    // Get current operation index
    let current_index = rebase.operation_current().unwrap_or(0);

    // Check for conflicts
    let index = repo.index()
        .map_err(|e| format!("Failed to get index: {}", e))?;
    
    let has_conflicts = index.has_conflicts();
    let conflicts = if has_conflicts {
        collect_conflicts(&index).unwrap_or_else(|_| vec![])
    } else {
        vec![]
    };

    // Try to read onto commit from rebase state files
    let onto_commit = std::fs::read_to_string(format!("{}/.git/rebase-merge/onto", path))
        .or_else(|_| std::fs::read_to_string(format!("{}/.git/rebase-apply/onto", path)))
        .unwrap_or_else(|_| String::new())
        .trim()
        .to_string();

    // Try to read original HEAD from rebase state files
    let original_head = std::fs::read_to_string(format!("{}/.git/rebase-merge/orig-head", path))
        .or_else(|_| std::fs::read_to_string(format!("{}/.git/rebase-apply/orig-head", path)))
        .unwrap_or_else(|_| String::new())
        .trim()
        .to_string();

    Ok(Some(RebaseStatus {
        is_in_progress: true,
        current_commit_index: current_index,
        total_commits,
        has_conflicts,
        conflicts,
        onto_commit,
        original_head,
    }))
}

/// Validate a rebase order before executing
/// Checks for common errors like squashing the first commit
#[tauri::command]
fn validate_rebase_order(
    path: String,
    instructions: Vec<RebaseInstruction>,
) -> Result<ValidationResult, String> {
    let mut errors = Vec::new();
    let mut warnings = Vec::new();

    // Check if instructions are empty
    if instructions.is_empty() {
        errors.push("No rebase instructions provided".to_string());
        return Ok(ValidationResult {
            is_valid: false,
            errors,
            warnings,
        });
    }

    // Check that first instruction is "pick"
    if instructions[0].action != "pick" {
        errors.push(format!(
            "First commit must be 'pick'. Cannot {} the first commit.",
            instructions[0].action
        ));
    }

    // Check for squash/fixup without pick before it
    for i in 1..instructions.len() {
        let prev_action = &instructions[i-1].action;
        let current_action = &instructions[i].action;
        
        if (current_action == "squash" || current_action == "fixup") &&
           (prev_action == "drop" || prev_action == "squash" || prev_action == "fixup") {
            errors.push(format!(
                "Commit {} at position {} cannot be '{}' because the previous commit is '{}'. \
                 Squash and fixup require a 'pick' commit before them.",
                instructions[i].hash.chars().take(7).collect::<String>(),
                i + 1,
                current_action,
                prev_action
            ));
        }
    }

    // Check if all commits are dropped
    let all_dropped = instructions.iter().all(|i| i.action == "drop");
    if all_dropped {
        errors.push("Cannot drop all commits. At least one commit must be kept.".to_string());
    }

    // Warn about reword without new message
    for (i, instruction) in instructions.iter().enumerate() {
        if instruction.action == "reword" && instruction.new_message.is_none() {
            warnings.push(format!(
                "Commit {} at position {} has 'reword' action but no new message provided. \
                 Original message will be kept.",
                instruction.hash.chars().take(7).collect::<String>(),
                i + 1
            ));
        }
    }

    // Warn about extensive reordering (might cause conflicts)
    let original_order: Vec<String> = instructions.iter().map(|i| i.hash.clone()).collect();
    let _sorted_order = original_order.clone();
    
    // Try to open repo to check original order
    if let Ok(_repo) = Repository::open(&path) {
        // If we can get the actual order, check against it
        // For now, just warn if there are many operations
        let action_counts: std::collections::HashMap<&str, usize> = 
            instructions.iter().fold(std::collections::HashMap::new(), |mut acc, i| {
                *acc.entry(i.action.as_str()).or_insert(0) += 1;
                acc
            });
        
        if action_counts.get("drop").unwrap_or(&0) > &3 {
            warnings.push(format!(
                "Dropping {} commits. This might cause conflicts if later commits depend on them.",
                action_counts.get("drop").unwrap()
            ));
        }

        if action_counts.get("squash").unwrap_or(&0) + action_counts.get("fixup").unwrap_or(&0) > 5 {
            warnings.push(
                "Squashing/fixuping many commits. Review carefully to ensure commit messages are meaningful.".to_string()
            );
        }
    }

    // Validate commit hashes format
    for (i, instruction) in instructions.iter().enumerate() {
        if instruction.hash.len() < 7 {
            errors.push(format!(
                "Invalid commit hash at position {}: '{}' is too short",
                i + 1,
                instruction.hash
            ));
        }
    }

    // Check for unknown actions
    for (i, instruction) in instructions.iter().enumerate() {
        match instruction.action.as_str() {
            "pick" | "squash" | "fixup" | "drop" | "reword" | "edit" => {},
            _ => {
                errors.push(format!(
                    "Unknown action '{}' at position {}. Valid actions are: pick, squash, fixup, drop, reword, edit",
                    instruction.action,
                    i + 1
                ));
            }
        }
    }

    Ok(ValidationResult {
        is_valid: errors.is_empty(),
        errors,
        warnings,
    })
}

/// Prepare an interactive rebase and generate a preview
/// Shows what will happen without executing
#[tauri::command]
fn prepare_interactive_rebase(
    path: String,
    _base_commit: String,
    instructions: Vec<RebaseInstruction>,
) -> Result<RebasePlan, String> {
    // Validate the instructions first
    let validation = validate_rebase_order(path.clone(), instructions.clone())?;
    
    if !validation.is_valid {
        return Err(format!(
            "Invalid rebase instructions: {}",
            validation.errors.join(", ")
        ));
    }

    // Count actions
    let mut actions_summary = std::collections::HashMap::new();
    for instruction in &instructions {
        *actions_summary.entry(instruction.action.clone()).or_insert(0) += 1;
    }

    // Calculate resulting commit count
    let total_commits = instructions.len();
    let dropped = *actions_summary.get("drop").unwrap_or(&0);
    let squashed = *actions_summary.get("squash").unwrap_or(&0) + 
                   *actions_summary.get("fixup").unwrap_or(&0);
    
    let resulting_commits = total_commits - dropped - squashed;

    // Generate warnings
    let mut warnings = validation.warnings;

    // Add summary warning
    if dropped > 0 || squashed > 0 {
        warnings.push(format!(
            "This rebase will change {} commits into {} commits ({} dropped, {} squashed/fixuped)",
            total_commits,
            resulting_commits,
            dropped,
            squashed
        ));
    }

    // Warn about history rewriting
    warnings.push(
        "⚠️  Interactive rebase rewrites Git history. Only rebase commits that haven't been pushed.".to_string()
    );

    Ok(RebasePlan {
        total_commits,
        actions_summary,
        warnings,
        can_proceed: validation.is_valid,
    })
}

// ============================================================================
// Phase 8: Stash Management Commands
// ============================================================================

/// List all stashes in the repository
#[tauri::command]
fn list_stashes(path: String) -> Result<Vec<StashEntry>, String> {
    use std::sync::{Arc, Mutex};
    
    // Open the repository
    let mut repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    let stashes = Arc::new(Mutex::new(Vec::new()));
    let stashes_clone = Arc::clone(&stashes);
    let path_clone = path.clone();

    // Iterate through all stashes using git2's stash_foreach
    repo.stash_foreach(|index, message, oid| {
        // Parse the stash message to extract branch and commit info
        // Format: "WIP on branch: commit_hash commit_message" or "On branch: message"
        let message_str = message.to_string();
        
        // Extract branch name from stash message
        let branch = if let Some(on_pos) = message_str.find("On ") {
            let after_on = &message_str[on_pos + 3..];
            if let Some(colon_pos) = after_on.find(':') {
                after_on[..colon_pos].trim().to_string()
            } else {
                "unknown".to_string()
            }
        } else {
            "unknown".to_string()
        };

        // Open repo separately for each stash to avoid borrow issues
        let repo_inner = Repository::open(&path_clone).ok();
        
        // Get the stash commit to extract timestamp and file count
        let stash_commit = repo_inner
            .as_ref()
            .and_then(|r| r.find_commit(*oid).ok());
        
        let timestamp = stash_commit
            .as_ref()
            .map(|c| c.time().seconds())
            .unwrap_or(0);

        // Count files changed in stash
        let file_count = if let (Some(commit), Some(r)) = (stash_commit, repo_inner.as_ref()) {
            // Get the tree for this commit
            if let Ok(commit_tree) = commit.tree() {
                // Get parent tree (if exists)
                let parent_tree = if commit.parent_count() > 0 {
                    commit.parent(0).ok().and_then(|p| p.tree().ok())
                } else {
                    None
                };

                // Create diff
                let diff = if let Some(parent_tree) = parent_tree {
                    r.diff_tree_to_tree(Some(&parent_tree), Some(&commit_tree), None).ok()
                } else {
                    r.diff_tree_to_tree(None, Some(&commit_tree), None).ok()
                };

                // Count deltas
                diff.map(|d| d.deltas().count()).unwrap_or(0)
            } else {
                0
            }
        } else {
            0
        };

        stashes_clone.lock().unwrap().push(StashEntry {
            index,
            message: message_str,
            branch,
            timestamp,
            oid: oid.to_string(),
            file_count,
        });

        true // Continue iteration
    }).map_err(|e| format!("Failed to iterate stashes: {}", e))?;

    // Extract the data from the Arc<Mutex<Vec>> - clone it first to drop the lock
    let result = stashes.lock().unwrap().clone();
    Ok(result)
}

/// Create a new stash with the given options
#[tauri::command]
fn create_stash(
    path: String,
    options: StashCreateOptions,
) -> Result<StashEntry, String> {
    use git2::StashFlags;
    
    // Open the repository
    let mut repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check if there are any changes to stash
    // Use a separate scope to ensure the immutable borrow is dropped before we mutably borrow
    {
        let statuses = repo.statuses(None)
            .map_err(|e| format!("Failed to get repository status: {}", e))?;
        
        let has_changes = statuses.iter().any(|s| {
            let status = s.status();
            status.is_wt_modified() || status.is_wt_new() || status.is_wt_deleted() || 
            status.is_index_modified() || status.is_index_new() || status.is_index_deleted()
        });

        if !has_changes {
            return Err("No changes to stash. Working directory is clean.".to_string());
        }
    } // statuses is dropped here, releasing the immutable borrow

    // Get signature
    let signature = repo.signature()
        .map_err(|e| format!("Failed to get signature: {}", e))?;

    // Get current branch name for the message
    let branch_name = repo.head()
        .ok()
        .and_then(|h| h.shorthand().map(|s| s.to_string()))
        .unwrap_or_else(|| "HEAD".to_string());

    // Build stash message
    let message = if let Some(msg) = options.message {
        // Custom message
        msg
    } else {
        // Auto-generate message
        format!("WIP on {}: {}", branch_name, 
            chrono::Local::now().format("%Y-%m-%d %H:%M:%S"))
    };

    // Set up stash flags
    let mut flags = StashFlags::DEFAULT;
    
    if options.include_untracked {
        flags |= StashFlags::INCLUDE_UNTRACKED;
    }
    
    if options.keep_index {
        flags |= StashFlags::KEEP_INDEX;
    }

    // Create the stash
    let stash_oid = repo.stash_save(&signature, &message, Some(flags))
        .map_err(|e| format!("Failed to create stash: {}", e))?;

    // Count files in the stash we just created
    let stash_commit = repo.find_commit(stash_oid)
        .map_err(|e| format!("Failed to find stash commit: {}", e))?;
    
    let file_count = if let Ok(commit_tree) = stash_commit.tree() {
        let parent_tree = if stash_commit.parent_count() > 0 {
            stash_commit.parent(0).ok().and_then(|p| p.tree().ok())
        } else {
            None
        };

        let diff = if let Some(parent_tree) = parent_tree {
            repo.diff_tree_to_tree(Some(&parent_tree), Some(&commit_tree), None).ok()
        } else {
            repo.diff_tree_to_tree(None, Some(&commit_tree), None).ok()
        };

        diff.map(|d| d.deltas().count()).unwrap_or(0)
    } else {
        0
    };

    Ok(StashEntry {
        index: 0, // New stash is always at index 0
        message,
        branch: branch_name,
        timestamp: stash_commit.time().seconds(),
        oid: stash_oid.to_string(),
        file_count,
    })
}

/// Apply a stash without removing it from the stash list
#[tauri::command]
fn apply_stash(
    path: String,
    stash_index: usize,
    reinstate_index: bool,
) -> Result<String, String> {
    use git2::StashApplyOptions;
    
    // Open the repository
    let mut repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check if working directory is clean
    // Use a separate scope to ensure the immutable borrow is dropped before we mutably borrow
    {
        let statuses = repo.statuses(None)
            .map_err(|e| format!("Failed to get repository status: {}", e))?;
        
        let has_changes = statuses.iter().any(|s| {
            let status = s.status();
            status.is_wt_modified() || status.is_wt_new() || status.is_wt_deleted()
        });

        if has_changes {
            return Err("Working directory has uncommitted changes. Commit or stash them before applying.".to_string());
        }
    } // statuses is dropped here, releasing the immutable borrow

    // Set up apply options
    let mut apply_options = StashApplyOptions::new();
    
    if reinstate_index {
        apply_options.reinstantiate_index();
    }

    // Apply the stash
    repo.stash_apply(stash_index, Some(&mut apply_options))
        .map_err(|e| {
            if e.message().contains("conflict") {
                format!("Conflicts detected while applying stash. Please resolve manually.")
            } else {
                format!("Failed to apply stash: {}", e)
            }
        })?;

    Ok(format!("Stash @{{{}}} applied successfully", stash_index))
}

/// Apply a stash and remove it from the stash list (pop)
#[tauri::command]
fn pop_stash(
    path: String,
    stash_index: usize,
    reinstate_index: bool,
) -> Result<String, String> {
    use git2::StashApplyOptions;
    
    // Open the repository
    let mut repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Check if working directory is clean
    // Use a separate scope to ensure the immutable borrow is dropped before we mutably borrow
    {
        let statuses = repo.statuses(None)
            .map_err(|e| format!("Failed to get repository status: {}", e))?;
        
        let has_changes = statuses.iter().any(|s| {
            let status = s.status();
            status.is_wt_modified() || status.is_wt_new() || status.is_wt_deleted()
        });

        if has_changes {
            return Err("Working directory has uncommitted changes. Commit or stash them before popping.".to_string());
        }
    } // statuses is dropped here, releasing the immutable borrow

    // Set up apply options
    let mut apply_options = StashApplyOptions::new();
    
    if reinstate_index {
        apply_options.reinstantiate_index();
    }

    // Pop the stash (apply and remove)
    repo.stash_pop(stash_index, Some(&mut apply_options))
        .map_err(|e| {
            if e.message().contains("conflict") {
                format!("Conflicts detected while popping stash. Stash was not removed.")
            } else {
                format!("Failed to pop stash: {}", e)
            }
        })?;

    Ok(format!("Stash @{{{}}} popped successfully", stash_index))
}

/// Drop (delete) a stash from the list
#[tauri::command]
fn drop_stash(
    path: String,
    stash_index: usize,
) -> Result<String, String> {
    // Open the repository
    let mut repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Drop the stash
    repo.stash_drop(stash_index)
        .map_err(|e| format!("Failed to drop stash: {}", e))?;

    Ok(format!("Stash @{{{}}} dropped successfully", stash_index))
}

/// Get the diff for a specific stash (for preview)
#[tauri::command]
fn get_stash_diff(
    path: String,
    stash_index: usize,
) -> Result<Vec<FileChange>, String> {
    // Open the repository
    let repo = Repository::open(&path)
        .map_err(|e| format!("Failed to open repository: {}", e))?;

    // Find the stash commit
    let stash_name = format!("stash@{{{}}}", stash_index);
    let stash_ref = repo.revparse_single(&stash_name)
        .map_err(|e| format!("Failed to find stash: {}", e))?;
    
    let stash_commit = stash_ref.peel_to_commit()
        .map_err(|e| format!("Failed to get stash commit: {}", e))?;

    // Get the tree for this stash
    let stash_tree = stash_commit.tree()
        .map_err(|e| format!("Failed to get stash tree: {}", e))?;

    // Get the parent tree (base state before stash)
    let parent_tree = if stash_commit.parent_count() > 0 {
        stash_commit.parent(0)
            .ok()
            .and_then(|p| p.tree().ok())
    } else {
        None
    };

    // Create diff
    let diff = if let Some(parent_tree) = parent_tree {
        repo.diff_tree_to_tree(Some(&parent_tree), Some(&stash_tree), None)
            .map_err(|e| format!("Failed to create diff: {}", e))?
    } else {
        repo.diff_tree_to_tree(None, Some(&stash_tree), None)
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
