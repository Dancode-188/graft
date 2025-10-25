# 🌿 Graft

> A fast, beautiful, keyboard-first Git GUI that doesn't suck.

![Version](https://img.shields.io/badge/version-0.1.0-green)
![License](https://img.shields.io/badge/license-MIT-blue)
![Status](https://img.shields.io/badge/status-Phase%200%20Complete-brightgreen)

---

## 🎯 Vision

Graft is a modern Git GUI built with **native performance** (Tauri + Rust), **beautiful design** (React + Tailwind), and a **keyboard-first** approach. It's everything existing Git GUIs should be but aren't.

### Why Graft?

Existing Git GUIs are either:
- 🐌 **Too slow** (Electron bloat)
- 😵 **Too complex** (overwhelming interfaces)
- 💸 **Too expensive** (subscription models)
- 🔒 **Too limited** (missing features)

**Graft solves all of this.**

---

## ✨ Features (Phase 0 Complete)

- ✅ **Lightning Fast** - Native Tauri app, sub-second startup
- ✅ **Beautiful Dark Theme** - Modern, clean interface
- ✅ **Repository Browser** - Open any Git repo instantly
- ✅ **Branch Detection** - See current branch, detached HEAD states
- ✅ **Keyboard Shortcuts** - `Cmd+O` / `Ctrl+O` to open repos
- ✅ **Smart Error Messages** - Helpful, actionable error feedback
- ✅ **Cross-Platform** - Works on macOS, Windows, and Linux

### Coming Soon (Phase 1+)
- 🔜 Commit history with beautiful graph
- 🔜 Stage & commit files
- 🔜 Interactive rebase (drag-and-drop)
- 🔜 Stash management
- 🔜 Branch operations
- 🔜 Push/pull/fetch
- 🔜 Command palette

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
- **UI Components:** Custom (no heavy framework)

---

## 🎮 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Cmd+O` (Mac) / `Ctrl+O` (Windows/Linux) | Open repository |
| More coming in Phase 1+ | ... |

---

## 📂 Project Structure

```
graft/
├── src/                    # Frontend React code
│   ├── App.tsx            # Main application component
│   ├── main.tsx           # React entry point
│   └── styles.css         # Global styles + Tailwind
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs        # Tauri app entry
│   │   └── lib.rs         # Git operations & commands
│   ├── Cargo.toml         # Rust dependencies
│   └── tauri.conf.json    # Tauri configuration
├── ROADMAP.md             # Development phases
├── RESEARCH.md            # Competitive analysis
└── package.json           # Node dependencies
```

---

## 🐛 Known Issues

- None yet! Phase 0 is solid ✅

---

## 🗺️ Roadmap

**Phase 0: Foundation** ✅ (Complete!)
- [x] Project setup
- [x] React + TypeScript + Tailwind
- [x] Git repository opening
- [x] Basic UI
- [x] Keyboard shortcuts

**Phase 1: Commit History** (Next - Weeks 3-4)
- [ ] Display commit list
- [ ] Beautiful commit graph
- [ ] Commit details panel
- [ ] Virtualized scrolling for large repos

**Phase 2+:** See [ROADMAP.md](./ROADMAP.md) for full details

---

## 🤝 Contributing

Graft is in active development! Contributions are welcome once we hit Beta (Phase 1 complete).

For now, follow development progress and star the repo to stay updated!

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 💬 Inspiration

Graft is inspired by:
- **Sublime Merge** - Speed and keyboard-first design
- **GitKraken** - Beautiful commit graphs
- **GitHub Desktop** - Simplicity and clarity

We're taking the best ideas and making them free, fast, and open source.

---

## 🌟 Show Your Support

If you like Graft, give it a ⭐ on GitHub!

---

**Built with 🌿 by developers who are tired of bad Git GUIs**
