# 🌿 Graft

> A fast, beautiful, keyboard-first Git GUI that doesn't suck.

![Version](https://img.shields.io/badge/version-0.9.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-Phase%209%20Complete-brightgreen)

---

## 🎯 Vision

Graft is a modern Git GUI built with **native performance** (Tauri + Rust), **beautiful design** (React + Tailwind), and a **keyboard-first** approach. It's everything existing Git GUIs should be but aren't.

### Why Graft?

Existing Git GUIs are either:
- 🐌 **Too slow** (Electron bloat)
- 😵 **Too complex** (overwhelming interfaces)
- 💸 **Too expensive** (subscription models)
- 🔒 **Too limited** (missing features)
- 🖱️ **Mouse-heavy** (no keyboard shortcuts)

**Graft solves all of this.**

---

## ✨ Features

### 🎨 Core Features (Phases 0-8)

- ✅ **Lightning Fast** - Native Tauri app, sub-second startup
- ✅ **Beautiful Dark Theme** - Modern, clean interface with smooth animations
- ✅ **Repository Browser** - Open and browse any Git repository
- ✅ **Commit History** - Beautiful commit graph with 10,000+ commit support
- ✅ **Visual Git Graph** - Color-coded branch visualization
- ✅ **Staging Area** - Stage, unstage, and commit files with ease
- ✅ **Diff Viewer** - Monaco Editor with syntax highlighting
- ✅ **Branch Management** - Create, switch, rename, delete branches
- ✅ **Remote Operations** - Push, pull, fetch with SSH support
- ✅ **Interactive Rebase** - Drag-and-drop commit reordering
- ✅ **Stash Management** - Save and restore work-in-progress
- ✅ **Git Tags** - View and manage repository tags

### ⚡ Keyboard & Speed Features (Phase 9) - NEW!

- ✅ **Command Palette** (`Cmd/Ctrl+K`) - Access 30+ commands instantly
- ✅ **Quick Search** (`Cmd/Ctrl+P`) - Search commits, branches, stashes
- ✅ **Keyboard Shortcuts** - 20+ global shortcuts for power users
- ✅ **Shortcuts Overlay** (`Cmd/Ctrl+/`) - Learn shortcuts easily
- ✅ **Context Menus** - Right-click actions everywhere
- ✅ **Recent Commands** - Smart tracking of your most-used actions
- ✅ **Performance Optimized** - Debounced search, minimal re-renders
- ✅ **Accessibility** - Full ARIA support for screen readers

---

## 🎮 Keyboard Shortcuts

### General
| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+K` | Open command palette |
| `Cmd/Ctrl+P` | Quick search (commits, branches, stashes) |
| `Cmd/Ctrl+O` | Open repository |
| `Cmd/Ctrl+/` | Show keyboard shortcuts |
| `Escape` | Close modals |

### Navigation
| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+F` | Search commits |
| `Cmd/Ctrl+B` | Toggle branch sidebar |
| `Cmd/Ctrl+Shift+S` | Toggle stash sidebar |
| `Arrow Keys` | Navigate lists |
| `Enter` | View selected item |

### Staging & Commits
| Shortcut | Action |
|----------|--------|
| `Space` | Stage/unstage file |
| `Cmd/Ctrl+Enter` | Commit changes |

### Branches
| Shortcut | Action |
|----------|--------|
| `Cmd/Ctrl+N` | Create new branch |

---


## 🏆 Why Graft is Better

### vs GitKraken
- ✅ **Free** (GitKraken: $99/year)
- ✅ **Native** (GitKraken: Electron bloat)
- ✅ **Faster** command palette
- ✅ **Open source**

### vs Tower
- ✅ **Free** (Tower: $99 one-time)
- ✅ **Has command palette** (Tower: doesn't)
- ✅ **Better keyboard shortcuts**
- ✅ **Open source**

### vs Sublime Merge
- ✅ **Free** (Sublime Merge: $99)
- ✅ **More features**
- ✅ **Command palette**
- ✅ **Open source**

### vs GitHub Desktop
- ✅ **Pro features** (Interactive rebase, stash, etc.)
- ✅ **Command palette**
- ✅ **Comprehensive keyboard shortcuts**
- ✅ **Context menus**

**Result**: Graft has the best keyboard experience of any Git GUI, and it's completely free!

---

## 🚀 Getting Started

### Prerequisites

Before building Graft, ensure you have:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Rust** (latest stable) - [Install via rustup](https://rustup.rs/)
- **Git** (obviously 😄)

#### Platform-Specific Requirements

**macOS:**
- Xcode Command Line Tools: `xcode-select --install`

**Windows:**
- Microsoft C++ Build Tools
- WebView2 (usually pre-installed on Windows 10/11)

**Linux:**
```bash
# Debian/Ubuntu
sudo apt install libwebkit2gtk-4.1-dev \
  build-essential \
  curl \
  wget \
  file \
  libssl-dev \
  libgtk-3-dev \
  libayatana-appindicator3-dev \
  librsvg2-dev

# Fedora
sudo dnf install webkit2gtk4.1-devel \
  openssl-devel \
  curl \
  wget \
  file \
  libappindicator-gtk3-devel \
  librsvg2-devel

# Arch
sudo pacman -S webkit2gtk \
  base-devel \
  curl \
  wget \
  file \
  openssl \
  appmenu-gtk-module \
  gtk3 \
  libappindicator-gtk3 \
  librsvg
```

---

## 🛠️ Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/graft.git
cd graft
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run tauri:dev
```

This will:
- Start the Vite dev server (frontend)
- Compile the Rust backend
- Launch the Graft window with hot reload enabled

### 4. Build for Production
```bash
npm run tauri:build
```

The compiled app will be in `src-tauri/target/release/bundle/`

---


## 📦 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server (frontend only) |
| `npm run tauri:dev` | Run full Tauri app in development mode |
| `npm run tauri:build` | Build production-ready app |
| `npm run build` | Build frontend only |

---

## 🎨 Tech Stack

- **Frontend:** React 18 + TypeScript + Tailwind CSS
- **Backend:** Rust + Tauri 2.0
- **Git Integration:** libgit2 (via git2-rs)
- **Build Tool:** Vite
- **Editor:** Monaco Editor (for diffs)
- **UI Components:** Custom (no heavy framework)

---

## 📂 Project Structure

```
graft/
├── src/                          # Frontend React code
│   ├── App.tsx                   # Main application component
│   ├── main.tsx                  # React entry point
│   ├── components/
│   │   ├── command-palette/      # Command palette (Cmd+K)
│   │   ├── keyboard/             # Keyboard shortcuts system
│   │   ├── quick-search/         # Quick search (Cmd+P)
│   │   ├── stash/                # Stash management
│   │   ├── branches/             # Branch operations
│   │   └── ...                   # Other components
│   ├── hooks/                    # Custom React hooks
│   ├── utils/                    # Utility functions
│   └── styles.css                # Global styles + Tailwind
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs               # Tauri app entry
│   │   └── lib.rs                # Git operations & commands
│   ├── Cargo.toml                # Rust dependencies
│   └── tauri.conf.json           # Tauri configuration
├── ROADMAP.md                    # Development phases
├── PHASE_9_COMPLETE.md           # Phase 9 completion report
├── RELEASE_v0.9.0.md             # v0.9.0 release notes
└── package.json                  # Node dependencies
```

---

## 🗺️ Roadmap

### Completed Phases ✅

- **Phase 0: Foundation** - Project setup, basic UI
- **Phase 1: Repository Browser** - Open and browse repos
- **Phase 2: Commit Graph** - Beautiful visual history
- **Phase 3: Staging & Commits** - Make commits through GUI
- **Phase 4: Diff Viewer** - Monaco Editor with syntax highlighting
- **Phase 5: Branching** - Branch operations
- **Phase 6: Push/Pull/Fetch** - Remote operations
- **Phase 7: Interactive Rebase** - Drag-and-drop reordering
- **Phase 8: Stash Management** - Save and restore WIP
- **Phase 9: Keyboard & Speed** - Command palette, shortcuts, performance ⭐

### Next Phase 🚀

**Phase 10: Polish & Themes** (Coming Soon)
- Light theme (in addition to dark)
- Custom color schemes
- Font customization
- Syntax highlighting themes
- UI density options
- Enhanced accessibility
- More animations

See [ROADMAP.md](./ROADMAP.md) for complete details.

---

## 📈 Performance

Graft is designed for speed:

- **Startup**: <1 second
- **Large Repos**: Handles 10,000+ commits smoothly
- **Command Palette**: Opens in <50ms
- **Search**: Updates in <100ms
- **Virtual Scrolling**: Smooth with thousands of items
- **Memory**: Efficient with memoization and optimization

---

## ♿ Accessibility

Graft is fully accessible:

- ✅ **Screen Reader Support** - Full ARIA labels
- ✅ **Keyboard Navigation** - 95% of actions accessible via keyboard
- ✅ **High Contrast** - Clear visual hierarchy
- ✅ **Focus Management** - Proper focus indicators

---


## 🤝 Contributing

Graft is in active development! We welcome contributions.

### How to Contribute

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Keep commits focused and atomic
- Write clear commit messages

---

## 🐛 Known Issues

Check [GitHub Issues](https://github.com/yourusername/graft/issues) for current bugs and feature requests.

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 💬 Inspiration

Graft is inspired by:
- **VS Code** - Command palette design
- **Sublime Merge** - Speed and keyboard-first design
- **GitKraken** - Beautiful commit graphs
- **Raycast** - Beautiful launcher UX
- **Vim** - Keyboard-first philosophy

We're taking the best ideas and making them free, fast, and open source.

---

## 🌟 Show Your Support

If you like Graft, give it a ⭐ on GitHub!

### Stay Updated

- 🌟 Star the repo
- 👁️ Watch for releases
- 🐦 Follow development updates
- 💬 Join discussions

---

## 📚 Documentation

- [ROADMAP.md](./ROADMAP.md) - Development roadmap
- [PHASE_9_COMPLETE.md](./PHASE_9_COMPLETE.md) - Phase 9 completion report
- [RELEASE_v0.9.0.md](./RELEASE_v0.9.0.md) - Latest release notes
- [CHANGELOG.md](./CHANGELOG.md) - Full changelog

---

## 🎉 Recent Releases

### v0.9.0 - Keyboard & Speed (November 2, 2025) ⭐ LATEST

**Major Release**: Power User Features

- ⚡ Command Palette (Cmd+K) - 30+ commands
- 🔍 Quick Search (Cmd+P) - Search everything
- ⌨️ Keyboard Shortcuts - 20+ global shortcuts
- 🖱️ Context Menus - Right-click everywhere
- ✨ Performance - 80% fewer re-renders
- ♿ Accessibility - Full ARIA support

[View Full Release Notes](./RELEASE_v0.9.0.md)

### Previous Releases

- **v0.8.0** - Stash Management
- **v0.7.0** - Interactive Rebase
- **v0.6.0** - Push/Pull/Fetch
- **v0.5.0** - Branch Operations

---

## 🎯 Project Status

| Feature | Status |
|---------|--------|
| Core Git Operations | ✅ Complete |
| Commit History | ✅ Complete |
| Visual Graph | ✅ Complete |
| Staging & Commits | ✅ Complete |
| Diff Viewer | ✅ Complete |
| Branch Management | ✅ Complete |
| Remote Operations | ✅ Complete |
| Interactive Rebase | ✅ Complete |
| Stash Management | ✅ Complete |
| Command Palette | ✅ Complete |
| Keyboard Shortcuts | ✅ Complete |
| Quick Search | ✅ Complete |
| Context Menus | ✅ Complete |
| Performance | ✅ Optimized |
| Accessibility | ✅ Complete |
| Light Theme | 🚧 Coming in v0.10.0 |
| Custom Themes | 🚧 Coming in v0.10.0 |

---

## 💡 Quick Start Guide

### First Time Users

1. **Open Graft** and press `Cmd+O` to open a repository
2. **Browse commits** with arrow keys
3. **Try command palette** with `Cmd+K`
4. **Search everything** with `Cmd+P`
5. **Learn shortcuts** with `Cmd+/`
6. **Right-click** on commits, stashes, or files for actions

### Power Users

Graft is built for you! Here's how to be 10x faster:

- Use `Cmd+K` instead of clicking menus
- Master the shortcuts with `Cmd+/`
- Search with `Cmd+P` instead of scrolling
- Right-click for quick actions
- Use `Space` to stage/unstage files
- Never touch your mouse 😎

---

**Built with 🌿 by developers who are tired of bad Git GUIs**

*Graft: The Git GUI that power users actually want to use.* ⚡
