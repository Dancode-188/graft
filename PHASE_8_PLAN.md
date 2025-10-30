# Phase 8: Stash Management - Implementation Plan

**Goal**: Make saving and restoring work-in-progress effortless and safe  
**Target Version**: v0.8.0  
**Estimated Time**: 1-2 days  
**Status**: 🚀 Starting Now!

---

## 🎯 Overview

Stash management is much simpler than interactive rebase - it's straightforward CRUD operations with a clean UI. We'll build a beautiful, functional stash system that makes working with WIP changes painless.

### Why Stash Management Matters
- Developers frequently need to switch contexts mid-work
- Current solution: messy WIP commits or complex stash commands
- Graft solution: Visual stash management with one-click operations

---

## 📋 Features to Implement

### Core Features (Must Have)
1. ✅ **List All Stashes**
   - Show all stashes in sidebar/panel
   - Display stash message, date, branch
   - Show file count per stash
   - Visual indication of current branch stashes

2. ✅ **Create Stash**
   - Quick stash (auto-generate message)
   - Stash with custom message
   - Option to include untracked files
   - Option to keep staged/unstaged state
   - Visual feedback on success

3. ✅ **Apply Stash**
   - Apply without removing from stash list
   - Show preview of changes before applying
   - Conflict detection and handling
   - Apply to current branch

4. ✅ **Pop Stash**
   - Apply and remove in one operation
   - Same preview as Apply
   - Safe operation with validation

5. ✅ **Drop Stash**
   - Delete single stash with confirmation
   - Cannot be undone warning
   - Show what will be lost

6. ✅ **Preview Stash Contents**
   - Show diff of stashed changes
   - File list with status indicators
   - Reuse existing diff viewer component

### Nice to Have (Phase 8.5 or Phase 10)
- [ ] Search/filter stashes
- [ ] Stash on specific files only
- [ ] Branch stash (create branch from stash)
- [ ] Clear all stashes with confirmation
- [ ] Keyboard shortcuts for stash operations

---

## 🏗️ Architecture Design

### Backend (Rust/Tauri Commands)

```rust
// Tauri Commands Needed (6 total)

#[tauri::command]
fn list_stashes(path: String) -> Result<Vec<StashEntry>, String>
// Returns all stashes with metadata

#[tauri::command]
fn create_stash(path: String, message: Option<String>, include_untracked: bool) -> Result<StashEntry, String>
// Creates new stash with options

#[tauri::command]
fn apply_stash(path: String, stash_index: usize, pop: bool) -> Result<(), String>
// Applies stash, optionally removes it (pop)

#[tauri::command]
fn drop_stash(path: String, stash_index: usize) -> Result<(), String>
// Removes stash from list

#[tauri::command]
fn get_stash_diff(path: String, stash_index: usize) -> Result<Vec<FileDiff>, String>
// Gets diff for preview

#[tauri::command]
fn clear_all_stashes(path: String) -> Result<(), String>
// Removes all stashes (with confirmation on frontend)
```

### Data Structures

```typescript
interface StashEntry {
  index: number;          // Stash index (stash@{0}, stash@{1}, etc.)
  message: string;        // Commit message
  branch: string;         // Branch where stash was created
  timestamp: number;      // Unix timestamp
  oid: string;           // Git OID
  file_count: number;    // Number of files changed
}

interface StashCreateOptions {
  message?: string;
  includeUntracked: boolean;
  keepIndex: boolean;
}

interface StashApplyOptions {
  index: number;
  pop: boolean;          // If true, remove after applying
  reinstateIndex: boolean; // Restore staged state
}
```

### Frontend Components

```
src/components/stash/
├── StashPanel.tsx              # Main stash sidebar
├── StashList.tsx               # List of all stashes
├── StashItem.tsx               # Individual stash row
├── StashCreateModal.tsx        # Create stash dialog
├── StashPreviewModal.tsx       # Preview stash diff
├── StashConfirmModal.tsx       # Confirmation dialogs
└── types.ts                    # TypeScript types
```

---

## 🎨 UI/UX Design

