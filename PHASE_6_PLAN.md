# Phase 6: Push/Pull/Fetch - Implementation Plan

**Goal:** Enable remote repository operations with excellent UX and robust error handling

**Status:** 📋 Planning Phase  
**Target Completion:** v0.5.0  
**Estimated Complexity:** High (Authentication, Progress, Error Handling)

---

## 🔍 Research Findings

### What We Learned from Popular Git GUIs:

**GitKraken:**
- One-click push/pull buttons in toolbar
- Integrates OAuth for GitHub/GitLab/Bitbucket
- Shows progress with "Resolving deltas X/Y" messaging
- Warns when force push would overwrite remote commits
- Clear error messages guide users to solutions

**Tower:**
- Force push requires explicit confirmation dialog
- Warns: "Remote has newer commits - force push will overwrite"
- Uses `--force-with-lease` for safer force pushing
- Progress indicators show transfer status in real-time

**SourceTree & Fork:**
- Simple push/pull buttons always visible
- Credential helpers integrate with OS keychain
- Shows "X commits ahead, Y commits behind" status
- Conflict detection happens immediately after pull

### Key UX Patterns:
1. **Always show push/pull status** (ahead/behind indicators)
2. **Progress must be visible** - users hate wondering if it's stuck
3. **Force push needs confirmation** - with clear warnings
4. **Conflicts should be detected, not resolved** (Phase 6 scope)
5. **Credentials should be OS-integrated** (SSH keys, keychain)

---

## 📊 Technical Architecture

### Backend Commands (Rust - `src-tauri/src/lib.rs`)

We'll implement **5 new Tauri commands**:

#### 1. `get_remote_status` ✨
Returns current push/pull status

**Signature:**
```rust
#[tauri::command]
fn get_remote_status(path: String, branch: String) -> Result<RemoteStatus, String>
```

**Returns:**
```rust
struct RemoteStatus {
    has_remote: bool,
    remote_name: String,
    remote_url: String,
    ahead: usize,      // Commits ahead of remote
    behind: usize,     // Commits behind remote
    up_to_date: bool,
}
```

**Logic:**
- Find upstream branch for current branch
- Compare HEAD with remote branch
- Count ahead/behind commits using `git2::Graph::ahead_behind()`

---

#### 2. `fetch_from_remote` 🔄
Fetches updates from remote without merging

**Signature:**
```rust
#[tauri::command]
async fn fetch_from_remote(
    path: String, 
    remote_name: String,
    progress_callback: Channel<FetchProgress>
) -> Result<FetchResult, String>
```

**Returns:**
```rust
struct FetchResult {
    success: bool,
    bytes_received: usize,
    objects_received: usize,
    message: String,
}

struct FetchProgress {
    stage: String,           // "Receiving", "Resolving", "Done"
    received_objects: u32,
    total_objects: u32,
    received_bytes: usize,
    indexed_deltas: u32,
    total_deltas: u32,
}
```

**Implementation Strategy:**
- Use `git2::RemoteCallbacks` for progress
- Set up `transfer_progress` callback
- Stream progress to frontend via Tauri channels
- Handle SSH/HTTPS authentication

**Example (from git2-rs):**
```rust
let mut callbacks = RemoteCallbacks::new();
callbacks.transfer_progress(|stats| {
    if stats.received_objects() == stats.total_objects() {
        println!("Resolving deltas {}/{}", 
            stats.indexed_deltas(), 
            stats.total_deltas()
        );
    } else if stats.total_objects() > 0 {
        println!("Received {}/{} objects ({}) in {} bytes",
            stats.received_objects(),
            stats.total_objects(),
            stats.indexed_objects(),
            stats.received_bytes()
        );
    }
    true // Continue operation
});
```

---

#### 3. `pull_from_remote` ⬇️
Fetch + merge (or rebase) in one operation

**Signature:**
```rust
#[tauri::command]
async fn pull_from_remote(
    path: String,
    remote_name: String,
    strategy: PullStrategy, // Merge or Rebase
    progress_callback: Channel<FetchProgress>
) -> Result<PullResult, String>
```

**Returns:**
```rust
enum PullStrategy {
    Merge,
    Rebase,
}

struct PullResult {
    success: bool,
    conflicts: Vec<ConflictFile>,
    commits_received: usize,
    message: String,
}

struct ConflictFile {
    path: String,
    conflict_type: String, // "content", "delete/modify", etc.
}
```

