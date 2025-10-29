# Phase 5: Branching Implementation Plan

## Overview
Add comprehensive branch management UI and Rust backend commands.

## Backend Commands (Rust)

### 1. `get_branches` ✅ TO IMPLEMENT
List all branches with metadata:
- Local and remote branches
- Current branch indicator
- Last commit info
- Tracking information

**Return Type:**
```rust
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
```

### 2. `create_branch` ✅ TO IMPLEMENT
Create a new branch from current HEAD or specific commit
- Validate branch name
- Check if branch already exists
- Create branch
- Optionally checkout immediately

**Parameters:**
- `path: String` - repo path
- `branch_name: String` - new branch name
- `start_point: Option<String>` - commit hash/branch to start from
- `checkout: bool` - switch to new branch after creation

### 3. `switch_branch` ✅ TO IMPLEMENT
Switch to a different branch
- Handle uncommitted changes (warn user)
- Update working directory
- Update HEAD

**Parameters:**
- `path: String` - repo path
- `branch_name: String` - branch to switch to

### 4. `delete_branch` ✅ TO IMPLEMENT
Delete a branch (with safety checks)
- Cannot delete current branch
- Warn if unmerged changes
- Force option for unmerged branches

**Parameters:**
- `path: String` - repo path
- `branch_name: String` - branch to delete
- `force: bool` - force delete even if unmerged

### 5. `rename_branch` ✅ TO IMPLEMENT
Rename a branch
- Validate new name
- Check if new name already exists
- Update references

**Parameters:**
- `path: String` - repo path
- `old_name: String` - current branch name
- `new_name: String` - new branch name

## Frontend Components

### 1. Branch Sidebar (New Component) ✅ TO IMPLEMENT
**File:** `src/components/BranchSidebar.tsx`

**Features:**
- Collapsible branch list
- Local branches section
- Remote branches section (collapsed by default)
- Current branch highlighted
- Branch search/filter
- Context menu on right-click
- Keyboard navigation

**UI Layout:**
```
┌─ Branches ────────────┐
│ 🔍 Search branches... │
│ ─────────────────────│
│ 📁 LOCAL (5)          │
│   🌿 main *          │
│   🌿 feature/auth    │
│   🌿 bugfix/login    │
│ ─────────────────────│
│ 📁 REMOTE (3) ▶      │
└──────────────────────┘
```

### 2. Branch Creation Modal ✅ TO IMPLEMENT
**File:** `src/components/BranchModal.tsx`

**Features:**
- Create new branch
- Choose start point (current HEAD, specific commit, or another branch)
- "Checkout after creation" checkbox
- Branch name validation
- Show where branch will be created from

### 3. Branch Context Menu ✅ TO IMPLEMENT
**File:** `src/components/BranchContextMenu.tsx`

**Actions:**
- Switch to branch
- Create branch from here
- Rename branch
- Delete branch
- Copy branch name

### 4. Update App.tsx ✅ TO IMPLEMENT
Add branch sidebar to main UI:
- Toggle sidebar with keyboard shortcut (`Cmd+B`)
- Save sidebar state to localStorage
- Integrate with existing layout

## UI Layout Update

### Current:
```
┌─────────────────────────────────────┐
│ Header                              │
├─────────────┬───────────────────────┤
│             │                       │
│   Commits   │    Details/Staging    │
│     +       │                       │
│   Graph     │                       │
│             │                       │
└─────────────┴───────────────────────┘
```

### New with Branch Sidebar:
```
┌─────────────────────────────────────┐
│ Header                              │
├────────┬────────────┬───────────────┤
│        │            │               │
│Branches│  Commits   │Details/Staging│
│        │    +       │               │
│ (240px)│  Graph     │               │
│        │            │               │
└────────┴────────────┴───────────────┘
```

## Keyboard Shortcuts

- `Cmd+B` / `Ctrl+B` - Toggle branch sidebar
- `Cmd+N` / `Ctrl+N` - New branch
- `Cmd+Shift+B` - Branch search
- `Enter` - Switch to selected branch
- `F2` - Rename selected branch
- `Delete` - Delete selected branch (with confirmation)
- `↑↓` - Navigate branches
- `Escape` - Close modal/deselect

## Implementation Steps

### Phase 5.1: Backend Commands (Day 1)
1. Implement `get_branches` command
2. Implement `create_branch` command
3. Implement `switch_branch` command
4. Test basic branch operations

### Phase 5.2: Backend Commands (Day 1 continued)
5. Implement `delete_branch` command
6. Implement `rename_branch` command
7. Test all branch operations together

### Phase 5.3: Branch Sidebar UI (Day 2)
8. Create BranchSidebar component
9. Add search/filter functionality
10. Implement keyboard navigation
11. Style with Tailwind (match current design)

### Phase 5.4: Branch Modals (Day 2 continued)
12. Create BranchModal component
13. Add branch name validation
14. Implement confirmation dialogs

### Phase 5.5: Integration (Day 3)
15. Update App.tsx with sidebar
16. Add keyboard shortcuts
17. Implement localStorage persistence
18. Test full workflow

### Phase 5.6: Polish (Day 3 continued)
19. Add animations/transitions
20. Error handling and user feedback
21. Update status bar with branch info
22. Comprehensive testing

## Success Criteria
- ✅ Can view all local and remote branches
- ✅ Can create new branch from any commit/branch
- ✅ Can switch branches quickly
- ✅ Can rename branches
- ✅ Can delete branches (with safety checks)
- ✅ Branch list updates in real-time
- ✅ Keyboard shortcuts work smoothly
- ✅ UI is intuitive and beautiful
- ✅ No git errors or crashes

## Testing Checklist
- [ ] Create branch from HEAD
- [ ] Create branch from specific commit
- [ ] Switch between multiple branches
- [ ] Rename current branch
- [ ] Rename non-current branch
- [ ] Delete merged branch
- [ ] Try to delete unmerged branch (should warn)
- [ ] Force delete unmerged branch
- [ ] Try to delete current branch (should fail)
- [ ] Search branches with filter
- [ ] Keyboard navigation works
- [ ] Branch list updates after operations

## Notes
- Use git2-rs for all Git operations
- Match visual style of existing UI (dark theme, graft-green accent)
- Handle errors gracefully with helpful messages
- Add loading states for branch operations
- Consider adding "upstream" tracking info later (Phase 6)