### Layout Option 1: Sidebar (Recommended)
```
┌─────────────────────────────────────────┐
│  Toolbar                                │
├──────────┬──────────────────────────────┤
│          │                              │
│ Stashes  │  Main Content                │
│  (200px) │  (Commit List/Diff/etc)      │
│          │                              │
│ [List]   │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

Pros:
- Always accessible
- Doesn't cover main content
- Consistent with branch management

Cons:
- Takes up horizontal space

### Layout Option 2: Modal
Open stash manager in full-screen modal when needed.

Pros:
- Doesn't take permanent space
- Can be more detailed

Cons:
- Extra click to access
- Less discoverable

**Decision: Use Sidebar (Option 1)** - More accessible, consistent with existing UI

---

## 🎬 Implementation Phases

### Phase 8.1: Backend Foundation (30-45 min)
1. Create `src-tauri/src/git/stash.rs` module
2. Implement all 6 Tauri commands
3. Use `git2` stash APIs
4. Test basic operations in Rust
5. Handle errors gracefully

**Deliverable**: Working Rust commands that can list/create/apply/drop stashes

---

### Phase 8.2: Frontend Components (45-60 min)
1. Create component structure
2. Implement `StashPanel` with empty state
3. Implement `StashList` and `StashItem`
4. Add loading states
5. Wire up to Tauri commands
6. Test basic rendering

**Deliverable**: Can see list of stashes in UI

---

### Phase 8.3: Create Stash Flow (30 min)
1. Implement `StashCreateModal`
2. Quick stash button in toolbar
3. Custom message input
4. Options: include untracked, keep index
5. Success/error feedback
6. Refresh stash list after creation

**Deliverable**: Can create stashes from UI

---

### Phase 8.4: Apply/Pop/Drop Operations (30 min)
1. Add action buttons to `StashItem`
2. Implement apply (with confirmation)
3. Implement pop (with confirmation)
4. Implement drop (with strong confirmation)
5. Handle conflicts gracefully
6. Success/error feedback

**Deliverable**: Can apply, pop, and drop stashes

---

### Phase 8.5: Preview Modal (30 min)
1. Implement `StashPreviewModal`
2. Reuse existing diff viewer
3. Show file list with changes
4. Apply/Pop buttons in modal
5. Close/cancel option

**Deliverable**: Can preview stash contents before applying

---

### Phase 8.6: Polish & Testing (30-45 min)
1. Empty state when no stashes
2. Loading states during operations
3. Error handling and user feedback
4. Keyboard shortcuts (optional)
5. Animations and transitions
6. Comprehensive manual testing
7. Edge case handling

**Deliverable**: Production-ready stash management

---

## 🎯 Success Criteria

Phase 8 is complete when:

### Functionality
- [x] Can list all stashes with metadata
- [x] Can create stash with custom message
- [x] Can apply stash without removing
- [x] Can pop stash (apply + remove)
- [x] Can drop stash with confirmation
- [x] Can preview stash contents
- [x] Handles conflicts gracefully
- [x] Never lose stashed data

### User Experience
- [x] Stash panel is intuitive
- [x] Operations are one-click
- [x] Confirmations prevent mistakes
- [x] Loading states are clear
- [x] Error messages are helpful
- [x] Empty states guide users

### Quality
- [x] No console errors
- [x] Fast operations (<500ms)
- [x] Works with 50+ stashes
- [x] Consistent design language
- [x] Responsive UI
- [x] Accessible (keyboard navigation)

---

## 🧪 Testing Plan

### Manual Testing Checklist
1. **Create Stash**
   - [ ] Quick stash (auto message)
   - [ ] Custom message
   - [ ] With untracked files
   - [ ] With staged changes
   - [ ] Empty working directory (should fail gracefully)

2. **List Stashes**
   - [ ] Shows all stashes
   - [ ] Correct metadata (message, branch, date)
   - [ ] File counts are accurate
   - [ ] Scrolls smoothly with many stashes

3. **Apply Stash**
   - [ ] Applies correctly
   - [ ] Keeps stash in list
   - [ ] Handles conflicts
   - [ ] Updates working directory

4. **Pop Stash**
   - [ ] Applies and removes
   - [ ] Confirmation works
   - [ ] Handles conflicts
   - [ ] Refreshes list

5. **Drop Stash**
   - [ ] Confirmation modal appears
   - [ ] Successfully removes
   - [ ] Cannot undo (test cancellation)
   - [ ] List updates

6. **Preview**
   - [ ] Shows accurate diff
   - [ ] File list is correct
   - [ ] Can apply from preview
   - [ ] Can cancel

7. **Edge Cases**
   - [ ] No stashes (empty state)
   - [ ] Many stashes (50+)
   - [ ] Conflicts during apply
   - [ ] Network/disk errors
   - [ ] Switch repos while stash panel open

---

## 🎨 Design Guidelines

### Colors
- Stash items: `bg-zinc-800/50` (consistent with commits)
- Hover: `hover:bg-zinc-800`
- Selected: `bg-zinc-700`
- Apply button: `bg-graft-500` (green)
- Drop button: `bg-red-900/50` (red, destructive)

### Icons
- Create stash: 💾 or 📦
- Apply: ✅ or ↓
- Pop: ⚡ or ↓🗑️
- Drop: 🗑️ or ✕
- Preview: 👁️ or 📄

### Typography
- Stash message: `text-sm text-zinc-200`
- Branch: `text-xs text-zinc-500 font-mono`
- Date: `text-xs text-zinc-400`

---

## 🚀 Getting Started

### Step 1: Create Backend Module
Let's start with the Rust backend. We'll create a new module for stash operations:

```bash
# Create the stash module
touch src-tauri/src/git/stash.rs
```

Then implement the 6 commands using git2 APIs.

### Step 2: Create Frontend Structure
```bash
# Create component directory
mkdir src/components/stash

# Create component files
touch src/components/stash/StashPanel.tsx
touch src/components/stash/StashList.tsx
touch src/components/stash/StashItem.tsx
touch src/components/stash/StashCreateModal.tsx
touch src/components/stash/StashPreviewModal.tsx
touch src/components/stash/types.ts
touch src/components/stash/index.ts
```

### Step 3: Wire Up Components
Add stash panel to main App.tsx layout.

---

## 📝 Notes

### Git Stash Basics
- Stashes are identified by index: `stash@{0}`, `stash@{1}`, etc.
- `stash@{0}` is always the most recent
- Stash indices shift when stashes are dropped
- Stashes are local (never pushed/pulled)
- Stash message format: "WIP on [branch]: [commit] [message]"

### git2 APIs to Use
```rust
// List stashes
repo.stash_foreach(callback)

// Create stash
repo.stash_save()

// Apply stash
repo.stash_apply()

// Pop stash
repo.stash_pop()

// Drop stash
repo.stash_drop()
```

---

## 🎉 Expected Outcome

By the end of Phase 8, users will:
- Have a beautiful stash panel always accessible
- Create stashes with one click
- Preview what's in any stash
- Apply/pop/drop with confidence
- Never lose work-in-progress
- Feel empowered to context-switch fearlessly

**Phase 8 will make stashing a joy instead of a chore!** 💾✨

---

*Let's build this!*
