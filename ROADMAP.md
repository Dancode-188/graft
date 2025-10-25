# Graft Development Roadmap

> **Vision**: Build the fastest, most beautiful Git GUI that developers actually want to use.

---

## Development Phases

### 🎯 Phase 0: Foundation (Week 1-2) ✅ **COMPLETE**
**Goal**: Set up project infrastructure and validate tech stack

#### Tasks
- [x] Project naming and branding
- [x] Competitive research
- [x] README and documentation
- [x] Set up Tauri project
- [x] Configure TypeScript + React
- [x] Set up Tailwind CSS
- [x] Integrate libgit2 bindings
- [x] Test basic Git operations from Rust
- [x] Build "Hello World" window
- [x] Set up hot reload for development
- [x] Implement keyboard shortcuts (Cmd+O / Ctrl+O)
- [x] Add smooth animations and transitions
- [x] Improve error handling for edge cases
- [x] Handle detached HEAD and unborn branches
- [x] OS-specific keyboard shortcut detection

#### Success Criteria
- ✅ Project opens and displays a window
- ✅ Can read Git repo from Rust backend
- ✅ React frontend communicates with Rust backend
- ✅ Development workflow is smooth
- ✅ Keyboard shortcuts work cross-platform
- ✅ Error messages are helpful and actionable
- ✅ UI has smooth animations
- ✅ Handles edge cases (detached HEAD, new repos, bare repos)

**Completion Date:** October 25, 2025

---

### 🌱 Phase 1: Repository Browser (Week 3-4) ✅ **COMPLETE**
**Goal**: Open and browse any Git repository

#### Features
- [x] File system dialog to select repo
- [x] Display repo name and current branch
- [x] Show last 100+ commits in list
- [x] Display commit message, author, date
- [x] Beautiful commit details panel
- [x] List changed files per commit
- [x] Status bar with repo info
- [x] Keyboard navigation (↑↓ arrows)
- [x] Search commits (Cmd+F / Ctrl+F)
- [x] Virtual scrolling (1000+ commits)

#### Features Implemented
- Split-pane UI: Commit list (left) + Details panel (right)
- Click any commit to view full details
- Search by message, author, email, or hash
- File changes with status indicators (added/modified/deleted/renamed)
- Keyboard shortcuts: Arrow keys to navigate, Escape to deselect
- Virtual scrolling renders only visible commits (huge performance boost)
- Increased commit limit to 1000 for testing with large repos

#### Success Criteria
- ✅ Can open any Git repo on local machine
- ✅ Commit history loads < 2 seconds for 10k commits
- ✅ UI is responsive and doesn't freeze
- ✅ Can navigate commits with keyboard arrows
- ✅ Search finds commits quickly
- ✅ Virtual scrolling handles 1000+ commits smoothly

**Completion Date:** October 26, 2025 ✅

---

### 🌳 Phase 2: Beautiful Commit Graph (Week 5-6) 🚀 **IN PROGRESS**
**Goal**: Visualize branch history beautifully

#### Completed (Session 1)
- [x] Graph layout algorithm (lane calculation)
- [x] SVG-based visualization component
- [x] Color-coded branch lanes
- [x] Commit dots with hover effects
- [x] Connection lines (parent-child relationships)
- [x] Synchronized scrolling between graph and list
- [x] Interactive commit selection from graph

#### In Progress
- [ ] Merge commit visualization (crossing lines)
- [ ] Branch name labels
- [ ] Performance optimization for 1000+ commits
- [ ] Better lane assignment algorithm

#### TODO
- [ ] Visual commit graph (GitKraken-style)
- [ ] Color-coded branches
- [ ] Merge commit visualization
- [ ] Parallel branch display
- [ ] Graph handles complex histories
- [ ] Smooth scrolling through history
- [ ] Load commits on demand (virtualization)

