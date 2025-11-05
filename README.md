# 🌿 Graft

> A fast, beautiful, keyboard-f
irst Git GUI that doesn't suck.

![Version](h
ttps://img.shields.io/badge/version-1.0.3-gre
en)
![License](https://img.shields.io/badge/l
icense-MIT-blue)
![Status](https://img.shield
s.io/badge/status-Production%20Ready-brightgr
een)

---

## 🎯 Vision

Graft is a modern 
Git GUI built with **native performance** (Ta
uri + Rust), **beautiful design** (React + Ta
ilwind), and a **keyboard-first** approach. I
t's everything existing Git GUIs should be bu
t aren't.

### Why Graft?

Existing Git GUIs 
are either:
- 🐌 **Too slow** (Electron blo
at)
- 😵 **Too complex** (overwhelming inte
rfaces)
- 💸 **Too expensive** (subscriptio
n models)
- 🔒 **Too limited** (missing fea
tures)
- 🖱️ **Mouse-heavy** (no keyboard
 shortcuts)

**Graft solves all of this.**

---

## 📸 Screenshots

### Main Interface

![Graft Main UI](screenshots/main-ui.png)

*Beautiful commit history with visual graph, commit details, and clean dark theme*

### Command Palette

![Command Palette](screenshots/command-palette.png)

*Access 30+ Git operations instantly with Ctrl+K*

### Interactive Rebase

![Interactive Rebase](screenshots/interactive-rebase.png)

*Drag-and-drop commit reordering with visual feedback*

---

## ✨ Features

### 🎨 Core Features (
Phases 0-8)

- ✅ **Lightning Fast** - Nativ
e Tauri app, sub-second startup
- ✅ **Beaut
iful Themes** - Professional dark & clean lig
ht themes with instant switching
- ✅ **Repo
sitory Browser** - Open and browse any Git re
pository
- ✅ **Commit History** - Beautiful
 commit graph with 10,000+ commit support
- �
�� **Visual Git Graph** - Color-coded branch 
visualization
- ✅ **Staging Area** - Stage,
 unstage, and commit files with ease
- ✅ **
Diff Viewer** - Monaco Editor with syntax hig
hlighting
- ✅ **Branch Management** - Creat
e, switch, rename, delete branches
- ✅ **Re
mote Operations** - Push, pull, fetch with SS
H support
- ✅ **Interactive Rebase** - Drag
-and-drop commit reordering
- ✅ **Stash Man
agement** - Save and restore work-in-progress

- ✅ **Git Tags** - View and manage reposit
ory tags

### ⚡ Keyboard & Speed Features (
Phase 9)

- ✅ **Command Palette** (`Cmd/Ctr
l+K`) - Access 30+ commands instantly
- ✅ *
*Quick Search** (`Cmd/Ctrl+P`) - Search commi
ts, branches, stashes
- ✅ **Keyboard Shortc
uts** - 20+ global shortcuts for power users

- ✅ **Shortcuts Overlay** (`Cmd/Ctrl+/`) - 
Learn shortcuts easily
- ✅ **Context Menus*
* - Right-click actions everywhere
- ✅ **Re
cent Commands** - Smart tracking of your most
-used actions
- ✅ **Performance Optimized**
 - Debounced search, minimal re-renders
- ✅
 **Accessibility** - Full ARIA support for sc
reen readers

### 🎨 Polish & Themes (Phase
 10) - NEW IN v1.0.0! ⭐

- ✅ **Complete T
heme System** - Professional dark & clean lig
ht themes
- ✅ **Instant Theme Switching** -
 <100ms transition time
- ✅ **System Theme 
Detection** - Auto-follows OS preference
- �
� **100% Theme Coverage** - All 34 components
 themed
- ✅ **Zero Hardcoded Colors** - Cle
an, maintainable codebase
- ✅ **WCAG AA Acc
essibility** - High contrast in both themes
-
 ✅ **Smooth Animations** - 60fps theme tran
sitions
- ✅ **Persistent Preferences** - Yo
ur theme choice is saved

---

## 🎮 Keyboa
rd Shortcuts

### General
| Shortcut | Action
 |
|----------|--------|
| `Cmd/Ctrl+K` | Ope
n command palette |
| `Cmd/Ctrl+P` | Quick se
arch (commits, branches, stashes) |
| `Cmd/Ct
rl+O` | Open repository |
| `Cmd/Ctrl+/` | Sh
ow keyboard shortcuts |
| `Escape` | Close mo
dals |

