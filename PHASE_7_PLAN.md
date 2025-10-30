# Phase 7: Interactive Rebase - Implementation Plan

**Goal:** Build the most intuitive, visual, drag-and-drop interactive rebase UI in existence

**Status:** 📋 Planning Phase  
**Target Completion:** v0.6.0  
**Estimated Complexity:** Very High (Complex Git operations + Advanced UI)

---

## 🔍 Research Findings

### What We Learned from Popular Git GUIs:

**GitKraken (Best in Class):**
- Right-click commit → "Start Interactive Rebase"
- Shows list of commits with drag handles
- Each commit has dropdown: Pick, Squash, Fixup, Reword, Edit, Drop
- Visual feedback when dragging (ghost commit)
- Shows preview of what will happen
- "Start Rebase" button to execute
- Can abort at any time

**Tower:**
- Context menu → "Interactive Rebase..."
- Modal dialog with commit list
- Radio buttons for actions
- Can't drag-and-drop (manual reorder)
- Less intuitive than GitKraken

**Fork:**
- Limited interactive rebase
- Must use CLI for complex operations
- Opportunity for us to be better!

**SourceTree:**
- Interactive rebase exists but clunky
- Not drag-and-drop
- Confusing UI

### Key UX Patterns:
1. **Visual commit list** with drag-and-drop reordering
2. **Action dropdowns** per commit (pick/squash/fixup/etc)
3. **Preview pane** showing what will happen
4. **Clear start/abort buttons**
5. **Conflict resolution** integrated
6. **Undo capability** (abort rebase)

### What Makes Great Interactive Rebase:
- **Feels like editing a todo list** (because it is!)
- **Drag handles are obvious** (≡ icon)
- **Actions are clear** (not Git jargon)
- **Preview before execute** (no surprises)
- **Easy to abort** (big red button)
- **Handles conflicts gracefully** (pause, resolve, continue)

---

## 📊 Technical Architecture

### Backend Commands (Rust - `src-tauri/src/lib.rs`)

We'll implement **7 new Tauri commands**:

#### 1. `get_rebase_commits` 📝
Gets the list of commits that would be rebased

**Signature:**
```rust
#[tauri::command]
fn get_rebase_commits(
    path: String,
    base_commit: String,  // SHA of commit to rebase onto
    branch: String        // Branch to rebase (usually HEAD)
) -> Result<Vec<RebaseCommit>, String>
```

**Returns:**
```rust
struct RebaseCommit {
    hash: String,
    short_hash: String,
    message: String,
    author: String,
    timestamp: i64,
    action: String,  // "pick" (default), "squash", "fixup", "reword", "edit", "drop"
}
```

**Logic:**
- Use `git2::Repository::revwalk()`
- Walk from `branch` to `base_commit`
- Return commits in chronological order (oldest first)
- Default action is "pick" for all

---

