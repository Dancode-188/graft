use git2::Repository;
use serde::Serialize;
use std::path::Path;

#[derive(Debug, Serialize)]
struct RepoInfo {
    name: String,
    path: String,
    current_branch: String,
    is_bare: bool,
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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .invoke_handler(tauri::generate_handler![open_repository])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
