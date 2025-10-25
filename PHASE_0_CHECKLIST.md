# Phase 0 Verification Checklist

This checklist verifies that Phase 0 is complete and the application is ready to move to Phase 1.

---

## ✅ Build & Runtime Checks

### Prerequisites Installed
- [ ] Node.js (v18+): `node --version`
- [ ] Rust (latest): `rustc --version`
- [ ] npm packages: `npm install`

### Development Build
```bash
# Should complete without errors
npm run tauri:dev
```

**Expected Behavior:**
- ✅ Vite dev server starts on port 1420
- ✅ Rust backend compiles successfully
- ✅ Graft window opens with "Welcome to Graft" screen
- ✅ No console errors

### Production Build
```bash
# Should complete without errors (takes longer)
npm run tauri:build
```

**Expected Output:**
- ✅ Compiled binary in `src-tauri/target/release/`
- ✅ Bundle in `src-tauri/target/release/bundle/`

---

## ✅ Feature Verification

### 1. Open Repository
- [ ] Click "Open Repository" button
- [ ] File picker dialog appears
- [ ] Select a valid Git repository
- [ ] Repository info displays:
  - [ ] Repository name
  - [ ] Full path
  - [ ] Current branch name
  - [ ] Repo type (working directory vs bare)

### 2. Keyboard Shortcuts
- [ ] Press `Cmd+O` (Mac) or `Ctrl+O` (Windows/Linux)
- [ ] File picker opens
- [ ] Can select and open repo via keyboard

### 3. Error Handling

**Test Non-Git Directory:**
- [ ] Select a folder without `.git`
- [ ] Should show clear error: "Not a Git repository"

**Test Invalid Path:**
- [ ] Try to open non-existent path (via code test)
- [ ] Should show: "Path does not exist"

### 4. Edge Cases

**Detached HEAD:**
- [ ] Checkout a specific commit: `git checkout <commit-hash>`
- [ ] Open repo in Graft
- [ ] Should show: "HEAD (detached at <7-char-hash>)"

**New Repository (No Commits):**
- [ ] Create new repo: `git init test-repo`
- [ ] Open in Graft
- [ ] Should show: "main (no commits yet)"

**Bare Repository:**
- [ ] Clone bare repo: `git clone --bare <url> bare-test`
- [ ] Open in Graft
- [ ] Should show "Bare Repository" in type field

---

## ✅ UI/UX Verification

### Visual Design
- [ ] Dark theme (zinc-950 background)
- [ ] Graft green accent color (#22c55e)
- [ ] Clean, centered layouts
- [ ] Proper spacing and typography

### Animations
- [ ] Welcome screen fades in smoothly
- [ ] Repo info panel fades in after opening
- [ ] No jarring transitions

### Accessibility
- [ ] Tab key navigation works
- [ ] Focus indicators visible (green ring)
- [ ] Keyboard shortcuts displayed correctly for OS
- [ ] Buttons have clear hover/active states

### Responsive Behavior
- [ ] Resize window - content adapts properly
- [ ] Minimum window size (800x600) is enforced
- [ ] No content overflow or clipping

---

## ✅ Code Quality

### TypeScript
- [ ] No TypeScript errors: `npm run build`
- [ ] Strict mode enabled
- [ ] All types properly defined

### Rust
- [ ] No Clippy warnings: `cargo clippy --manifest-path src-tauri/Cargo.toml`
- [ ] Code compiles without warnings
- [ ] Proper error propagation

### Formatting
- [ ] Code is formatted consistently
- [ ] Comments explain complex logic
- [ ] Function names are clear

---

## ✅ Documentation

- [ ] README.md is comprehensive
  - [ ] Installation instructions
  - [ ] Development setup
  - [ ] Available scripts
  - [ ] Feature list
- [ ] ROADMAP.md shows Phase 0 complete
- [ ] CHANGELOG.md documents v0.1.0
- [ ] LICENSE file exists (MIT)
- [ ] Code has reasonable comments

---

## ✅ Git Repository

- [ ] All changes committed
- [ ] `.gitignore` properly configured
- [ ] No sensitive data in repo
- [ ] Commit messages are descriptive

---

## 🎯 Phase 0 Success Criteria

All of the following must be true:

- ✅ **Application Runs**: Can launch Graft without errors
- ✅ **Core Functionality**: Can open and view Git repository info
- ✅ **Keyboard Shortcuts**: Work cross-platform
- ✅ **Error Handling**: Provides helpful error messages
- ✅ **Edge Cases**: Handles detached HEAD, bare repos, new repos
- ✅ **UI Polish**: Smooth animations, good accessibility
- ✅ **Documentation**: Complete and accurate
- ✅ **Code Quality**: TypeScript and Rust compile without warnings

---

## 🚀 Ready for Phase 1?

If all items above are checked ✅, then:

**Phase 0 is COMPLETE! 🎉**

You are ready to begin **Phase 1: Repository Browser** (Commit History).

---

## 📝 Notes

Add any notes about issues found during verification:

```
(Add notes here)
```
