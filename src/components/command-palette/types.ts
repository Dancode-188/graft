// Command Palette Types

export type CommandCategory = 
  | 'repository'
  | 'staging'
  | 'commits'
  | 'branches'
  | 'remote'
  | 'stash'
  | 'rebase'
  | 'view'
  | 'search'
  | 'help';

export interface Command {
  id: string;
  label: string;
  description?: string;
  icon?: string;
  keywords?: string[];
  shortcut?: string;
  category: CommandCategory;
  action: () => void | Promise<void>;
  when?: () => boolean; // Context condition - command only available if this returns true
}

export interface CommandGroup {
  category: CommandCategory;
  label: string;
  commands: Command[];
}

export interface FuzzyMatch {
  command: Command;
  score: number;
  matches: number[];
}