### Navigation
| Shortcut | Action |

|----------|--------|
| `Cmd/Ctrl+F` | Search
 commits |
| `Cmd/Ctrl+B` | Toggle branch sid
ebar |
| `Cmd/Ctrl+Shift+S` | Toggle stash si
debar |
| `Arrow Keys` | Navigate lists |
| `
Enter` | View selected item |

### Staging & 
Commits
| Shortcut | Action |
|----------|---
-----|
| `Space` | Stage/unstage file |
| `Cm
d/Ctrl+Enter` | Commit changes |

### Branche
s
| Shortcut | Action |
|----------|--------|

| `Cmd/Ctrl+N` | Create new branch |

---



## 🏆 Why Graft is Better

### vs GitKraken

- ✅ **Free** (GitKraken: $99/year)
- ✅ *
*Native** (GitKraken: Electron bloat)
- ✅ *
*Faster** command palette
- ✅ **Open source
**

### vs Tower
- ✅ **Free** (Tower: $99 o
ne-time)
- ✅ **Has command palette** (Tower
: doesn't)
- ✅ **Better keyboard shortcuts*
*
- ✅ **Open source**

### vs Sublime Merge

- ✅ **Free** (Sublime Merge: $99)
- ✅ **
More features**
- ✅ **Command palette**
- �
�� **Open source**

### vs GitHub Desktop
- �
�� **Pro features** (Interactive rebase, stas
h, etc.)
- ✅ **Command palette**
- ✅ **Co
mprehensive keyboard shortcuts**
- ✅ **Cont
ext menus**

**Result**: Graft has the best k
eyboard experience of any Git GUI, and it's c
ompletely free!

---

## 📥 Installation

#
## Download Graft

**Latest Release**: [v1.0.
3](https://github.com/Dancode-188/graft/relea
ses/latest)

#### Windows
1. Download one of 
the installers:
   - **Recommended**: `Graft_
1.0.1_x64-setup.exe` (NSIS installer)
   - **
Alternative**: `Graft_1.0.1_x64_en-US.msi` (M
SI installer)

2. Run the installer

3. **Win
dows SmartScreen Warning** ⚠️
   
   You 
may see a "Windows protected your PC" warning
. This is normal for open-source applications
 that don't have a paid code-signing certific
ate ($300-500/year).
   
   **Graft is comple
tely safe** - the code is open source and aud
itable.
   
   **To install**:
   - Click **"
More info"**
   - Click **"Run anyway"**
   

   This warning appears for most open-source 
Windows apps, including early versions of VS 
Code and many other trusted tools.

4. Launch
 Graft from Start Menu

#### macOS / Linux
Bu
ilding from source is currently required (see
 Development Setup below).

---

## 🚀 Gett
ing Started

### Quick Start (After Installat
ion)

1. Launch Graft
2. Press `Ctrl+O` (or c
lick "Open Repository") to select a Git repos
itory
3. Explore your commit history!
4. Pres
s `Ctrl+K` to open the command palette
5. Pre
ss `Ctrl+/` to see all keyboard shortcuts

##
# Building from Source

#### Prerequisites

B
efore building Graft, ensure you have:

