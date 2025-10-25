# Graft - Competitive Research

## Why Existing Git GUIs Suck

### The Current Landscape

Every developer who's tried a Git GUI has the same frustration: **they're all terrible**. Here's what's wrong with each major player:

---

## 1. **GitKraken** 
### Problems:
- **Expensive**: $60-99/year subscription model
- **Bloated**: Electron-based, massive memory footprint (300-500MB RAM)
- **Slow**: Laggy on large repositories
- **Forced Cloud**: Pushes their cloud services hard
- **Feature Creep**: Too many features you never use
- **Free Version Limits**: Can't use with private repos on free tier

### What They Do Right:
- Beautiful commit graph visualization
- Good interactive rebase UI
- Decent merge conflict resolution

---

## 2. **GitHub Desktop**
### Problems:
- **Too Simple**: Missing essential features (interactive rebase, cherry-pick, stash management)
- **GitHub-Centric**: Works best only with GitHub repos
- **Limited Branching**: No advanced branch operations
- **No Command Line**: Can't drop to terminal when needed
- **Basic History**: Poor commit history visualization

### What They Do Right:
- Clean, simple interface
- Fast and lightweight
- Good for beginners
- Free

---

## 3. **SourceTree** (Atlassian)
### Problems:
- **Crashes Constantly**: Stability issues reported across all platforms
- **Slow Performance**: Takes forever to refresh large repos
- **Clunky UI**: Dated interface design
- **Account Required**: Forces Atlassian account registration
- **Mac/Windows Only**: No Linux support
- **Bitbucket Push**: Heavy integration with Bitbucket

### What They Do Right:
- Feature complete
- Free
- Git Flow integration

---

## 4. **GitExtensions**
### Problems:
- **No Dark Mode** (in 2024!)
- **Windows Only**: Not cross-platform
- **Outdated UI**: Looks like Windows XP
- **Confusing UX**: Too many buttons and options
- **Poor Documentation**: Hard to learn advanced features

### What They Do Right:
- Open source
- Feature complete
- Free

---

## 5. **SmartGit**
### Problems:
- **Paid**: $99/year commercial license
- **Java-Based**: Heavy on resources
- **Complex UI**: Overwhelming for common tasks
- **Slow Updates**: Features lag behind competition

### What They Do Right:
- Very feature complete
- Cross-platform
- Good for enterprise

---

## 6. **Fork**
### Problems:
- **Mac/Windows Only**: No Linux
- **Closed Source**: Can't contribute or customize
- **Limited Free Version**: Some features behind paywall
- **Performance Issues**: Slow on large repos

### What They Do Right:
- Clean UI
- Fast for small/medium repos
- Good merge tool

---

## 7. **Sublime Merge**
### Problems:
- **Paid**: $99 one-time (good) but no trial limit
- **Minimal**: Too bare-bones for some users
- **Keyboard-Heavy**: Steep learning curve
- **Limited Integrations**: Few third-party tool connections

### What They Do Right:
- **Fast**: Seriously fast
- **Keyboard First**: Vim-like shortcuts
- **Beautiful**: Clean, modern design
- Native performance (C++)
- Three-way merge tool

---

## Common Complaints Across All Tools

### Performance Issues
- Slow on repositories with >10k commits
- High memory usage (Electron apps)
- Laggy diff rendering
- Slow startup times

### UX Problems
- Too complex OR too simple (no middle ground)
- Confusing information architecture
- Poor keyboard navigation
- Cluttered interfaces with rarely-used features
- Bad or missing documentation

### Missing Features
- No good interactive rebase UI
- Poor stash management
- Limited customization
- No command palette
- Bad or missing CLI integration
- No workspace/project management

### Platform Issues
- Electron = heavy and slow
- Java = heavy and ugly
- Cross-platform inconsistencies
- Poor Linux support

---

## What Developers Actually Want

Based on Reddit threads, HN discussions, and forum posts:

