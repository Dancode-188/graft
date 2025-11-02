// Command Registry - All available commands for the palette
import { Command, CommandCategory } from './types';

// Re-export types for convenience
export type { Command, CommandCategory } from './types';

// Command actions will be provided by the app
export interface CommandActions {
  // Repository
  openRepository: () => void;
  refreshRepository: () => void;
  
  // Staging
  stageAll: () => void;
  unstageAll: () => void;
  discardAll: () => void;
  commit: () => void;
  
  // Branches
  toggleBranchSidebar: () => void;
  createBranch: () => void;
  switchBranch: () => void;
  deleteBranch: () => void;
  
  // Remote
  push: () => void;
  pull: () => void;
  fetch: () => void;
  
  // Stash
  toggleStashSidebar: () => void;
  createStash: () => void;
  applyStash: () => void;
  popStash: () => void;
  
  // View
  toggleSearch: () => void;
  focusStaging: () => void;
  focusCommits: () => void;
  
  // Search
  searchCommits: () => void;
  quickSearch: () => void;
  
  // Help
  showShortcuts: () => void;
  showCommandPalette: () => void;
  
  // Context checks
  hasRepo: () => boolean;
  hasChanges: () => boolean;
  hasBranches: () => boolean;
  hasStashes: () => boolean;
}

/**
 * Create all commands with the provided actions
 */