#### 2. `prepare_interactive_rebase` 🎬
Prepares the rebase operation (doesn't execute yet)

**Signature:**
```rust
#[tauri::command]
fn prepare_interactive_rebase(
    path: String,
    base_commit: String,
    commits: Vec<RebaseInstruction>
) -> Result<RebasePlan, String>
```

**Input:**
```rust
struct RebaseInstruction {
    hash: String,
    action: String,  // "pick", "squash", "fixup", "reword", "edit", "drop"
    message: Option<String>,  // New message if action is "reword"
}
```

**Returns:**
```rust
struct RebasePlan {
    total_commits: usize,
    actions_summary: HashMap<String, usize>,  // e.g., {"pick": 3, "squash": 2}
    warnings: Vec<String>,  // e.g., "Squashing without picking will fail"
    can_proceed: bool,
}
```

**Validation:**
- First commit must be "pick" (can't squash first commit)
- Can't squash/fixup without a pick before it
- Can't have all commits dropped
- Warn if reordering might cause conflicts

---

#### 3. `start_interactive_rebase` ▶️
Executes the interactive rebase with user's instructions

**Signature:**
```rust
#[tauri::command]
async fn start_interactive_rebase(
    path: String,
    base_commit: String,
    instructions: Vec<RebaseInstruction>,
    progress_callback: Channel<RebaseProgress>
) -> Result<RebaseResult, String>
```

**Returns:**
```rust
struct RebaseResult {
    success: bool,
    current_commit_index: usize,
    total_commits: usize,
    conflicts: Vec<ConflictFile>,
    message: String,
    rebase_state: String,  // "in_progress", "completed", "stopped_for_edit", "conflict"
}

struct RebaseProgress {
    stage: String,  // "Starting", "Applying commit X/Y", "Conflict detected", "Done"
    current: usize,
    total: usize,
    current_commit: String,
}
```

**Logic:**
1. Validate working directory is clean
2. Initialize rebase with `git2::Repository::rebase()`
3. Iterate through operations
4. Apply each instruction (pick, squash, fixup, etc.)
5. Handle conflicts (pause and return conflict info)
6. Stream progress updates
7. Return final result

**Conflict Handling:**
- When conflict detected: pause rebase, return conflict list
- Save rebase state
- User resolves conflicts manually
- Call `continue_rebase` to resume

---

#### 4. `continue_rebase` ⏩
Continues a paused rebase after conflicts are resolved

**Signature:**
```rust
#[tauri::command]
async fn continue_rebase(
    path: String,
    progress_callback: Channel<RebaseProgress>
) -> Result<RebaseResult, String>
```

**Logic:**
- Check conflicts are resolved
- Get existing rebase state
- Continue from where we left off
- Apply remaining commits
- Return final result

---

#### 5. `abort_rebase` ❌
Aborts an in-progress rebase and returns to original state

**Signature:**
```rust
#[tauri::command]
fn abort_rebase(path: String) -> Result<String, String>
```

**Logic:**
- Call `rebase.abort()`
- Return to pre-rebase HEAD
- Clean up rebase state
- Return success message

---

#### 6. `get_rebase_status` 📊
Gets current rebase status (if one is in progress)

**Signature:**
```rust
#[tauri::command]
fn get_rebase_status(path: String) -> Result<Option<RebaseStatus>, String>
```

**Returns:**
```rust
struct RebaseStatus {
    is_in_progress: bool,
    current_commit_index: usize,
    total_commits: usize,
    has_conflicts: bool,
    conflicts: Vec<ConflictFile>,
    onto_commit: String,
    original_head: String,
}
```

**Logic:**
- Check if `.git/rebase-merge` or `.git/rebase-apply` exists
- Parse rebase state files
- Return current status or None

---

#### 7. `validate_rebase_order` ✅
Validates that a rebase order is valid (used before executing)

**Signature:**
```rust
#[tauri::command]
fn validate_rebase_order(
    path: String,
    instructions: Vec<RebaseInstruction>
) -> Result<ValidationResult, String>
```

**Returns:**
```rust
struct ValidationResult {
    is_valid: bool,
    errors: Vec<String>,
    warnings: Vec<String>,
}
```

**Validation Rules:**
- First instruction must be "pick" (can't squash into nothing)
- Squash/fixup must follow a pick
- Can't drop all commits
- Warn if extensive reordering might cause conflicts
- Check for valid commit hashes

---

## 🎨 Frontend UI Components

### 1. Interactive Rebase Modal
**Component:** `InteractiveRebaseModal.tsx`

**Trigger:**
- Right-click commit in history → "Interactive Rebase from Here"
- Or button in header when commit selected

**UI Layout:**
```
┌──────────────────────────────────────────────────────────┐
│  Interactive Rebase onto: abc1234 (feat: awesome)       │
│                                                      [✕]  │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  📝 Edit commits below, then click "Start Rebase"       │
│                                                          │
│  ┌────────────────────────────────────────────────────┐ │
│  │  ≡  [Pick ▾]  abc1234  First commit message      │ │
│  │  ≡  [Pick ▾]  def5678  Second commit             │ │
│  │  ≡  [Squash▾] ghi9012  Fixup typo                │ │
│  │  ≡  [Pick ▾]  jkl3456  Add feature X             │ │
│  │  ≡  [Drop ▾]  mno7890  WIP: debug                │ │
│  └────────────────────────────────────────────────────┘ │
│                                                          │
│  💡 Tip: Drag commits to reorder • Select action        │
│                                                          │
│  ⚠️  Warnings:                                           │
│  • Commit 3 will be squashed into commit 2             │
│  • Commit 5 will be dropped                             │
│                                                          │
│  [Cancel]  [Preview]  [Start Rebase]                    │
└──────────────────────────────────────────────────────────┘
```

**Features:**
- Drag handles (≡) for reordering
- Dropdown for each commit action
- Color-coded actions:
  - Pick: Default (zinc)
  - Squash: Purple
  - Fixup: Blue
  - Reword: Yellow
  - Edit: Orange
  - Drop: Red
- Real-time validation
- Preview button shows what will happen
- Can't proceed if invalid

---

### 2. Rebase Commit Item
**Component:** `RebaseCommitItem.tsx`

**Props:**
```tsx
interface RebaseCommitItemProps {
  commit: RebaseCommit;
  index: number;
  action: string;
  onActionChange: (index: number, action: string) => void;
  onDragStart: (index: number) => void;
  onDragOver: (index: number) => void;
  onDrop: (index: number) => void;
  isDragging: boolean;
  dragOverIndex: number | null;
}
```

**UI:**
```
┌──────────────────────────────────────────────────────┐
│  ≡  [Pick ▾]  abc1234  First commit message         │
│     └─ Author Name • 2 days ago                     │
└──────────────────────────────────────────────────────┘
```

**Action Dropdown:**
- Pick (default) - Include commit as-is
- Squash - Combine with previous, keep both messages
- Fixup - Combine with previous, discard message
- Reword - Change commit message
- Edit - Pause to edit commit
- Drop - Remove commit entirely

**Drag Behavior:**
- Cursor changes to grab when hovering drag handle
- Ghost commit appears when dragging
- Drop zones highlight when dragging over
- Smooth animation on drop

---

### 3. Rebase Progress Modal
**Component:** `RebaseProgressModal.tsx`

**Shows during rebase execution:**
```
┌──────────────────────────────────────────────────────┐
│  ⏳ Rebasing...                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Applying commit 3 of 5                             │
│  ▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░  60%                        │
│                                                      │
│  Current: [Pick] Add feature X                      │
│                                                      │
│  [Abort Rebase]                                      │
└──────────────────────────────────────────────────────┘
```

**States:**
- In Progress: Shows progress bar, current commit
- Conflict: Shows conflict list, "Resolve & Continue"
- Success: Shows ✓ with summary
- Error: Shows error message with "Abort"

---

### 4. Rebase Conflict Resolution
**Component:** `RebaseConflictModal.tsx`

**Shows when conflicts occur mid-rebase:**
```
┌──────────────────────────────────────────────────────┐
│  ⚠️  Conflicts Detected                              │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Rebase paused at commit 3/5:                       │
│  [Pick] Add feature X                                │
│                                                      │
│  Conflicts in 2 files:                               │
│  • src/App.tsx (content conflict)                    │
│  • src/utils/helper.ts (delete/modify)               │
│                                                      │
│  📝 Resolve conflicts in your editor, then:          │
│                                                      │
│  [Abort Rebase]  [Mark as Resolved & Continue]       │
└──────────────────────────────────────────────────────┘
```

**Features:**
- Lists all conflicted files
- "Mark as Resolved" button (validates first)
- "Open in Editor" button (optional)
- Can abort at any time
- Shows current position in rebase

---

### 5. Rebase Preview Modal
**Component:** `RebasePreviewModal.tsx`

**Shows before executing rebase:**
```
┌──────────────────────────────────────────────────────┐
│  📋 Rebase Preview                                   │
├──────────────────────────────────────────────────────┤
│                                                      │
│  This rebase will:                                   │
│                                                      │
│  ✓ Keep 3 commits as-is (pick)                      │
│  🔀 Squash 1 commit into its parent                 │
│  ✏️  Reword 1 commit message                         │
│  🗑️  Drop 1 commit                                   │
│                                                      │
│  Result: 4 commits → 3 commits                      │
│                                                      │
│  ⚠️  Note: This will rewrite Git history!           │
│      Don't rebase commits that have been pushed.    │
│                                                      │
│  [Back to Edit]  [Start Rebase]                      │
└──────────────────────────────────────────────────────┘
```

---

## 🎯 Implementation Strategy

### Step 1: Backend Foundation (Week 1)
**Priority: Get git2 rebase API working**

1. Implement `get_rebase_commits`
   - Test with simple branch
   - Return commits in correct order
   - Set default action to "pick"

2. Implement `start_interactive_rebase`
   - Start with pick-only (no squash/drop yet)
   - Test on simple rebases
   - Handle conflicts

3. Implement `abort_rebase`
   - Simple abort functionality
   - Return to original HEAD

**Success Criteria:**
- Can get list of commits to rebase
- Can execute simple pick-only rebase
- Can abort rebase

---

### Step 2: Actions Support (Week 1-2)
**Priority: Implement squash, fixup, drop**

1. Add squash support
   - Combine commit with previous
   - Merge commit messages
   - Test thoroughly

2. Add fixup support
   - Like squash but discard message
   - Test edge cases

3. Add drop support
   - Skip commit entirely
   - Test conflicts

4. Add reword support
   - Pause for message edit
   - Continue after edit

**Success Criteria:**
- All actions work correctly
- Proper validation (can't squash first)
- Good error messages

---

### Step 3: Frontend UI (Week 2)
**Priority: Build drag-and-drop interface**

1. Create `InteractiveRebaseModal`
   - Modal layout
   - Commit list display
   - Action dropdowns

2. Implement drag-and-drop
   - Use HTML5 drag API
   - Visual feedback
   - Reorder array on drop

3. Add validation UI
   - Real-time validation
   - Show warnings/errors
   - Disable "Start" if invalid

**Success Criteria:**
- Beautiful drag-and-drop
- Smooth animations
- Clear validation feedback

---

### Step 4: Progress & Conflicts (Week 2-3)
**Priority: Handle rebase execution**

1. Create `RebaseProgressModal`
   - Progress bar
   - Current commit display
   - Abort button

2. Create `RebaseConflictModal`
   - Conflict list
   - Resolution workflow
   - Continue/Abort buttons

3. Implement `continue_rebase`
   - Resume after conflicts
   - Stream progress
   - Handle additional conflicts

**Success Criteria:**
- Clear progress feedback
- Conflict resolution works
- Can complete multi-step rebases

---

### Step 5: Polish & Edge Cases (Week 3)
**Priority: Production-ready**

1. Add rebase preview
   - Show what will happen
   - Summary of changes
   - Warnings

2. Handle edge cases
   - Empty commits
   - Merge commits
   - Detached HEAD
   - Already in rebase

3. Add keyboard shortcuts
   - Arrow keys to navigate
   - Enter to change action
   - Cmd+Enter to start

4. Add undo/redo in modal
   - Reset to original order
   - Undo last change

**Success Criteria:**
- No bugs or crashes
- Handles all edge cases
- Professional polish

---

## 🔐 Safety Features

### Validation Rules
1. **Can't squash first commit** - Need something to squash into
2. **Can't drop all commits** - Would create empty rebase
3. **Warn on extensive reordering** - Likely to cause conflicts
4. **Check for pushed commits** - Warn if rewriting public history

### Pre-Rebase Checks
1. **Working directory must be clean** - No uncommitted changes
2. **Not already in rebase** - Can't start nested rebase
3. **Valid commit range** - Base and HEAD must exist
4. **No merge commits** - Interactive rebase of merges is complex

### During Rebase
1. **Abort button always available** - Never stuck
2. **Conflict detection** - Pause and show conflicts
3. **State preservation** - Can resume after closing app
4. **Clear error messages** - Always know what went wrong

---

## ⚠️ Known Challenges

### git2-rs Rebase Complexity

- **Squash/Fixup**: Need to manually combine commit messages
- **Reword**: Must pause rebase, get user input, continue
- **Edit**: Complex state management (pause, edit, continue)
- **Conflict Resolution**: Can't do in-app (users use editor)

**Solutions:**
- Start with pick/squash/fixup/drop (80% use case)
- Add reword later (simpler than edit)
- Edit can be post-MVP
- Conflict resolution stays external (Phase 8+)

### Drag-and-Drop Complexity
- **Touch devices**: May need alternative UI
- **Accessibility**: Need keyboard navigation
- **Visual feedback**: Must be crystal clear
- **Edge cases**: What if drag outside modal?

**Solutions:**
- Use HTML5 Drag API (works on desktop)
- Add keyboard shortcuts (↑↓ + Enter)
- Ghost element + drop zones
- Cancel drag on outside drop

### Rebase State Management
- **Partial rebases**: What if crash mid-rebase?
- **Resume on app restart**: Need to detect state
- **Multiple repos**: Each could be in rebase
- **Undo**: Can't undo completed rebase (Git limitation)

**Solutions:**
- Check for rebase state on repo open
- Show "Resume Rebase" button if in progress
- Store state per-repo
- Warn users that rebase rewrites history

---

## 🧪 Testing Strategy

### Unit Tests (Rust)
```rust
#[test]
fn test_get_rebase_commits() {
    // Test with simple branch
    // Verify order is correct
    // Check default actions
}

#[test]
fn test_validate_rebase_order() {
    // Test valid orders
    // Test invalid orders (squash first, all dropped)
    // Test warnings
}

#[test]
fn test_rebase_pick_only() {
    // Simple rebase with only picks
    // Verify commits applied correctly
}

#[test]
fn test_rebase_with_squash() {
    // Rebase with squash
    // Verify messages combined
}
```

### Integration Tests
- [ ] Rebase 5 commits (all pick)
- [ ] Reorder commits (no conflicts)
- [ ] Squash 2 commits together
- [ ] Fixup a typo commit
- [ ] Drop a WIP commit
- [ ] Rebase with conflicts
- [ ] Abort mid-rebase
- [ ] Resume after conflict resolution

### UI Tests
- [ ] Drag-and-drop commits
- [ ] Change action dropdowns
- [ ] Validation messages appear
- [ ] Preview shows correct summary
- [ ] Progress bar updates
- [ ] Conflict modal appears
- [ ] Abort returns to original state

### Edge Case Tests
- [ ] Squash first commit (should fail)
- [ ] Drop all commits (should fail)
- [ ] Rebase with merge commit
- [ ] Rebase in detached HEAD
- [ ] Start rebase while already in rebase
- [ ] App crash during rebase (resume on restart)

---

## 📈 Success Criteria

Phase 7 is complete when:

### Backend ✅
- [x] Can get list of commits for rebase
- [x] Can execute rebase with all actions (pick/squash/fixup/drop/reword)
- [x] Can handle conflicts (pause, resume, abort)
- [x] Validation prevents invalid operations
- [x] State persists across app restarts
- [x] Error messages are clear and helpful

### Frontend ✅
- [x] Beautiful drag-and-drop interface
- [x] Action dropdowns work smoothly
- [x] Real-time validation with warnings
- [x] Progress bar during execution
- [x] Conflict resolution workflow
- [x] Preview before executing
- [x] Can abort at any time

### UX ✅
- [x] Feels intuitive (like editing a todo list)
- [x] Visual feedback is clear
- [x] No Git jargon (or explained clearly)
- [x] Keyboard shortcuts work
- [x] Handles errors gracefully
- [x] Never leaves repo in broken state

### Quality ✅
- [x] Code is well-documented
- [x] Tests cover major scenarios
- [x] Performance is good (no lag)
- [x] Works on Windows/macOS/Linux
- [x] No memory leaks

---

## 🎯 Deliverables

When Phase 7 is done, we'll have:

1. **7 new Rust commands**
   - `get_rebase_commits`
   - `start_interactive_rebase`
   - `continue_rebase`
   - `abort_rebase`
   - `get_rebase_status`
   - `validate_rebase_order`
   - `prepare_interactive_rebase`

2. **5 new React components**
   - `InteractiveRebaseModal`
   - `RebaseCommitItem`
   - `RebaseProgressModal`
   - `RebaseConflictModal`
   - `RebasePreviewModal`

3. **Full drag-and-drop UI**
   - Reorder commits visually
   - Change actions with dropdowns
   - Preview before execution

4. **Complete rebase workflow**
   - Start rebase from UI
   - Handle conflicts
   - Resume or abort
   - State persistence

5. **v0.6.0 release** 🎉

---

## 🚧 Out of Scope (Future Phases)

These are important but NOT part of Phase 7:

- ❌ In-app conflict resolution (Phase 8 or later)
- ❌ Rebase edit action (complex, low priority)
- ❌ Visual conflict viewer (Phase 8+)
- ❌ Auto-conflict resolution (Post-MVP)
- ❌ Rebase templates/presets (Post-MVP)
- ❌ Multi-branch rebase (Post-MVP)
- ❌ Rebase onto remote (can do, but not focus)

---

## 💡 Design Decisions

### Why Drag-and-Drop?
**Decision:** Use HTML5 Drag API for reordering

**Reasoning:**
- Most intuitive for visual rebase
- GitKraken proves it works well
- Feels natural on desktop
- Can add keyboard alternative later

**Alternatives Considered:**
- ↑↓ buttons (less intuitive)
- Manual reorder inputs (clunky)
- Mouse wheel (not obvious)

### Why Modal Instead of Panel?
**Decision:** Use modal dialog for interactive rebase

**Reasoning:**
- Focuses user attention
- Prevents accidental edits
- Clear start/cancel actions
- Can preview before executing

**Alternatives Considered:**
- Sidebar panel (too cramped)
- Full-screen mode (overkill)
- Inline editing (confusing)

### Why External Conflict Resolution?
**Decision:** Don't build in-app conflict resolver for Phase 7

**Reasoning:**
- Extremely complex feature
- Users already have preferred tools
- Can add in Phase 8+ if needed
- Focus on core rebase functionality

**Future Possibility:**
- Phase 8 could add visual merger
- Or integrate with VS Code
- Or provide guided resolution

---

## 📚 Resources & References

### Git Documentation
- [Git Rebase Documentation](https://git-scm.com/docs/git-rebase)
- [Interactive Rebase Tutorial](https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History)

### git2-rs Documentation
- [Rebase Module](https://docs.rs/git2/latest/git2/struct.Rebase.html)
- [Rebase Options](https://docs.rs/git2/latest/git2/struct.RebaseOptions.html)

### UI Inspiration
- GitKraken (best in class)
- Tower (simpler approach)
- GitHub Desktop (no interactive rebase - opportunity!)

### Drag-and-Drop
- [HTML5 Drag and Drop API](https://developer.mozilla.org/en-US/docs/Web/API/HTML_Drag_and_Drop_API)
- [React DnD](https://react-dnd.github.io/react-dnd/) (alternative library)

---

## 🎨 Visual Design Mockups

### Main Modal Layout
```
┌─────────────────────────────────────────────────────────┐
│  Interactive Rebase onto: abc1234                    [✕] │
├─────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────┐  │
│  │  Scroll Area for Commits                       │  │
│  │  ┌──────────────────────────────────────────┐  │  │
│  │  │ ≡ [Pick ▾] abc1234 First commit          │  │  │
│  │  │ ≡ [Pick ▾] def5678 Second commit         │  │  │
│  │  │ ≡ [Squash▾] ghi9012 Fixup typo           │  │  │
│  │  │ ≡ [Pick ▾] jkl3456 Add feature X         │  │  │
│  │  │ ≡ [Drop ▾] mno7890 WIP: debug            │  │  │
│  │  └──────────────────────────────────────────┘  │  │
│  └────────────────────────────────────────────────┘  │
│                                                       │
│  💡 Drag to reorder • Select action for each commit  │
│                                                       │
│  ⚠️ Warnings: 1 commit will be squashed, 1 dropped   │
│                                                       │
│  [Cancel]  [Preview]  [Start Rebase]                 │
└───────────────────────────────────────────────────────┘
```

### Action Dropdown Expanded
```
[Pick ▾]
  ├─ Pick      ← Include commit as-is
  ├─ Squash    ← Combine with previous (keep both msgs)
  ├─ Fixup     ← Combine with previous (discard msg)
  ├─ Reword    ← Change commit message
  ├─ Edit      ← Pause to edit commit (future)
  └─ Drop      ← Remove commit entirely
```

### Drag State
```
[Ghost - Semi-transparent]
≡ [Pick ▾] abc1234 First commit
         ↓
[Drop Zone - Highlighted]
━━━━━━━━━━━━━━━━━━━━━━━━━━━
≡ [Pick ▾] def5678 Second commit
```

---

## ⏱️ Estimated Timeline

### Week 1: Backend Foundation
- Days 1-2: `get_rebase_commits`, data structures
- Days 3-4: `start_interactive_rebase` (pick only)
- Day 5: `abort_rebase`, basic testing

### Week 2: Actions & Frontend
- Days 1-2: Squash, fixup, drop, reword backend
- Day 3: `InteractiveRebaseModal` component
- Day 4: Drag-and-drop implementation
- Day 5: Action dropdowns, validation UI

### Week 3: Progress & Polish
- Days 1-2: Progress modal, conflict handling
- Days 3-4: Preview modal, edge cases
- Day 5: Testing, bug fixes, documentation

**Total: 3 weeks (~15 days of focused work)**

---

## 🎯 MVP vs Full Feature

### MVP (v0.6.0) - Must Have
- ✅ Pick, squash, fixup, drop actions
- ✅ Drag-and-drop reordering
- ✅ Conflict detection (pause & manual resolve)
- ✅ Abort at any time
- ✅ Validation and warnings
- ✅ Basic progress feedback

### Full Feature (v0.7.0+) - Nice to Have
- ⏳ Reword action (pause for message edit)
- ⏳ Edit action (pause to amend commit)
- ⏳ In-app conflict resolution
- ⏳ Visual diff of what will change
- ⏳ Undo last rebase
- ⏳ Rebase templates/presets

**Focus on MVP first!** Get core functionality perfect, then iterate.

---

## 🚀 Quick Start After Planning

### Phase 7 Kickoff Checklist
- [ ] Read this entire plan
- [ ] Review GitKraken's rebase UI
- [ ] Set up test repository with messy history
- [ ] Create `src/components/rebase/` folder
- [ ] Create backend function stubs
- [ ] Write first test case
- [ ] Start with `get_rebase_commits` implementation

---

## 💭 Final Thoughts

Interactive rebase is **the** feature that separates great Git GUIs from mediocre ones. GitKraken nailed it. Tower got close. SourceTree failed. GitHub Desktop doesn't even try.

**Graft has the opportunity to have the best interactive rebase UX in existence.**

Key principles:
1. **Make it visual** - Drag-and-drop is intuitive
2. **Make it safe** - Always allow abort, never lose work
3. **Make it clear** - No Git jargon, explain everything
4. **Make it fast** - Smooth animations, no lag
5. **Make it accessible** - Keyboard shortcuts, clear focus

If we nail Phase 7, Graft will be **the** Git GUI for developers who rewrite history frequently (which is most of us).

---

## 📊 Success Metrics

Phase 7 will be successful if:

1. **Users actually use it** (vs falling back to CLI)
2. **No one gets confused** (self-explanatory UI)
3. **No data loss** (always can abort safely)
4. **Feels fast** (60fps animations, <100ms response)
5. **Looks beautiful** (professional, polished)

**Target:** 90%+ of users who need rebase choose Graft over CLI

---

**Created:** October 30, 2025  
**Status:** 📋 Ready for Implementation  
**Next Step:** Implement backend commands (starting with `get_rebase_commits`)

Let's build the best interactive rebase UI in existence! 🚀

---

*"Make Git rebase so good that even beginners can confidently rewrite history."* - Graft Philosophy
