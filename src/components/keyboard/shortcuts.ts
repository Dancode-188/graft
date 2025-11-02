// All Keyboard Shortcuts in Graft
import { KeyboardShortcut } from './types';

/**
 * Central registry of all keyboard shortcuts
 * This is the single source of truth for shortcuts in the app
 */
export const ALL_SHORTCUTS: KeyboardShortcut[] = [
  // ===== GENERAL =====
  {
    key: 'K',
    modifiers: ['cmd', 'ctrl'],
    description: 'Open command palette',
    category: 'general',
  },
  {
    key: 'O',
    modifiers: ['cmd', 'ctrl'],
    description: 'Open repository',
    category: 'general',
  },
  {
    key: 'R',
    modifiers: ['cmd', 'ctrl'],
    description: 'Refresh repository',
    category: 'general',
  },
  {
    key: '/',
    modifiers: ['cmd', 'ctrl'],
    description: 'Show keyboard shortcuts',
    category: 'general',
  },
  {
    key: 'Escape',
    modifiers: [],
    description: 'Close modal or cancel',
    category: 'general',
  },

  // ===== NAVIGATION =====
  {
    key: '↑',
    modifiers: [],
    description: 'Navigate up in lists',
    category: 'navigation',
  },
  {
    key: '↓',
    modifiers: [],
    description: 'Navigate down in lists',
    category: 'navigation',
  },
  {
    key: 'Enter',
    modifiers: [],
    description: 'View selected item details',
    category: 'navigation',
  },
  {
    key: 'F',
    modifiers: ['cmd', 'ctrl'],
    description: 'Search commits',
    category: 'navigation',
  },
  {
    key: 'P',
    modifiers: ['cmd', 'ctrl'],
    description: 'Quick search',
    category: 'navigation',
  },

  // ===== STAGING & COMMITS =====
  {
    key: 'Enter',
    modifiers: ['cmd', 'ctrl'],
    description: 'Commit staged changes',
    category: 'staging',
  },
  {
    key: 'Space',
    modifiers: [],
    description: 'Stage/unstage selected file',
    category: 'staging',
  },

  // ===== BRANCHES =====
  {
    key: 'B',
    modifiers: ['cmd', 'ctrl'],
    description: 'Toggle branch sidebar',
    category: 'branches',
  },
  {
    key: 'N',
    modifiers: ['cmd', 'ctrl'],
    description: 'Create new branch',
    category: 'branches',
  },

  // ===== REMOTE =====
  {
    key: 'P',
    modifiers: ['cmd', 'ctrl', 'shift'],
    description: 'Push to remote',
    category: 'remote',
  },
  {
    key: 'L',
    modifiers: ['cmd', 'ctrl', 'shift'],
    description: 'Pull from remote',
    category: 'remote',
  },
  {
    key: 'F',
    modifiers: ['cmd', 'ctrl', 'shift'],
    description: 'Fetch from remote',
    category: 'remote',
  },

  // ===== STASH =====
  {
    key: 'S',
    modifiers: ['cmd', 'ctrl', 'shift'],
    description: 'Toggle stash sidebar',
    category: 'stash',
  },

  // ===== VIEW =====
  {
    key: 'Tab',
    modifiers: [],
    description: 'Switch between details and staging',
    category: 'view',
  },
];

/**
 * Get shortcuts grouped by category
 */
export function getShortcutsByCategory() {
  const categoryLabels: Record<string, string> = {
    general: 'General',
    navigation: 'Navigation',
    staging: 'Staging & Commits',
    branches: 'Branches',
    remote: 'Remote',
    stash: 'Stash',
    search: 'Search',
    view: 'View',
  };

  const grouped = new Map<string, KeyboardShortcut[]>();
  
  for (const shortcut of ALL_SHORTCUTS) {
    const category = shortcut.category;
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(shortcut);
  }

  return Array.from(grouped.entries()).map(([category, shortcuts]) => ({
    category: category as any,
    label: categoryLabels[category] || category,
    shortcuts,
  }));
}

/**
 * Format shortcut for display (e.g., "Cmd+K" or "Ctrl+K")
 */
export function formatShortcut(shortcut: KeyboardShortcut, isMac: boolean): string {
  const modifierMap = {
    cmd: isMac ? '⌘' : 'Ctrl',
    ctrl: isMac ? '⌃' : 'Ctrl',
    shift: isMac ? '⇧' : 'Shift',
    alt: isMac ? '⌥' : 'Alt',
  };

  const parts: string[] = [];
  
  // Add modifiers
  for (const mod of shortcut.modifiers) {
    parts.push(modifierMap[mod]);
  }
  
  // Add key
  parts.push(shortcut.key);
  
  return parts.join('+');
}