#### Technical Challenges
- Branch graph algorithm
- Canvas/SVG rendering performance
- Color assignment for branches
- Virtual scrolling for large repos

#### Success Criteria
- ✅ Graph clearly shows branch relationships
- ✅ Renders 10,000+ commits smoothly
- ✅ Colors are distinct and pleasant
- ✅ Users understand the history at a glance

---

### ✏️ Phase 3: Staging & Commits (Week 7-8)
**Goal**: Make commits through the GUI

#### Features
- [ ] Working directory file list
- [ ] Show modified/added/deleted files
- [ ] Stage/unstage individual files
- [ ] Commit message input (multi-line)
- [ ] Validate commit messages
- [ ] Show diff preview when selecting files
- [ ] Keyboard shortcuts (Cmd+Enter to commit)
- [ ] Commit history updates after commit

#### UI Components
- Split view: Unstaged | Staged
- Commit message box
- Diff preview panel

#### Success Criteria
- ✅ Can stage files individually
- ✅ Can write commit messages easily
- ✅ Commits appear in history immediately
- ✅ Workflow feels natural and fast

---

### 📝 Phase 4: Diff Viewer (Week 9-10)
**Goal**: Beautiful, readable code diffs

#### Features
- [ ] Monaco Editor integration
- [ ] Side-by-side diff view
- [ ] Unified diff view (toggle)
- [ ] Syntax highlighting
- [ ] Line numbers
- [ ] Expand/collapse unchanged sections
- [ ] Search within diff
- [ ] Copy lines from diff

#### Technical Requirements
- Monaco Editor in Tauri
- Git diff parsing
- Syntax highlighting themes
- Performance on large diffs

#### Success Criteria
- ✅ Diffs are readable and beautiful
- ✅ Large files (5000+ lines) render smoothly
- ✅ Syntax highlighting works correctly
- ✅ Can navigate diff with keyboard

---

### 🔀 Phase 5: Branching (Week 11-12)
**Goal**: Branch operations made visual

#### Features
- [ ] Branch list sidebar
- [ ] Create new branch
- [ ] Switch branches
- [ ] Delete branches
- [ ] Rename branches
- [ ] Show branch relationships
- [ ] Filter branches (local/remote)
- [ ] Branch search

#### UI Components
- Branch sidebar
- Branch creation modal
- Context menus for operations
- Branch switcher command palette

#### Success Criteria
- ✅ Switching branches is instant
- ✅ Creating branches is intuitive
- ✅ Can manage 100+ branches easily
- ✅ Keyboard shortcuts work

---

### 🔁 Phase 6: Push/Pull/Fetch (Week 13-14)
**Goal**: Remote repository operations

#### Features
- [ ] Pull from remote
- [ ] Push to remote
- [ ] Fetch updates
- [ ] Show remote tracking branches
- [ ] Handle merge conflicts notification
- [ ] Credential management
- [ ] Progress indicators
- [ ] Push force with confirmation

#### Technical Challenges
- SSH key handling
- HTTPS authentication
- Progress callbacks
- Error handling

#### Success Criteria
- ✅ Can push/pull without CLI
- ✅ Authentication works smoothly
- ✅ Progress is visible
- ✅ Errors are clear and helpful

---

### 🎯 Phase 7: Interactive Rebase (Week 15-16)
**Goal**: Visual, drag-and-drop rebase

#### Features
- [ ] Select commits for rebase
- [ ] Drag-and-drop reordering
- [ ] Pick/squash/fixup/edit/drop
- [ ] Preview changes before applying
- [ ] Visual conflict resolution
- [ ] Abort rebase easily
- [ ] Continue after conflicts

#### UI Design
- List of commits with drag handles
- Action selector per commit
- Conflict resolution panel
- Confirmation before applying

#### Success Criteria
- ✅ Rebase is visual and intuitive
- ✅ No need to remember commands
- ✅ Can reorganize history confidently
- ✅ Conflicts are manageable