### Must-Haves
1. **Fast** - No lag, instant startup
2. **Native Feel** - Not Electron/Java
3. **Beautiful Diff** - Monaco-quality code viewing
4. **Smart Merge** - Visual, intuitive conflict resolution
5. **Interactive Rebase** - Drag-and-drop commits
6. **Keyboard First** - Vim-like shortcuts, command palette

### Nice-to-Haves
1. Dark mode (obviously)
2. Stash manager with previews
3. Branch management tools
4. Workspace switching
5. Command palette (like VS Code)
6. Custom themes
7. Plugin system
8. File tree with search
9. Blame annotations inline
10. PR integration (optional)

### Deal-Breakers
1. **Subscription pricing** - People hate SaaS for desktop tools
2. **Electron bloat** - Developers notice and complain
3. **Account required** - Friction for no reason
4. **Missing Linux** - Open source devs need it
5. **Slow performance** - On large repos

---

## The Gap in the Market

### What's Missing?
A Git GUI that is:
- **Native Performance** (Tauri/Rust, not Electron)
- **Beautiful & Modern** (2024 design standards)
- **Fast** (handles large repos gracefully)
- **Keyboard-First** (but mouse-friendly too)
- **Free & Open Source** (or cheap one-time payment)
- **Cross-Platform** (including Linux)
- **Focused** (80% use case, not everything)
- **Progressive Disclosure** (simple by default, power when needed)

### Target Audience
1. **Professional developers** who know Git but hate the CLI for visual tasks
2. **Intermediate users** who want to learn advanced Git without memorizing commands
3. **Visual thinkers** who understand flow better than text
4. **Teams** who need consistency across skill levels

### The Sublime Merge Problem
Sublime Merge gets closest to the ideal, but:
- Closed source (can't contribute)
- Not free (barrier to adoption)
- Minimal design can be too minimal
- Limited by single-company development

**Graft should be "Sublime Merge but open source and with better UX for common tasks"**

---

## Key Insights for Graft

### Do This:
1. ✅ Native tech stack (Tauri)
2. ✅ Keyboard shortcuts from day one
3. ✅ Focus on speed over features
4. ✅ Beautiful, minimal UI
5. ✅ Open source from start
6. ✅ Progressive disclosure of complexity
7. ✅ Best-in-class diff viewing (Monaco)
8. ✅ Visual interactive rebase
9. ✅ Command palette

### Don't Do This:
1. ❌ Electron (too slow)
2. ❌ Feature creep (do less, better)
3. ❌ Account requirements
4. ❌ Subscription pricing
5. ❌ GitKraken-style flashy graphics
6. ❌ Integrations before core works
7. ❌ Supporting every Git feature day one

---

## Development Philosophy

### Constraints Breed Creativity
- Build for **80% of use cases** first
- **Zero configuration** required to start
- **Fast beats feature-rich** every time
- **Beauty is usability** (not decoration)
- **Keyboard shortcuts** for everything
- **Documentation** is part of the product

### Technical Decisions
- **Tauri + Rust** = Native performance, small binary
- **React/Svelte** = Modern UI development
- **Monaco Editor** = Industry-standard diff/code view
- **libgit2** = Battle-tested Git library
- **SQLite** = Fast local state/cache

### Release Strategy
- **Early & Often** - Release weekly alphas
- **Dogfood** - Use it ourselves daily
- **Listen** - Reddit/HN feedback loops
- **Focus** - Each release does ONE thing really well

---

## Success Metrics

### Adoption
- 1,000 GitHub stars in 3 months
- 100 daily active users in 6 months
- Mentioned positively on HN/Reddit

### Technical
- Startup time < 500ms
- 10,000+ commit repos load in < 2s
- Memory usage < 100MB
- Binary size < 50MB

### UX
- New user completes first commit in < 60s
- Advanced users prefer it over CLI for visual tasks
- Zero "where do I find X?" issues

---

## Next Steps

1. ✅ Research complete
2. ⬜ Set up Tauri project
3. ⬜ Build minimal repo browser
4. ⬜ Implement commit history graph
5. ⬜ Add staging/commit UI
6. ⬜ Alpha release to friends
7. ⬜ Iterate based on feedback

---

**Last Updated**: October 2024
**Next Review**: After MVP release
