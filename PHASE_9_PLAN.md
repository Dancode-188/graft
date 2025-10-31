# Phase 9: Keyboard & Speed - Implementation Plan

**Goal**: Make Graft feel like Vim for Git - keyboard-first, lightning fast  
**Target Version**: v0.9.0  
**Estimated Time**: 1-2 days  
**Status**: 🚀 Starting Now!

---

## 🎯 Overview

Phase 9 is about making Graft **the fastest Git client** for power users. We'll build a command palette, add comprehensive keyboard shortcuts, and optimize performance. By the end, users should rarely need to touch their mouse.

### Why This Matters
- **Power users love keyboards** - Faster than clicking
- **Professional feel** - Like VS Code, Sublime, Vim
- **Discoverability** - Command palette teaches shortcuts
- **Efficiency** - 10x faster workflows

---

## 📋 Features to Implement

### Core Features (Must Have)

#### 1. ✅ Command Palette (Cmd/Ctrl+K)
The crown jewel - a fuzzy search command center like VS Code

**Features:**
- Fuzzy search through all actions
- Shows keyboard shortcuts
- Recent commands history
- Context-aware actions
- Beautiful UI with icons
- Fast filtering (<50ms)

**Commands to Include:**
- Repository: Open repo, refresh
- Staging: Stage all, unstage all, discard changes
- Commits: Commit, amend, undo last commit
- Branches: Create, switch, delete, rename
- Remote: Push, pull, fetch, force push
- Stash: Create, apply, pop, drop
- Rebase: Interactive rebase, continue, abort
- View: Toggle sidebars, focus areas
- Search: Search commits, files
- Navigation: Jump to commit, branch, stash

#### 2. ✅ Global Keyboard Shortcuts
Comprehensive shortcuts for all major actions

**Already Implemented:** ✅
- `Cmd/Ctrl+O` - Open repository
- `Cmd/Ctrl+F` - Search commits
- `Cmd/Ctrl+B` - Toggle branch sidebar
- `Cmd/Ctrl+Shift+S` - Toggle stash sidebar
- `Cmd/Ctrl+N` - New branch
- `Cmd/Ctrl+Enter` - Commit (in staging)
- `Escape` - Close modals

**New Shortcuts to Add:**
- `Cmd/Ctrl+K` - Command palette
- `Cmd/Ctrl+P` - Quick file finder
- `Cmd/Ctrl+Shift+P` - Push
- `Cmd/Ctrl+Shift+L` - Pull
- `Cmd/Ctrl+Shift+F` - Fetch
- `Cmd/Ctrl+R` - Refresh repository
- `Cmd/Ctrl+,` - Settings/preferences
- `Cmd/Ctrl+/` - Show keyboard shortcuts
- `Space` - Stage/unstage file (in staging)
- `Enter` - View selected item details
- `?` - Show help/shortcuts overlay

**Vim-Style Navigation (Optional for Phase 9.5):**
- `j/k` - Navigate up/down in lists
- `h/l` - Navigate left/right between panels
- `g/G` - Jump to top/bottom
- `Ctrl+d/u` - Page down/up

#### 3. ✅ Keyboard Shortcuts Overlay (Cmd/Ctrl+/)
Beautiful cheat sheet showing all shortcuts

**Features:**
- Categorized by function
- Search/filter shortcuts
- Visual keyboard layout (optional)
- Click to execute action
- Copy-friendly format

#### 4. ✅ Quick Actions Menu
Context-sensitive actions for selected items

**Triggers:**
- Right-click (context menu)
- Keyboard shortcut (e.g., `Cmd+Shift+K`)
- Command palette

**Actions for:**
- Commits: Checkout, cherry-pick, revert, copy hash
- Branches: Switch, delete, merge, rebase
- Files: Stage, unstage, discard, view diff
- Stashes: Apply, pop, drop, preview

#### 5. ✅ Search Everywhere (Cmd/Ctrl+P)
Fast fuzzy search across everything

**Search Types:**
- Commits (by message, author, hash)
- Files (current and historical)
- Branches (local and remote)
- Stashes (by message)
- Commands (from command palette)

#### 6. ✅ Performance Optimizations
Make everything feel instant

**Targets:**
- Virtual scrolling (already implemented for commits)
- Debounced search (<100ms response)
- Lazy loading for heavy operations
- Optimistic UI updates
- Background operations
- Caching frequently accessed data

