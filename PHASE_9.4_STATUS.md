# Phase 9.4: Context Menus - Status Report

**Date**: November 2, 2025  
**Status**: ~50% Complete - Enhancement Needed

---

## ✅ What's Already Implemented

### 1. Commit Context Menu ✅ (Basic)
**Location**: `App.tsx` lines 1547-1563

**Current Implementation:**
- Right-click on commits works
- Single action: "Interactive Rebase from Here"
- Clean UI with proper positioning
- Click-outside to close

**Code:**
```typescript
const [contextMenu, setContextMenu] = useState<{ x: number; y: number; commit: Commit } | null>(null);

const handleCommitContextMenu = (commit: Commit, x: number, y: number) => {
  setContextMenu({ x, y, commit });
};

const handleContextMenuAction = (action: 'rebase') => {
  if (!contextMenu) return;
  if (action === 'rebase') {
    handleOpenRebaseModal(contextMenu.commit.hash);
  }
  setContextMenu(null);
};
```

**Missing Actions:**
- Checkout commit (detached HEAD)
- Cherry-pick commit
- Revert commit
- Copy commit hash
- Copy commit message
- View commit on GitHub/GitLab (if remote configured)

---

### 2. Branch Context Menu ✅ (Complete!)
**Location**: `BranchSidebar.tsx` lines 274-308

**Implemented Actions:**
- ↪️ Switch to branch (if not current)
- ✏️ Rename branch
- 🗑️ Delete branch (if not current)

**Features:**
- Context menu only for local branches (not remote)
- Current branch can't be deleted
- Clean UI with proper styling
- Proper event handling

**This is already perfect and doesn't need changes!**

---

### 3. Stash Context Menu ❌ (Not Implemented)
**Location**: `StashPanel.tsx` and `StashItem.tsx`

**Needed Actions:**
- Apply stash
- Pop stash
- Drop stash
- Preview stash
- Copy stash ID

---

### 4. File Context Menu ❌ (Not Implemented)
**Location**: `FileListItem.tsx` in staging area

**Needed Actions:**
- Stage file (if unstaged)
- Unstage file (if staged)
- Discard changes
- View diff
- Open in editor (external)
- Copy file path

---

## 🎯 What Needs to Be Done

### Priority 1: Enhance Commit Context Menu (30 minutes)

Add more actions to the existing commit context menu:

```typescript
// Expand the action type
type CommitContextAction = 'rebase' | 'checkout' | 'cherrypick' | 'revert' | 'copyHash' | 'copyMessage';

// Add handlers
const handleContextMenuAction = (action: CommitContextAction) => {
  if (!contextMenu) return;
  
  switch (action) {
    case 'rebase':
      handleOpenRebaseModal(contextMenu.commit.hash);
      break;
    case 'checkout':
      // Checkout commit (detached HEAD)
      handleCheckoutCommit(contextMenu.commit.hash);
      break;
    case 'cherrypick':
      // Cherry-pick commit
      handleCherryPick(contextMenu.commit.hash);
      break;
    case 'revert':
      // Revert commit
      handleRevertCommit(contextMenu.commit.hash);
      break;
    case 'copyHash':
      navigator.clipboard.writeText(contextMenu.commit.hash);
      break;
    case 'copyMessage':
      navigator.clipboard.writeText(contextMenu.commit.message);
      break;
  }
  
  setContextMenu(null);
};
```

**UI Updates:**
```tsx
{/* Context Menu for Commits */}
{contextMenu && (
  <div className="fixed z-50 bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl py-1 min-w-[200px]" ...>
    <button onClick={() => handleContextMenuAction('rebase')} ...>
      🔀 Interactive Rebase from Here
    </button>
    <button onClick={() => handleContextMenuAction('checkout')} ...>
      ↪️ Checkout Commit
    </button>
    <button onClick={() => handleContextMenuAction('cherrypick')} ...>
      🍒 Cherry-pick
    </button>
    <button onClick={() => handleContextMenuAction('revert')} ...>
      ⎌ Revert Commit
    </button>
    <div className="h-px bg-zinc-700 my-1" /> {/* Divider */}
    <button onClick={() => handleContextMenuAction('copyHash')} ...>
      📋 Copy Hash
    </button>
    <button onClick={() => handleContextMenuAction('copyMessage')} ...>
      📝 Copy Message
    </button>
  </div>
)}
```

---

### Priority 2: Add Stash Context Menu (15 minutes)

**In StashItem.tsx:**
```typescript
interface StashItemProps {
  stash: StashEntry;
  onApply: (index: number) => void;
  onPop: (index: number) => void;
  onDrop: (index: number) => void;
  onPreview: (stash: StashEntry) => void;
  onContextMenu?: (stash: StashEntry, x: number, y: number) => void;
}
```

