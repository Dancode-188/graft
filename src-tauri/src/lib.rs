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
struct CommitResult {
    success: bool,
    commit_hash: String,
    message: String,
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
            get_file_diff
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