---

## 🏗️ Architecture Design

### Component Structure

```
src/components/
├── command-palette/
│   ├── CommandPalette.tsx          # Main palette component
│   ├── CommandItem.tsx              # Individual command
│   ├── CommandSearch.tsx            # Search input
│   ├── CommandCategory.tsx          # Category grouping
│   ├── commands.ts                  # Command definitions
│   ├── fuzzySearch.ts               # Fuzzy matching
│   └── types.ts                     # TypeScript types
├── keyboard/
│   ├── KeyboardShortcuts.tsx        # Shortcuts overlay
│   ├── ShortcutKey.tsx              # Visual key component
│   ├── shortcuts.ts                 # Shortcut definitions
│   └── types.ts                     # TypeScript types
└── quick-search/
    ├── QuickSearch.tsx              # Quick finder modal
    ├── SearchResults.tsx            # Results display
    ├── types.ts                     # TypeScript types
    └── index.ts
```

### Data Structures

```typescript
// Command definition
interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  keywords?: string[];
  shortcut?: string;
  category: CommandCategory;
  action: () => void | Promise<void>;
  when?: () => boolean; // Context condition
}

// Keyboard shortcut
interface KeyboardShortcut {
  key: string;
  modifiers: ('cmd' | 'ctrl' | 'shift' | 'alt')[];
  action: string;
  description: string;
  category: string;
  when?: string; // Context (e.g., "staging", "commits")
}

// Search result
interface SearchResult {
  type: 'commit' | 'file' | 'branch' | 'stash' | 'command';
  id: string;
  title: string;
  subtitle?: string;
  icon?: string;
  score: number; // Fuzzy match score
  action: () => void;
}
```

### Keyboard Shortcuts System

```typescript
// Global keyboard handler
class KeyboardManager {
  private shortcuts: Map<string, KeyboardShortcut>;
  
  register(shortcut: KeyboardShortcut): void;
  unregister(key: string): void;
  handle(event: KeyboardEvent): boolean;
  getShortcutString(modifiers: string[], key: string): string;
}

// Hook for components
function useKeyboardShortcut(
  key: string,
  modifiers: string[],
  callback: () => void,
  enabled: boolean = true
): void;
```

---

## 🎨 UI/UX Design

### Command Palette Design

```
┌─────────────────────────────────────────────────┐
│  🔍 Type a command...                           │
├─────────────────────────────────────────────────┤
│  Recent:                                        │
│  ⚡ Push to origin/main           Cmd+Shift+P  │
│  🌿 Create branch                 Cmd+N        │
│                                                 │
│  Staging:                                       │
│  ✅ Commit changes                Cmd+Enter    │
│  📦 Stage all files                            │
│  🗑️  Discard all changes                       │
│                                                 │
│  Branches:                                      │
│  🌿 Switch branch                              │
│  ➕ Create new branch            Cmd+N        │
│  🗑️  Delete branch                             │
│                                                 │
│  View:                                          │
│  👁️  Toggle branch sidebar       Cmd+B        │
│  💾 Toggle stash sidebar         Cmd+Shift+S  │
└─────────────────────────────────────────────────┘
```

### Keyboard Shortcuts Overlay Design

```
┌─────────────────────────────────────────────────┐
│  Keyboard Shortcuts                        ✕   │
│  ─────────────────                              │
│  🔍 Search shortcuts...                         │
├─────────────────────────────────────────────────┤
│  General                                        │
│  Cmd+K         Open command palette             │
│  Cmd+O         Open repository                  │
│  Cmd+R         Refresh                          │
│  Cmd+/         Show this help                   │
│                                                 │
│  Navigation                                     │
│  Cmd+F         Search commits                   │
│  Cmd+P         Quick search                     │
│  ↑↓            Navigate lists                   │
│  Enter         View details                     │
│  Escape        Close/cancel                     │
│                                                 │
│  Staging & Commits                              │
│  Space         Stage/unstage file               │
│  Cmd+Enter     Commit changes                   │
│                                                 │
│  Branches & Remote                              │
│  Cmd+B         Toggle branches                  │
│  Cmd+N         New branch                       │
│  Cmd+Shift+P   Push                            │
│  Cmd+Shift+L   Pull                            │
│                                                 │
│  Stash                                          │
│  Cmd+Shift+S   Toggle stashes                  │
└─────────────────────────────────────────────────┘
```