**Logic:**
1. Fetch from remote (reuse fetch logic)
2. Check for conflicts BEFORE merging
3. If no conflicts: perform merge/rebase
4. If conflicts: return conflict list (don't auto-resolve)
5. Update HEAD

**Safety Checks:**
- Verify working directory is clean
- Warn if pull would overwrite uncommitted changes

---

#### 4. `push_to_remote` ⬆️
Push commits to remote repository

**Signature:**
```rust
#[tauri::command]
async fn push_to_remote(
    path: String,
    remote_name: String,
    branch_name: String,
    force: bool,
    force_with_lease: bool,
    progress_callback: Channel<PushProgress>
) -> Result<PushResult, String>
```

**Returns:**
```rust
struct PushResult {
    success: bool,
    rejected: bool,          // True if push was rejected
    rejection_reason: String, // e.g., "non-fast-forward"
    bytes_sent: usize,
    message: String,
}

struct PushProgress {
    stage: String,        // "Uploading", "Compressing", "Done"
    total: u32,
    current: u32,
    bytes: usize,
}
```

**Logic:**
1. Check if remote is ahead (would be rejected)
2. If force=false and remote ahead: return error
3. If force_with_lease=true: use `--force-with-lease` logic
4. Push with progress callbacks
5. Handle authentication

**Safety Features:**
- NEVER force push without explicit confirmation
- Default to `--force-with-lease` instead of `--force`
- Warn if remote has commits not in local

---

#### 5. `get_remotes` 📡
List all configured remotes

**Signature:**
```rust
#[tauri::command]
fn get_remotes(path: String) -> Result<Vec<Remote>, String>
```

**Returns:**
```rust
struct Remote {
    name: String,
    url: String,
    fetch_url: String,
    push_url: String,
}
```

---

## 🎨 Frontend UI Components

### 1. Remote Status Bar
**Location:** In commit history header (next to "30 commits")

**Display:**
```
Commit History  30 commits  ↑ 3 ahead  ↓ 2 behind  [Fetch] [Pull] [Push]
```

**States:**
- **Up to date:** `✓ Up to date`
- **Ahead only:** `↑ 3 ahead` (green)
- **Behind only:** `↓ 2 behind` (yellow)
- **Ahead & Behind:** `↑ 3 ahead  ↓ 2 behind` (yellow)
- **No remote:** `No remote configured` (gray)

**Interactions:**
- Click "[Fetch]" → Fetches without merging
- Click "[Pull]" → Opens pull confirmation dialog
- Click "[Push]" → Opens push confirmation dialog

---

### 2. Fetch/Pull/Push Buttons
**Location:** In header next to "Open Different Repository"

**Design:**
```
[↻ Fetch]  [⬇ Pull]  [⬆ Push]
```

**Button States:**
- **Enabled:** When remote is configured
- **Disabled:** When no remote or operation in progress
- **Loading:** Shows spinner during operation

---

### 3. Pull Dialog Component
**Component:** `PullDialog.tsx`

**UI:**
```
┌─────────────────────────────────────┐
│   Pull from 'origin/main'          │
├─────────────────────────────────────┤
│                                     │
│   Strategy:                         │
│   ( ) Merge (default)              │
│   (•) Rebase                        │
│                                     │
│   ⚠️  Warning: 2 commits behind     │
│                                     │
│   [Cancel]  [Pull]                  │
└─────────────────────────────────────┘
```

**Features:**
- Shows ahead/behind status
- Let user choose merge vs rebase
- Warns if local has uncommitted changes

---

### 4. Push Dialog Component
**Component:** `PushDialog.tsx`

**UI (Normal Push):**
```
┌─────────────────────────────────────┐
│   Push to 'origin/main'            │
├─────────────────────────────────────┤
│                                     │
│   ✓ 3 commits ready to push        │
│                                     │
│   • feat: new feature              │
│   • fix: bug fix                   │
│   • docs: update readme            │
│                                     │
│   [Cancel]  [Push]                  │
└─────────────────────────────────────┘
```

**UI (Force Push Required):**
```
┌─────────────────────────────────────┐
│   ⚠️  Force Push Required          │
├─────────────────────────────────────┤
│                                     │
│   Remote has 2 newer commits       │
│   Force pushing will OVERWRITE     │
│   these commits.                    │
│                                     │
│   This is a DESTRUCTIVE operation! │
│                                     │
│   [Cancel]  [Force Push]            │
│   (button is RED and requires       │
│    holding for 2 seconds)           │
└─────────────────────────────────────┘
```

---

### 5. Progress Toast Component
**Component:** `ProgressToast.tsx`

**UI:**
```
┌──────────────────────────────────────┐
│  ⬇  Pulling from origin/main...     │
│  ▓▓▓▓▓▓▓░░░░░░░░░░░░  40%          │
│  Receiving objects: 45/112           │
└──────────────────────────────────────┘
```

**Features:**
- Shows current operation (Pull/Push/Fetch)
- Progress bar with percentage
- Stage information (Receiving/Resolving/Compressing)
- Auto-dismisses on completion
- Shows error if operation fails

---

### 6. Conflict Notification
**When:** Pull results in conflicts

**UI:**
```
┌──────────────────────────────────────┐
│  ⚠️  Merge Conflicts Detected        │
├──────────────────────────────────────┤
│  3 files have conflicts:             │
│  • src/App.tsx                       │
│  • src/components/Header.tsx         │
│  • README.md                         │
│                                      │
│  Please resolve conflicts using      │
│  your text editor or merge tool.     │
│                                      │
│  [Open in VS Code]  [Dismiss]        │
└──────────────────────────────────────┘
```

**Note:** We detect conflicts but don't resolve them in Phase 6  
(Conflict resolution = Phase 7 or separate feature)

---

## 🔐 Authentication Strategy

### Option 1: SSH Keys (Recommended Default)
**Why:** Most developers already have SSH keys set up

**Implementation:**
- Use `git2::Cred::ssh_key_from_agent()`
- Let libgit2 use system SSH agent
- Works automatically if user has SSH configured

**Code Example:**
```rust
callbacks.credentials(|_url, username_from_url, _allowed_types| {
    Cred::ssh_key_from_agent(username_from_url.unwrap())
});
```

---

### Option 2: Personal Access Tokens (HTTPS)
**When:** User doesn't have SSH configured

**Implementation:**
- Prompt user for PAT on first push/pull
- Store in OS keychain (macOS Keychain, Windows Credential Manager)
- Reuse for future operations

**Code Example:**
```rust
callbacks.credentials(|_url, username, _allowed_types| {
    let token = get_token_from_keychain()?;
    Cred::userpass_plaintext(username.unwrap_or("git"), &token)
});
```

---

### UI Flow:
1. **First push/pull attempt** → Check if auth needed
2. **If SSH works** → Great! Use it automatically
3. **If SSH fails** → Show "Authentication Required" dialog
4. **Prompt for PAT** → "Paste GitHub/GitLab token here"
5. **Save to keychain** → Never ask again

---

## ⚠️ Error Handling

### Common Errors & Solutions:

| Error | User-Friendly Message | Suggested Action |
|-------|----------------------|------------------|
| Authentication failed | "Unable to authenticate. Check your SSH keys or access token." | [Configure Authentication] |
| Non-fast-forward | "Remote has newer commits. Pull first or force push." | [Pull] [Force Push] |
| Network error | "Cannot reach remote server. Check your internet connection." | [Retry] |
| Merge conflicts | "Conflicts detected in 3 files. Resolve conflicts to continue." | [View Conflicts] |
| No remote configured | "No remote repository configured for this branch." | [Configure Remote] |
| Uncommitted changes | "You have uncommitted changes. Commit or stash before pulling." | [Commit] [Stash] |

---

## 🧪 Testing Checklist

### Backend Tests:
- [ ] Fetch updates from GitHub test repo
- [ ] Pull with merge strategy
- [ ] Pull with rebase strategy
- [ ] Push new commits to remote
- [ ] Force push with `--force-with-lease`
- [ ] Handle authentication errors gracefully
- [ ] Progress callbacks fire correctly
- [ ] Detect merge conflicts before applying

### Frontend Tests:
- [ ] Remote status displays correctly
- [ ] Buttons enable/disable appropriately
- [ ] Pull dialog shows ahead/behind counts
- [ ] Push dialog lists commits to push
- [ ] Force push requires confirmation
- [ ] Progress toast updates in real-time
- [ ] Conflict notification appears
- [ ] Error messages are helpful

### Integration Tests:
- [ ] Test with GitHub repository
- [ ] Test with GitLab repository
- [ ] Test with self-hosted Git server
- [ ] Test SSH authentication
- [ ] Test HTTPS + PAT authentication
- [ ] Test on Windows, macOS, Linux

---

## 📝 Implementation Order (Step by Step)

### Step 1: Remote Status (Foundation) ⭐
**Why first:** Need to know ahead/behind before push/pull

**Backend:**
1. Implement `get_remote_status` command
2. Test with various repo states

**Frontend:**
1. Create `RemoteStatusBar` component
2. Display ahead/behind in commit history header
3. Poll for status every 30 seconds

**Test:** Open repo, verify status is accurate

---

### Step 2: Fetch (Safest Operation) 🔄
**Why second:** Fetch is read-only, safest to implement first

**Backend:**
1. Implement `fetch_from_remote` command
2. Add progress callbacks
3. Handle SSH authentication

**Frontend:**
1. Add [Fetch] button
2. Create `ProgressToast` component
3. Show progress during fetch

**Test:** Fetch from GitHub, verify objects received

---

### Step 3: Pull (Fetch + Merge) ⬇️
**Why third:** Builds on fetch, adds merge logic

**Backend:**
1. Implement `pull_from_remote` command
2. Add conflict detection
3. Test merge vs rebase strategies

**Frontend:**
1. Create `PullDialog` component
2. Show merge/rebase options
3. Display conflicts if detected

**Test:** Pull with no conflicts, pull with conflicts

---

### Step 4: Push (Most Complex) ⬆️
**Why last:** Most dangerous, needs all safety checks

**Backend:**
1. Implement `push_to_remote` command
2. Add force push safety checks
3. Implement `--force-with-lease`

**Frontend:**
1. Create `PushDialog` component
2. Add force push confirmation
3. Show commit list to be pushed

**Test:** Normal push, force push, rejected push

---

### Step 5: Polish & Error Handling ✨
**Final touches:**
1. Improve error messages
2. Add retry logic for network errors
3. Add credential management UI
4. Test all edge cases
5. Update documentation

---

## 🎯 Success Criteria (Definition of Done)

Phase 6 is complete when:

- ✅ Can fetch from GitHub/GitLab without CLI
- ✅ Can pull with merge or rebase
- ✅ Can push commits to remote
- ✅ Force push requires explicit confirmation
- ✅ Progress is visible for all operations
- ✅ Authentication works (SSH + HTTPS)
- ✅ Merge conflicts are detected and reported
- ✅ Error messages guide users to solutions
- ✅ Remote status shows ahead/behind counts
- ✅ All operations work on Windows/macOS/Linux
- ✅ Code is well-documented and tested

---

## 📦 Deliverables

When Phase 6 is done, we'll have:

1. **5 new Rust commands** (fetch, pull, push, status, get_remotes)
2. **4 new React components** (PullDialog, PushDialog, ProgressToast, RemoteStatusBar)
3. **Full authentication flow** (SSH + PAT)
4. **Comprehensive error handling**
5. **v0.5.0 release** 🎉

---

## 🚧 Out of Scope (Future Phases)

These are important but NOT part of Phase 6:

- ❌ Merge conflict resolution UI (Phase 7)
- ❌ Interactive rebase (Phase 7)
- ❌ Stash management (Phase 8)
- ❌ Multi-remote support (Post-MVP)
- ❌ Submodule handling (Post-MVP)
- ❌ Git LFS (Post-MVP)
- ❌ Pull request integration (Post-MVP)

---

## 💡 Notes & Decisions

### Why --force-with-lease instead of --force?
- Safer: Won't overwrite if remote changed
- Industry best practice (Tower, Git docs recommend it)
- Still allows force push when actually needed

### Why detect conflicts but not resolve them?
- Conflict resolution is complex (deserves own phase)
- Phase 6 scope: Get push/pull working
- Users can use text editor for now
- Phase 7 can add visual conflict resolution

### Why Tauri channels for progress?
- Async progress updates from Rust → Frontend
- Real-time UI updates without polling
- Recommended pattern for long-running operations

---

**Created:** October 30, 2025  
**Status:** 📋 Ready for Implementation  
**Next Step:** Implement Step 1 (Remote Status)

Let's build this! 🚀
