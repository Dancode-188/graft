// Keyboard Shortcuts Types and Definitions

export interface KeyboardShortcut {
  key: string;
  modifiers: ('cmd' | 'ctrl' | 'shift' | 'alt')[];
  description: string;
  category: ShortcutCategory;
}

export type ShortcutCategory = 
  | 'general'
  | 'navigation'
  | 'staging'
  | 'branches'
  | 'remote'
  | 'stash'
  | 'search'
  | 'view';

export interface ShortcutGroup {
  category: ShortcutCategory;
  label: string;
  shortcuts: KeyboardShortcut[];
}