---

## 🎬 Implementation Phases

### Phase 9.1: Command Palette Foundation (2-3 hours)

**Step 1: Create Command System (45 min)**
1. Define command structure (`commands.ts`)
2. Create command registry
3. Implement fuzzy search algorithm
4. Add keyboard handling
5. Test basic command execution

**Step 2: Build UI Components (45 min)**
1. `CommandPalette.tsx` - Main modal
2. `CommandSearch.tsx` - Input field
3. `CommandItem.tsx` - Command row
4. `CommandCategory.tsx` - Category headers
5. Styling and animations

**Step 3: Register Commands (45 min)**
1. Repository commands
2. Staging commands
3. Branch commands
4. Remote commands
5. Stash commands
6. View commands

**Step 4: Integration & Polish (30 min)**
1. Wire up Cmd+K shortcut
2. Add recent commands history
3. Keyboard navigation (up/down/enter)
4. Close on Escape or click outside
5. Test all commands

**Deliverable:** Working command palette with 30+ commands

---

### Phase 9.2: Keyboard Shortcuts System (1.5 hours)

**Step 1: Shortcuts Infrastructure (30 min)**
1. Create `KeyboardManager` class
2. Shortcut registration system
3. Context awareness
4. Modifier key detection (Mac vs Windows)
5. Prevent conflicts

**Step 2: Add New Shortcuts (30 min)**
1. `Cmd+P` - Quick search
2. `Cmd+Shift+P` - Push
3. `Cmd+Shift+L` - Pull
4. `Cmd+R` - Refresh
5. `Cmd+/` - Show shortcuts
6. `Space` - Stage/unstage (in staging)

**Step 3: Shortcuts Overlay (30 min)**
1. `KeyboardShortcuts.tsx` component
2. Categorized layout
3. Search/filter functionality
4. Visual key components
5. Trigger with `Cmd+/`

**Deliverable:** Complete keyboard shortcuts system + overlay

---

### Phase 9.3: Quick Search (1 hour)

**Step 1: Search Backend (20 min)**
1. Unified search function
2. Search commits, branches, stashes
3. Fuzzy matching algorithm
4. Score and rank results

**Step 2: Search UI (20 min)**
1. `QuickSearch.tsx` modal
2. Search input with focus
3. Results list with categories
4. Keyboard navigation

**Step 3: Integration (20 min)**
1. Wire up `Cmd+P`
2. Jump to selected item
3. Highlight in main view
4. Close on selection

**Deliverable:** Fast quick search across all data

---

### Phase 9.4: Quick Actions Menu (45 min)

**Step 1: Context Menu System (20 min)**
1. Right-click handler
2. Context-aware actions
3. Menu positioning

**Step 2: Action Definitions (15 min)**
1. Commit actions
2. Branch actions
3. File actions
4. Stash actions

**Step 3: UI & Integration (10 min)**
1. Menu component
2. Action execution
3. Close on action or click outside

**Deliverable:** Context menus for all items

---

### Phase 9.5: Performance & Polish (1 hour)

**Step 1: Performance Optimizations (30 min)**
1. Debounce search inputs
2. Memoize expensive operations
3. Optimize re-renders
4. Add loading states

**Step 2: Polish & Testing (30 min)**
1. Smooth animations
2. Error handling
3. Edge case testing
4. Accessibility (aria labels)
5. Cross-platform testing

**Deliverable:** Fast, polished keyboard experience

---

## 🎯 Success Criteria

Phase 9 is complete when:

### Functionality
- [x] Command palette works (Cmd+K)
- [x] All major actions have shortcuts
- [x] Quick search finds everything (Cmd+P)
- [x] Shortcuts overlay shows all keys (Cmd+/)
- [x] Context menus work
- [x] No keyboard conflicts

### User Experience
- [x] Palette opens <50ms
- [x] Search updates <100ms
- [x] Shortcuts feel natural
- [x] Discoverability is excellent
- [x] Power users rarely need mouse
- [x] Help is easily accessible

### Quality
- [x] No console errors
- [x] Works on Mac and Windows
- [x] Keyboard navigation is smooth
- [x] Modals close properly
- [x] Focus management correct
- [x] Accessible to screen readers

---

## 🧪 Testing Plan

### Manual Testing Checklist