- **N
ode.js** (v18 or higher) - [Download](https:/
/nodejs.org/)
- **Rust** (latest stable) - [I
nstall via rustup](https://rustup.rs/)
- **Gi
t** (obviously 😄)

#### Platform-Specific 
Requirements

**macOS:**
- Xcode Command Line
 Tools: `xcode-select --install`

**Windows:*
*
- Microsoft C++ Build Tools
- WebView2 (usu
ally pre-installed on Windows 10/11)

**Linux
:**
```bash
# Debian/Ubuntu
sudo apt install 
libwebkit2gtk-4.1-dev \
  build-essential \
 
 curl \
  wget \
  file \
  libssl-dev \
  li
bgtk-3-dev \
  libayatana-appindicator3-dev \

  librsvg2-dev

# Fedora
sudo dnf install we
bkit2gtk4.1-devel \
  openssl-devel \
  curl 
\
  wget \
  file \
  libappindicator-gtk3-de
vel \
  librsvg2-devel

# Arch
sudo pacman -S
 webkit2gtk \
  base-devel \
  curl \
  wget 
\
  file \
  openssl \
  appmenu-gtk-module \

  gtk3 \
  libappindicator-gtk3 \
  librsvg

```

---

## 🛠️ Development Setup

### 1
. Clone the Repository
```bash
git clone http
s://github.com/Dancode-188/graft.git
cd graft

```

### 2. Install Dependencies
```bash
npm
 install
```

### 3. Run Development Server
`
``bash
npm run tauri:dev
```

This will:
- St
art the Vite dev server (frontend)
- Compile 
the Rust backend
- Launch the Graft window wi
th hot reload enabled

### 4. Build for Produ
ction
```bash
npm run tauri:build
```

The co
mpiled app will be in `src-tauri/target/relea
se/bundle/`

---


## 📦 Available Scripts


| Command | Description |
|---------|-------
------|
| `npm run dev` | Start Vite dev serv
er (frontend only) |
| `npm run tauri:dev` | 
Run full Tauri app in development mode |
| `n
pm run tauri:build` | Build production-ready 
app |
| `npm run build` | Build frontend only
 |

---

## 🎨 Tech Stack

- **Frontend:** 
React 18 + TypeScript + Tailwind CSS
- **Back
end:** Rust + Tauri 2.0
- **Git Integration:*
* libgit2 (via git2-rs)
- **Build Tool:** Vit
e
- **Editor:** Monaco Editor (for diffs)
- *
*UI Components:** Custom (no heavy framework)


---

## 📂 Project Structure

```
graft/

├── src/                          # Fro
ntend React code
│   ├── App.tsx     
              # Main application component
�
�   ├── main.tsx                  # Rea
ct entry point
│   ├── components/
�
�   │   ├── command-palette/      # C
ommand palette (Cmd+K)
│   │   ├── 
keyboard/             # Keyboard shortcuts sy
stem
│   │   ├── quick-search/     
    # Quick search (Cmd+P)
│   │   ├─
─ stash/                # Stash management

│   │   ├── branches/             #
 Branch operations
│   │   └── ... 
                  # Other components
│   �
�── hooks/                    # Custom Re
act hooks
│   ├── utils/             
       # Utility functions
│   └── st
yles.css                # Global styles + Tai
lwind
├── src-tauri/                   
 # Rust backend
│   ├── src/
│   �
�   ├── main.rs               # Tauri a
pp entry
│   │   └── lib.rs        
        # Git operations & commands
│   ├
── Cargo.toml                # Rust depen
dencies
│   └── tauri.conf.json      
     # Tauri configuration
├── .github/
                      # GitHub templates
│ 
  ├── ISSUE_TEMPLATE/           # Bug &
 feature templates
│   └── PULL_REQUE
ST_TEMPLATE.md  # PR template
├── ROADM
AP.md                    # Development phases
 & roadmap
├── CONTRIBUTING.md         
      # Contribution guidelines
├── COD
E_OF_CONDUCT.md            # Community standa
rds
├── CHANGELOG.md                  #
 Version history
└── package.json      
            # Node dependencies
```

---

## 
🗺️ Roadmap

### Completed Phases ✅

- 
**Phase 0: Foundation** - Project setup, basi
c UI
- **Phase 1: Repository Browser** - Open
 and browse repos
- **Phase 2: Commit Graph**
 - Beautiful visual history
- **Phase 3: Stag
ing & Commits** - Make commits through GUI
- 
**Phase 4: Diff Viewer** - Monaco Editor with
 syntax highlighting
- **Phase 5: Branching**
 - Branch operations
- **Phase 6: Push/Pull/F
etch** - Remote operations
- **Phase 7: Inter
active Rebase** - Drag-and-drop reordering
- 
**Phase 8: Stash Management** - Save and rest
ore WIP
- **Phase 9: Keyboard & Speed** - Com
mand palette, shortcuts, performance ⭐
- **
Phase 10: Polish & Themes** - Complete light/
dark theme system ⭐

### 🚀 v1.0.0 - Prod
uction Ready!

Graft is now **production-read
y** with all 10 planned phases complete! 🎉


**What's Next?**
- Multi-repo workspaces
- 
Cherry-pick improvements
- Visual merge confl
ict resolution
- Git blame annotations
- Subm
odule support

See [ROADMAP.md](./ROADMAP.md)
 for complete details.

---

## 📈 Performa
nce

Graft is designed for speed:

- **Startu
p**: <1 second
- **Large Repos**: Handles 10,
000+ commits smoothly
- **Command Palette**: 
Opens in <50ms
- **Search**: Updates in <100m
s
- **Virtual Scrolling**: Smooth with thousa
nds of items
- **Memory**: Efficient with mem
oization and optimization

---

## ♿ Access
ibility

Graft is fully accessible:

- ✅ **
Screen Reader Support** - Full ARIA labels
- 
✅ **Keyboard Navigation** - 95% of actions 
accessible via keyboard
- ✅ **High Contrast
** - Clear visual hierarchy
- ✅ **Focus Man
agement** - Proper focus indicators

---


##
 🤝 Contributing

Graft is in active develo
pment! We welcome contributions.

### How to 
Contribute

1. **Fork the repository**
2. **C
reate a feature branch**: `git checkout -b fe
ature/amazing-feature`
3. **Commit your chang
es**: `git commit -m 'Add amazing feature'`
4
. **Push to the branch**: `git push origin fe
ature/amazing-feature`
5. **Open a Pull Reque
st**

### Development Guidelines

- Follow ex
isting code style
- Add tests for new feature
s
- Update documentation
- Keep commits focus
ed and atomic
- Write clear commit messages


---

## 🐛 Known Issues

Check [GitHub Issu
es](https://github.com/Dancode-188/graft/issu
es) for current bugs and feature requests.

-
--

## 📄 License

MIT License - see [LICEN
SE](./LICENSE) file for details

---

## 💬
 Inspiration

Graft is inspired by:
- **VS Co
de** - Command palette design
- **Sublime Mer
ge** - Speed and keyboard-first design
- **Gi
tKraken** - Beautiful commit graphs
- **Rayca
st** - Beautiful launcher UX
- **Vim** - Keyb
oard-first philosophy

We're taking the best 
ideas and making them free, fast, and open so
urce.

---

## 🌟 Show Your Support

If you
 like Graft, give it a ⭐ on GitHub!

### St
ay Updated

- 🌟 Star the repo
- 👁️ Wa
tch for releases
- 🐦 Follow development up
dates
- 💬 Join discussions

---

## 📚 D
ocumentation

- [ROADMAP.md](./ROADMAP.md) - 
Development roadmap and future plans
- [CONTR
IBUTING.md](./CONTRIBUTING.md) - How to contr
ibute to Graft
- [CODE_OF_CONDUCT.md](./CODE_
OF_CONDUCT.md) - Community guidelines
- [CHAN
GELOG.md](./CHANGELOG.md) - Full version hist
ory
- [GitHub Releases](https://github.com/Da
ncode-188/graft/releases) - Release notes

--
-

## 🎉 Recent Releases

### v1.0.3 - Auth
entication Fix (November 4, 2025) 🎊 LATEST


**Critical Patch**: Fixed Push/Pull Authent
ication

- 🔐 Fixed HTTPS authentication fo
r push/pull/fetch operations
- ✅ Added supp
ort for Git Credential Manager
- 🐛 Resolve
d 401 errors on HTTPS remotes
- 🔑 Now work
s with both SSH and HTTPS authentication
- �
� Push functionality fully working

[View on 
GitHub Releases](https://github.com/Dancode-1
88/graft/releases/tag/v1.0.3)

### v1.0.2 - C
lean & Ready (November 4, 2025)

**Patch Rele
ase**: Repository Cleanup & Polish

- 🧹 Cl
eaned up 65+ internal development files
- �
� Added comprehensive contributor documentati
on
- 🤝 Added GitHub issue & PR templates
-
 👥 Added CODE_OF_CONDUCT & CONTRIBUTING gu
ides
- 🐛 Fixed all README links to correct
 repository

[View on GitHub Releases](https:
//github.com/Dancode-188/graft/releases/tag/v
1.0.2)

### v1.0.1 - Bug Fixes & Documentatio
n (November 4, 2025)

**Patch Release**: Poli
sh & Documentation

- 🐛 Fixed version disp
lay and status bar bugs
- 📚 Added comprehe
nsive installation guide
- 🔧 Added trouble
shooting section for common issues
- ✨ Impr
oved Windows SmartScreen instructions
- 🔑 
Added SSH/HTTPS authentication setup guide

[
View on GitHub Releases](https://github.com/D
ancode-188/graft/releases/tag/v1.0.1)

### Pr
evious Major Features

**v1.0.0 (November 3, 
2025)** - Production Ready!
- Complete theme 
system (dark & light)
- 100% theme coverage a
cross all components
- Instant theme switchin
g
- WCAG AA accessibility

**Earlier Releases
:**
- **v0.9.0** - Keyboard & Speed (Command 
palette, shortcuts, performance)
- **v0.8.0**
 - Stash Management
- **v0.7.0** - Interactiv
e Rebase
- **v0.6.0** - Push/Pull/Fetch
- **v
0.5.0** - Branch Operations

**See all releas
es**: [GitHub Releases](https://github.com/Da
ncode-188/graft/releases)

---

## 🎯 Proje
ct Status

| Feature | Status |
|---------|--
------|
| Core Git Operations | ✅ Complete 
|
| Commit History | ✅ Complete |
| Visual 
Graph | ✅ Complete |
| Staging & Commits | 
✅ Complete |
| Diff Viewer | ✅ Complete |

| Branch Management | ✅ Complete |
| Remot
e Operations | ✅ Complete |
| Interactive R
ebase | ✅ Complete |
| Stash Management | �
�� Complete |
| Command Palette | ✅ Complet
e |
| Keyboard Shortcuts | ✅ Complete |
| Q
uick Search | ✅ Complete |
| Context Menus 
| ✅ Complete |
| Performance | ✅ Optimize
d |
| Accessibility | ✅ Complete |
| Light 
Theme | ✅ Complete |
| Dark Theme | ✅ Com
plete |
| Theme System | ✅ Complete |
| v1.
0.0 Status | ✅ Production Ready |

---

## 
🔧 Troubleshooting

### Windows SmartScreen
 Warning

**Issue**: "Windows protected your 
PC" warning appears when installing.

**Solut
ion**: This is expected for unsigned apps.
1.
 Click **"More info"**
2. Click **"Run anyway
"**

**Why this happens**: Graft is not code-
signed (certificates cost $300-500/year). Thi
s is normal for open-source software. The cod
e is completely safe and auditable on GitHub.


---

### Push/Pull Authentication

**Issue*
*: Push or Pull operations fail with authenti
cation errors.

**Solution**: Configure your 
Git credentials for remote operations.

#### 
For SSH (Recommended):
```bash
# 1. Generate 
SSH key (if you don't have one)
ssh-keygen -t
 ed25519 -C "your_email@example.com"

# 2. Ad
d to ssh-agent
eval "$(ssh-agent -s)"
ssh-add
 ~/.ssh/id_ed25519

# 3. Add public key to Gi
tHub/GitLab
cat ~/.ssh/id_ed25519.pub
# Copy 
and paste to GitHub Settings → SSH Keys
```


#### For HTTPS:
```bash
# Configure Git cre
dential helper
git config --global credential
.helper store
# Next push/pull will ask for c
redentials once
```

After configuring creden
tials once, Graft will use your system's Git 
configuration for all operations.

---

### C
an't Open Repository

**Issue**: "Failed to o
pen repository" error.

**Solutions**:
- Ensu
re the selected folder is a valid Git reposit
ory (contains `.git` folder)
- Check you have
 read permissions for the directory
- Try clo
sing and reopening Graft
- Check the reposito
ry isn't corrupted: `git status` in terminal


---

### Performance Issues

**Issue**: Slow
 performance with large repositories.

**Solu
tions**:
- Graft handles 10,000+ commits smoo
thly
- If experiencing slowness, check availa
ble RAM
- Try closing other resource-intensiv
e applications
- Consider using `git gc` to o
ptimize your repository

---

### Need More H
elp?

- 🐛 **Report bugs**: [GitHub Issues]
(https://github.com/Dancode-188/graft/issues)

- 💬 **Get help**: [GitHub Discussions](ht
tps://github.com/Dancode-188/graft/discussion
s)
- 📖 **Documentation**: [Full docs](./RE
ADME.md)

---

## 💡 Quick Start Guide

###
 First Time Users

1. **Open Graft** and pres
s `Cmd+O` to open a repository
2. **Browse co
mmits** with arrow keys
3. **Try command pale
tte** with `Cmd+K`
4. **Search everything** w
ith `Cmd+P`
5. **Learn shortcuts** with `Cmd+
/`
6. **Right-click** on commits, stashes, or
 files for actions

### Power Users

Graft is
 built for you! Here's how to be 10x faster:


- Use `Cmd+K` instead of clicking menus
- Ma
ster the shortcuts with `Cmd+/`
- Search with
 `Cmd+P` instead of scrolling
- Right-click f
or quick actions
- Use `Space` to stage/unsta
ge files
- Never touch your mouse 😎

---


**Built with 🌿 by developers who are tired
 of bad Git GUIs**

*Graft: The Git GUI that 
power users actually want to use.* ⚡


