# Phase 4: Diff Viewer - Implementation Plan

**Goal:** Show beautiful, readable code diffs for files in commits

**Status:** 🚀 **STARTING NOW**

---

## 📊 Current State Analysis

### What We Already Have ✅
- `get_commit_files()` - Returns list of changed files with status
- File list display in CommitDetailsPanel
- Basic infrastructure for showing commit details

### What We Need to Build 🔨
- Backend command to get actual diff content
- Diff display component
- Syntax highlighting (Monaco Editor)
- UI integration

---

## 🎯 Implementation Strategy

We'll build this in **4 progressive stages**, each adding more capability:

### Stage 1: Basic Diff Display (MVP)
**Goal:** Show raw unified diffs when clicking files

**Backend:**
- Add `get_file_diff()` Tauri command
- Returns unified diff text (Git's native format)
- Parameters: repo path, commit hash, file path

**Frontend:**
- Create `DiffViewer.tsx` component
- Display unified diff in monospace font
- Basic styling (+ green, - red lines)
- Show when file is clicked in commit details

**Time:** 1 hour

### Stage 2: Monaco Editor Integration
**Goal:** Syntax highlighting and professional look

**Frontend:**
- Install Monaco Editor React package
- Replace plain text with Monaco diff editor
- Configure for unified diff display
- Add line numbers and proper theming

**Time:** 1 hour

### Stage 3: Split View & Toggle
**Goal:** Side-by-side and unified view options

**Frontend:**
- Add view toggle button
- Implement side-by-side diff view
- Switch between unified and split views
- Remember user preference

**Time:** 45 minutes

### Stage 4: Polish & Features
**Goal:** All the nice-to-haves

**Features:**
- Expand/collapse unchanged sections
- Copy lines from diff
- Search within diff
- Keyboard navigation
- Performance optimization for large files

**Time:** 1-2 hours

---

## 📋 Detailed Implementation Plan

### Session 1: Basic Diff Display (NOW!)

#### Task 1: Backend - Add `get_file_diff` Command
**File:** `src-tauri/src/lib.rs`

Add new Tauri command:
```rust
#[tauri::command]
fn get_file_diff(
    path: String, 
    commit_hash: String, 
    file_path: String
) -> Result<String, String>
```

**What it does:**
1. Open repository
2. Get commit and its parent
3. Generate unified diff for specific file
4. Return diff as string

**Time:** 20 minutes

#### Task 2: Frontend - Create DiffViewer Component
**File:** `src/components/DiffViewer.tsx`

Basic component structure:
```tsx
interface DiffViewerProps {
  repoPath: string;
  commitHash: string;
  filePath: string;
}

export function DiffViewer({ repoPath, commitHash, filePath }: DiffViewerProps) {
  // Load diff from backend
  // Display in monospace with colors
  // Handle loading and errors
}
```

**Time:** 20 minutes

#### Task 3: Integration - Add to CommitDetailsPanel
**File:** `src/App.tsx`

Modify FileListItem to:
- Be clickable
- Show selected state
- Trigger diff display below file list

Add DiffViewer display area in CommitDetailsPanel

**Time:** 20 minutes

---

## 🎨 UI Design Concept

### Layout Option A: Inline (Recommended)
```
┌─────────────────────────────────────┐
│  Commit Details Panel               │
├─────────────────────────────────────┤
│  Files Changed (3)                  │
│  • file1.rs [M]    ← selected       │
│  • file2.tsx [A]                    │
│  • file3.md [M]                     │
├─────────────────────────────────────┤
│  Diff for file1.rs                  │
│  ────────────────                   │
│  @@ -10,5 +10,7 @@                  │
│  - old line                         │
│  + new line                         │
│  + another line                     │
│  ...                                │
└─────────────────────────────────────┘
```

### Layout Option B: Modal (Alternative)
- Full-screen overlay when clicking file
- Close button to return
- Better for large diffs

**Recommendation:** Start with Option A (inline), can add modal later

---

## 🛠️ Technical Decisions

### Diff Format
**Choice:** Unified diff (Git's default)
- Easier to implement
- Familiar to developers
- Compact display
- Can upgrade to split view later

### Syntax Highlighting
**Choice:** Monaco Editor
- Industry standard (VS Code uses it)
- Excellent syntax highlighting
- Built-in diff support
- Well-maintained

**Alternative considered:** react-syntax-highlighter
- Simpler but less powerful
- Monaco is worth the extra setup

### Performance
**Strategy:** Lazy loading
- Only load diff when file is clicked
- Don't preload all diffs
- Cache loaded diffs in memory
- Limit diff size for huge files

---

## ✅ Success Criteria (Per Roadmap)

- [ ] Diffs are readable and beautiful
- [ ] Large files (5000+ lines) render smoothly
- [ ] Syntax highlighting works correctly
- [ ] Can navigate diff with keyboard

---

## 🚀 Let's Start!

**First Step:** Add the backend `get_file_diff` command

**Ready?** Let's write some Rust! 🦀

---

## 📝 Notes

- Keep it simple first, iterate later
- Test with actual Graft files (dogfooding!)
- Focus on UX - diffs should be easy to read
- Performance matters - large diffs should be smooth

**Phase 4 starts NOW!** 🎨