**Command Palette:**
- [ ] Opens with Cmd+K
- [ ] Fuzzy search works
- [ ] Shows correct categories
- [ ] Keyboard navigation (up/down)
- [ ] Enter executes command
- [ ] Escape closes palette
- [ ] Recent commands appear
- [ ] Icons display correctly

**Keyboard Shortcuts:**
- [ ] All shortcuts work
- [ ] Mac vs Windows modifiers
- [ ] No conflicts
- [ ] Work in correct contexts
- [ ] Disabled when typing in inputs

**Quick Search (Cmd+P):**
- [ ] Searches all types
- [ ] Results ranked correctly
- [ ] Jumps to selected item
- [ ] Fast (<100ms)
- [ ] Clear results on close

**Shortcuts Overlay (Cmd+/):**
- [ ] Shows all shortcuts
- [ ] Categorized correctly
- [ ] Search filters work
- [ ] Readable and clear
- [ ] Closes properly

**Context Menus:**
- [ ] Right-click works
- [ ] Correct actions for context
- [ ] Executes properly
- [ ] Closes after action

**Performance:**
- [ ] Command palette <50ms
- [ ] Search <100ms
- [ ] No UI lag
- [ ] Smooth animations

---

## 📝 Command List

### Repository
- Open repository (Cmd+O) ✅
- Refresh (Cmd+R) - NEW
- Close repository

### Staging
- Stage all files
- Unstage all files
- Discard all changes
- Stage file (Space) - NEW
- Unstage file (Space) - NEW

### Commits
- Commit (Cmd+Enter) ✅
- Amend last commit
- Undo last commit
- View commit details (Enter) - NEW

### Branches
- Toggle sidebar (Cmd+B) ✅
- Create branch (Cmd+N) ✅
- Switch branch
- Delete branch
- Rename branch
- Merge branch

### Remote
- Push (Cmd+Shift+P) - NEW
- Pull (Cmd+Shift+L) - NEW
- Fetch (Cmd+Shift+F) - NEW
- Force push (with hold)

### Stash
- Toggle sidebar (Cmd+Shift+S) ✅
- Create stash
- Apply stash
- Pop stash
- Drop stash
- Preview stash

### Rebase
- Interactive rebase
- Continue rebase
- Abort rebase

### View
- Toggle branch sidebar (Cmd+B) ✅
- Toggle stash sidebar (Cmd+Shift+S) ✅
- Focus staging area
- Focus commits
- Focus details

### Search & Navigation
- Search commits (Cmd+F) ✅
- Quick search (Cmd+P) - NEW
- Next result
- Previous result

### Help
- Show shortcuts (Cmd+/) - NEW
- Show command palette (Cmd+K) - NEW

---

## 🎨 Design System

### Command Palette Styling
```css
- Background: bg-zinc-900
- Border: border-zinc-700
- Input: bg-zinc-800, focus:ring-graft-500
- Item hover: bg-zinc-800
- Selected: bg-zinc-700
- Text: text-zinc-200
- Shortcut: text-zinc-500, font-mono
- Icon: mr-2
```

### Keyboard Key Component
```tsx
<kbd className="px-2 py-1 text-xs font-mono bg-zinc-800 border border-zinc-700 rounded">
  Cmd
</kbd>
```

---

## 🚀 Getting Started

### Step 1: Create Components Directory
```bash
mkdir -p src/components/command-palette
mkdir -p src/components/keyboard
mkdir -p src/components/quick-search
```

### Step 2: Start with Command Palette
We'll begin by building the command palette, as it's the most impactful feature.

---

## 📚 References

**Inspiration:**
- VS Code Command Palette
- Sublime Text Goto Anything
- Raycast (macOS)
- Linear command menu
- Slack quick switcher

**Libraries to Consider:**
- cmdk (Pacifico) - command menu for React
- fuse.js - fuzzy search
- hotkeys-js - keyboard shortcuts
- react-hotkeys-hook - React shortcuts hook

**Or build from scratch** (recommended for learning & control)

---

## 🎉 Expected Outcome

By the end of Phase 9, users will:
- Access any action with 1-2 keystrokes
- Never need to hunt for features in menus
- Feel like they're using a professional tool
- Be 10x faster than with mouse
- Discover shortcuts naturally through command palette
- Enjoy using Graft even more!

**Phase 9 will transform Graft into a true power user tool!** ⚡✨

---

*Let's make Graft lightning fast!*