---

### 💾 Phase 8: Stash Management (Week 17-18)
**Goal**: Save and restore work easily

#### Features
- [ ] List all stashes
- [ ] Create stash with message
- [ ] Apply stash
- [ ] Pop stash
- [ ] Drop stash
- [ ] Preview stash contents
- [ ] Stash search

#### UI Components
- Stash sidebar/panel
- Stash creation dialog
- Diff preview
- Quick actions

#### Success Criteria
- ✅ Stashing is quick and obvious
- ✅ Can see what's in each stash
- ✅ Applying stashes is safe
- ✅ Never lose stashed work

---

### ⚡ Phase 9: Keyboard & Speed (Week 19-20)
**Goal**: Make Graft feel like Vim for Git

#### Features
- [ ] Command palette (Cmd/Ctrl+K)
- [ ] Global keyboard shortcuts
- [ ] Vim-style navigation (hjkl)
- [ ] Quick actions menu
- [ ] Shortcut customization
- [ ] Keyboard cheat sheet
- [ ] Search everywhere

#### Keyboard Shortcuts
- `Cmd+O`: Open repo
- `Cmd+K`: Command palette
- `Cmd+P`: Quick file search
- `Cmd+F`: Search commits
- `Space`: Stage/unstage file
- `Enter`: View details
- `Cmd+Enter`: Commit
- `Cmd+Shift+P`: Push
- `Cmd+Shift+L`: Pull

#### Success Criteria
- ✅ Power users never touch mouse
- ✅ Command palette is fast and smart
- ✅ Shortcuts feel natural
- ✅ Discoverability is good

---

### 🎨 Phase 10: Polish & Themes (Week 21-22)
**Goal**: Make it beautiful and customizable

#### Features
- [ ] Dark theme (default)
- [ ] Light theme
- [ ] Custom color schemes
- [ ] Font customization
- [ ] Syntax highlighting themes
- [ ] UI density options (compact/spacious)
- [ ] Accessibility improvements
- [ ] Animations and transitions

#### Design System
- Consistent spacing
- Color palette
- Typography scale
- Component library
- Animation guidelines

#### Success Criteria
- ✅ Looks professional and modern
- ✅ Themes are easy to switch
- ✅ Accessible to all users
- ✅ Animations enhance UX

---

## Post-MVP Features

### Future Phases (Months 6-12)
- [ ] Multi-repo workspaces
- [ ] Cherry-picking
- [ ] Merge conflict resolution
- [ ] Blame annotations
- [ ] Bisect tool
- [ ] Submodule support
- [ ] Git LFS support
- [ ] PR integration (optional)
- [ ] Plugin system

---

## Milestones

### Alpha Release (Month 3)
- Phases 1-6 complete
- Can replace CLI for basic workflows
- 10-20 testers using daily

### Beta Release (Month 4-5)
- Phases 7-9 complete
- All core Git workflows supported
- 100+ daily users
- Performance optimized

### v1.0 Release (Month 6)
- Phase 10 complete
- Stable, polished, fast
- Comprehensive documentation
- 1000+ GitHub stars
- Ready for production use

---

## Development Principles

### Build → Measure → Learn
- Release weekly alphas
- Get feedback early
- Iterate based on real usage
- Don't build features nobody wants

### Dogfooding
- Use Graft to build Graft
- If something is annoying us, fix it
- If we wouldn't use it, users won't either

### Focus
- Do fewer things, do them better
- Say no to feature requests that don't fit vision
- Perfect the 80% use case first
- Advanced features come later

---

**Start Date**: October 2024  
**Phase 0 Complete**: October 25, 2025 ✅  
**Phase 1 Complete**: October 26, 2025 ✅  
**Phase 2 Started**: October 26, 2025 🚀  
**Target v1.0**: April 2025  
**Current Status**: Phase 2 In Progress - Building visual git graph visualization! 🌳
