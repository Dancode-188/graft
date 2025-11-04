# Contributing to Graft

First off, thank you for considering contributing to Graft! It's people like you that make Graft such a great tool.

## 🌿 Ways to Contribute

There are many ways to contribute to Graft:

- 🐛 **Report bugs** - Found something that doesn't work? Let us know!
- 💡 **Suggest features** - Have ideas for improvements? We'd love to hear them!
- 📖 **Improve documentation** - Help others understand Graft better
- 🎨 **Design improvements** - UI/UX suggestions are always welcome
- 💻 **Code contributions** - Fix bugs or implement features
- 🧪 **Testing** - Test new features and provide feedback
- ⭐ **Spread the word** - Star the repo, share with friends!

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have:
- **Node.js** (v18 or higher)
- **Rust** (latest stable version)
- **Git** (obviously! 😄)
- A text editor (VS Code recommended)

### Setting Up Development Environment

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub, then clone your fork
   git clone https://github.com/YOUR_USERNAME/graft.git
   cd graft
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode**
   ```bash
   npm run tauri:dev
   ```

4. **Make your changes**
   - Create a new branch: `git checkout -b feature/your-feature-name`
   - Make your changes
   - Test thoroughly
   - Commit with clear messages

5. **Submit a pull request**
   - Push to your fork
   - Open a PR with a clear description
   - Link any related issues

## 📋 Code Guidelines

### TypeScript/React (Frontend)

- Use TypeScript for type safety
- Follow existing code style (Prettier formatting)
- Use functional components with hooks
- Keep components focused and small
- Add comments for complex logic
- Use semantic HTML
- Ensure accessibility (ARIA labels)

### Rust (Backend)

- Follow Rust naming conventions
- Use descriptive variable names
- Handle errors properly (Result types)
- Add documentation comments (`///`)
- Keep functions focused
- Test edge cases

### Git Commits

- Use clear, descriptive commit messages
- Follow format: `type: description`
  - `feat:` new feature
  - `fix:` bug fix
  - `docs:` documentation
  - `style:` formatting, no code change
  - `refactor:` code restructuring
  - `test:` adding tests
  - `chore:` maintenance

Examples:
```
feat: Add cherry-pick support to commit context menu
fix: Prevent crash when repository has no commits
docs: Update installation instructions for macOS
```

## 🐛 Reporting Bugs

### Before Submitting

1. **Check existing issues** - Your bug might already be reported
2. **Try latest version** - The bug might be fixed
3. **Search documentation** - It might be expected behavior

### Bug Report Template

When reporting bugs, please include:

1. **Description** - Clear and concise description
2. **Steps to Reproduce**
   - Step 1
   - Step 2
   - Step 3
3. **Expected Behavior** - What should happen
4. **Actual Behavior** - What actually happens
5. **Screenshots** - If applicable
6. **Environment**
   - OS: (e.g., Windows 11, macOS 14, Ubuntu 22.04)
   - Graft Version: (e.g., v1.0.1)
   - Node Version: (e.g., v20.0.0)
   - Rust Version: (e.g., 1.75.0)

## 💡 Suggesting Features

We love new ideas! When suggesting features:

1. **Check existing issues** - It might be planned or discussed
2. **Be specific** - Describe the feature clearly
3. **Explain the use case** - Why is this feature needed?
4. **Consider alternatives** - Are there other solutions?
5. **Add mockups** - Visual aids help (optional)

## 🔍 Code Review Process

1. **Automated checks** - CI will run tests and linting
2. **Code review** - Maintainers will review your PR
3. **Discussion** - We may request changes
4. **Approval** - Once approved, we'll merge!

### What We Look For

- Code quality and clarity
- Following project conventions
- Adequate testing
- Documentation updates (if needed)
- No breaking changes (without discussion)

## 🧪 Testing

### Running Tests

```bash
# Frontend tests
npm test

# Backend tests
cd src-tauri
cargo test
```

### Writing Tests

- Add tests for new features
- Test edge cases
- Test error handling
- Ensure tests are deterministic

## 📖 Documentation

When adding features or changing behavior:

1. **Update README** - If user-facing changes
2. **Add code comments** - For complex logic
3. **Update CHANGELOG** - Document changes
4. **Add inline docs** - JSDoc/Rustdoc

## 🎨 UI/UX Guidelines

### Design Principles

- **Keyboard-first** - Everything should work with keyboard
- **Fast** - No laggy interfaces
- **Intuitive** - Users shouldn't need a manual
- **Accessible** - Support screen readers, high contrast
- **Consistent** - Follow existing patterns

### Theme Support

- Use CSS variables (no hardcoded colors)
- Test in both dark and light themes
- Ensure proper contrast (WCAG AA)
- Use semantic color names

## 🤝 Community

- Be respectful and inclusive
- Help other contributors
- Share knowledge and learn together
- Follow our Code of Conduct

## ⚖️ License

By contributing, you agree that your contributions will be licensed under the MIT License.

## 📞 Questions?

- Open a discussion on GitHub
- Check existing issues and discussions
- Read the documentation

## 🎉 Recognition

All contributors will be recognized in:
- GitHub contributors page
- Release notes
- Our eternal gratitude! 💚

---

**Thank you for making Graft better!** 🌿

Every contribution, no matter how small, makes a difference.