**In StashPanel.tsx:**
```typescript
const [contextMenu, setContextMenu] = useState<{ x: number; y: number; stash: StashEntry } | null>(null);

const handleStashContextMenu = (stash: StashEntry, x: number, y: number) => {
  setContextMenu({ x, y, stash });
};

const handleContextAction = (action: 'apply' | 'pop' | 'drop' | 'preview' | 'copyId') => {
  if (!contextMenu) return;
  
  switch (action) {
    case 'apply':
      handleApply(contextMenu.stash.index);
      break;
    case 'pop':
      handlePop(contextMenu.stash.index);
      break;
    case 'drop':
      handleDrop(contextMenu.stash.index);
      break;
    case 'preview':
      setPreviewStash(contextMenu.stash);
      break;
    case 'copyId':
      navigator.clipboard.writeText(`stash@{${contextMenu.stash.index}}`);
      break;
  }
  
  setContextMenu(null);
};
```

---

### Priority 3: Add File Context Menu (15 minutes)

**In StagingArea.tsx:**
```typescript
const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileStatus; isStaged: boolean } | null>(null);

const handleFileContextMenu = (file: FileStatus, isStaged: boolean, x: number, y: number) => {
  setContextMenu({ x, y, file, isStaged });
};

const handleFileContextAction = (action: 'stage' | 'unstage' | 'discard' | 'viewDiff' | 'copyPath') => {
  if (!contextMenu) return;
  
  switch (action) {
    case 'stage':
      handleStageFile(contextMenu.file.path);
      break;
    case 'unstage':
      handleUnstageFile(contextMenu.file.path);
      break;
    case 'discard':
      if (confirm(`Discard changes to ${contextMenu.file.path}?`)) {
        handleDiscardFile(contextMenu.file.path);
      }
      break;
    case 'viewDiff':
      // Open diff viewer
      handleViewDiff(contextMenu.file.path);
      break;
    case 'copyPath':
      navigator.clipboard.writeText(contextMenu.file.path);
      break;
  }
  
  setContextMenu(null);
};
```

**Update FileListItem.tsx:**
```typescript
interface FileListItemProps {
  file: FileStatus;
  onStage?: () => void;
  onUnstage?: () => void;
  onSelect?: () => void;
  onContextMenu?: (x: number, y: number) => void;
}

// In render:
<div
  onContextMenu={(e) => {
    e.preventDefault();
    onContextMenu?.(e.clientX, e.clientY);
  }}
  ...
>
```

---

## 📋 Implementation Checklist

### Commit Context Menu Enhancement
- [ ] Update action type to include all actions
- [ ] Add handler functions (checkout, cherry-pick, revert)
- [ ] Update handleContextMenuAction switch
- [ ] Add Rust backend commands if needed
- [ ] Update UI with all menu items
- [ ] Add dividers for organization
- [ ] Test all actions

### Stash Context Menu
- [ ] Add context menu state to StashPanel
- [ ] Add onContextMenu prop to StashItem
- [ ] Implement handleStashContextMenu
- [ ] Implement handleContextAction
- [ ] Render context menu UI
- [ ] Wire up existing stash operations
- [ ] Add copy ID functionality
- [ ] Test all actions

### File Context Menu
- [ ] Add context menu state to StagingArea
- [ ] Add onContextMenu prop to FileListItem
- [ ] Implement handleFileContextMenu
- [ ] Implement handleFileContextAction
- [ ] Implement discard confirmation
- [ ] Render context menu UI
- [ ] Test all actions

---

## 🎯 Estimated Time

| Task | Time |
|------|------|
| Enhance Commit Context Menu | 30 min |
| Add Stash Context Menu | 15 min |
| Add File Context Menu | 15 min |
| **Total** | **~60 min** |

---

## 🎨 Design Guidelines

All context menus should:
- Use consistent styling (bg-zinc-900, border-zinc-700)
- Have proper z-index (z-50)
- Include emoji icons for visual appeal
- Use hover states (hover:bg-zinc-800)
- Include keyboard shortcuts hints where applicable
- Have dividers to separate action groups
- Close on click outside or action execution

---

## 🚀 Recommendation

**Start with Priority 1** (Enhance Commit Context Menu) because:
1. Commits are the most frequently interacted with
2. Already have the infrastructure in place
3. Will provide the most value to users
4. Can reuse patterns for stash and file menus

Then add stash and file context menus to complete Phase 9.4.

Would you like me to start implementing these enhancements now?