export function createCommands(actions: CommandActions): Command[] {
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const mod = isMac ? '⌘' : 'Ctrl';

  return [
    // ===== REPOSITORY =====
    {
      id: 'repo.open',
      label: 'Open Repository',
      description: 'Select a Git repository to open',
      icon: '📁',
      keywords: ['open', 'folder', 'load'],
      shortcut: `${mod}+O`,
      category: 'repository',
      action: actions.openRepository,
    },
    {
      id: 'repo.refresh',
      label: 'Refresh Repository',
      description: 'Reload repository data',
      icon: '🔄',
      keywords: ['refresh', 'reload', 'update'],
      shortcut: `${mod}+R`,
      category: 'repository',
      action: actions.refreshRepository,
      when: actions.hasRepo,
    },

    // ===== STAGING =====
    {
      id: 'staging.stage-all',
      label: 'Stage All Files',
      description: 'Stage all modified files',
      icon: '✅',
      keywords: ['stage', 'add', 'all'],
      category: 'staging',
      action: actions.stageAll,
      when: () => actions.hasRepo() && actions.hasChanges(),
    },
    {
      id: 'staging.unstage-all',
      label: 'Unstage All Files',
      description: 'Unstage all staged files',
      icon: '↩️',
      keywords: ['unstage', 'remove', 'all'],
      category: 'staging',
      action: actions.unstageAll,
      when: () => actions.hasRepo() && actions.hasChanges(),
    },
    {
      id: 'staging.discard-all',
      label: 'Discard All Changes',
      description: 'Discard all uncommitted changes',
      icon: '🗑️',
      keywords: ['discard', 'reset', 'revert', 'all'],
      category: 'staging',
      action: actions.discardAll,
      when: () => actions.hasRepo() && actions.hasChanges(),
    },
    {
      id: 'staging.commit',
      label: 'Commit Changes',
      description: 'Create a new commit with staged changes',
      icon: '💾',
      keywords: ['commit', 'save', 'record'],
      shortcut: `${mod}+Enter`,
      category: 'commits',
      action: actions.commit,
      when: () => actions.hasRepo() && actions.hasChanges(),
    },

    // ===== BRANCHES =====
    {
      id: 'branches.toggle-sidebar',
      label: 'Toggle Branch Sidebar',
      description: 'Show or hide the branch list',
      icon: '🌿',
      keywords: ['branch', 'sidebar', 'toggle', 'show', 'hide'],
      shortcut: `${mod}+B`,
      category: 'branches',
      action: actions.toggleBranchSidebar,
      when: actions.hasRepo,
    },
    {
      id: 'branches.create',
      label: 'Create New Branch',
      description: 'Create a new Git branch',
      icon: '➕',
      keywords: ['branch', 'create', 'new'],
      shortcut: `${mod}+N`,
      category: 'branches',
      action: actions.createBranch,
      when: actions.hasRepo,
    },
    {
      id: 'branches.switch',
      label: 'Switch Branch',
      description: 'Switch to a different branch',
      icon: '🔀',
      keywords: ['branch', 'switch', 'checkout'],
      category: 'branches',
      action: actions.switchBranch,
      when: () => actions.hasRepo() && actions.hasBranches(),
    },
    {
      id: 'branches.delete',
      label: 'Delete Branch',
      description: 'Delete a Git branch',
      icon: '🗑️',
      keywords: ['branch', 'delete', 'remove'],
      category: 'branches',
      action: actions.deleteBranch,
      when: () => actions.hasRepo() && actions.hasBranches(),
    },

    // ===== REMOTE =====
    {
      id: 'remote.push',
      label: 'Push to Remote',
      description: 'Push commits to remote repository',
      icon: '⬆️',
      keywords: ['push', 'upload', 'remote'],
      shortcut: `${mod}+Shift+P`,
      category: 'remote',
      action: actions.push,
      when: actions.hasRepo,
    },
    {
      id: 'remote.pull',
      label: 'Pull from Remote',
      description: 'Pull changes from remote repository',
      icon: '⬇️',
      keywords: ['pull', 'download', 'fetch', 'merge'],
      shortcut: `${mod}+Shift+L`,
      category: 'remote',
      action: actions.pull,
      when: actions.hasRepo,
    },
    {
      id: 'remote.fetch',
      label: 'Fetch from Remote',
      description: 'Fetch updates without merging',
      icon: '📥',
      keywords: ['fetch', 'download', 'remote', 'update'],
      shortcut: `${mod}+Shift+F`,
      category: 'remote',
      action: actions.fetch,
      when: actions.hasRepo,
    },

    // ===== STASH =====
    {
      id: 'stash.toggle-sidebar',
      label: 'Toggle Stash Sidebar',
      description: 'Show or hide the stash list',
      icon: '💾',
      keywords: ['stash', 'sidebar', 'toggle', 'show', 'hide'],
      shortcut: `${mod}+Shift+S`,
      category: 'stash',
      action: actions.toggleStashSidebar,
      when: actions.hasRepo,
    },
    {
      id: 'stash.create',
      label: 'Create Stash',
      description: 'Save current changes to stash',
      icon: '📦',
      keywords: ['stash', 'save', 'store'],
      category: 'stash',
      action: actions.createStash,
      when: () => actions.hasRepo() && actions.hasChanges(),
    },
    {
      id: 'stash.apply',
      label: 'Apply Stash',
      description: 'Apply stashed changes',
      icon: '📤',
      keywords: ['stash', 'apply', 'restore'],
      category: 'stash',
      action: actions.applyStash,
      when: () => actions.hasRepo() && actions.hasStashes(),
    },
    {
      id: 'stash.pop',
      label: 'Pop Stash',
      description: 'Apply and remove stash',
      icon: '♻️',
      keywords: ['stash', 'pop', 'apply', 'remove'],
      category: 'stash',
      action: actions.popStash,
      when: () => actions.hasRepo() && actions.hasStashes(),
    },

    // ===== VIEW =====
    {
      id: 'view.search',
      label: 'Toggle Search',
      description: 'Show or hide commit search',
      icon: '🔍',
      keywords: ['search', 'find', 'toggle'],
      shortcut: `${mod}+F`,
      category: 'view',
      action: actions.toggleSearch,
      when: actions.hasRepo,
    },
    {
      id: 'view.focus-staging',
      label: 'Focus Staging Area',
      description: 'Jump to staging area',
      icon: '📝',
      keywords: ['focus', 'staging', 'changes'],
      category: 'view',
      action: actions.focusStaging,
      when: actions.hasRepo,
    },
    {
      id: 'view.focus-commits',
      label: 'Focus Commit List',
      description: 'Jump to commit history',
      icon: '📋',
      keywords: ['focus', 'commits', 'history'],
      category: 'view',
      action: actions.focusCommits,
      when: actions.hasRepo,
    },

    // ===== SEARCH =====
    {
      id: 'search.commits',
      label: 'Search Commits',
      description: 'Search through commit history',
      icon: '🔎',
      keywords: ['search', 'find', 'commits', 'history'],
      shortcut: `${mod}+F`,
      category: 'search',
      action: actions.searchCommits,
      when: actions.hasRepo,
    },
    {
      id: 'search.quick',
      label: 'Quick Search',
      description: 'Search everything quickly',
      icon: '⚡',
      keywords: ['search', 'quick', 'find', 'everywhere'],
      shortcut: `${mod}+P`,
      category: 'search',
      action: actions.quickSearch,
      when: actions.hasRepo,
    },

    // ===== HELP =====
    {
      id: 'help.shortcuts',
      label: 'Show Keyboard Shortcuts',
      description: 'View all keyboard shortcuts',
      icon: '⌨️',
      keywords: ['help', 'shortcuts', 'keyboard', 'keys'],
      shortcut: `${mod}+/`,
      category: 'help',
      action: actions.showShortcuts,
    },
  ];
}
