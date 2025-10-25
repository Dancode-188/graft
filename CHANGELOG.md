# Changelog

All notable changes to Graft will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [0.1.0] - 2025-10-25

### 🎉 Phase 0 Complete - Foundation

This is the first milestone of Graft! Phase 0 establishes the foundation for a modern, fast Git GUI.

### Added

#### Core Features
- **Repository Opening**: Open any Git repository via file picker
- **Repository Info Display**: Shows repo name, path, current branch, and type
- **Keyboard Shortcuts**: 
  - `Cmd+O` (macOS) / `Ctrl+O` (Windows/Linux) to open repository
  - OS detection for proper shortcut key display
- **Error Handling**: Comprehensive error messages for common issues:
  - Non-Git directories
  - Path doesn't exist
  - Permission errors
  - Bare repositories

#### UI/UX
- **Modern Dark Theme**: Beautiful zinc-950 color scheme
- **Smooth Animations**: Fade-in animations for state transitions
- **Responsive Design**: Clean, centered layouts
- **Custom Scrollbars**: Themed scrollbars matching dark mode
- **Focus States**: Proper keyboard focus indicators for accessibility
- **Loading States**: Visual feedback during async operations

#### Technical
- **Tauri 2.0**: Native desktop app framework
- **React 18 + TypeScript**: Modern frontend stack
- **Tailwind CSS**: Utility-first styling with custom Graft color palette
- **libgit2 (git2-rs)**: Rust Git library integration
- **Vite**: Fast development server with HMR
- **Tauri Plugins**:
  - `tauri-plugin-dialog`: File picker
  - `tauri-plugin-fs`: Filesystem access
  - `tauri-plugin-opener`: External links

#### Edge Case Handling
- **Detached HEAD**: Shows commit SHA when HEAD is detached
- **Unborn Branch**: Handles repos with no commits yet
- **Bare Repositories**: Detects and displays bare repo status
- **Invalid Paths**: Clear error when path doesn't exist
- **Non-Git Directories**: Helpful message suggesting .git directory check

### Development
- Hot reload enabled for fast iteration
- TypeScript strict mode for type safety
- Comprehensive documentation (README, ROADMAP, RESEARCH)
- Clear project structure

---

## [Unreleased]

### Phase 1: Repository Browser (Next)
- Commit history list
- Beautiful commit graph
- Commit details panel
- File tree navigation

See [ROADMAP.md](./ROADMAP.md) for full future plans.

---

## Version History

- **v0.1.0** (2025-10-25) - Phase 0: Foundation Complete ✅
- More to come...
