// Theme type definitions
export type ThemeMode = 'dark' | 'light' | 'auto';

export interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  surfaceHover: string;
  
  // Border colors
  border: string;
  borderHover: string;
  
  // Text colors
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  
  // Brand colors
  primary: string;
  primaryHover: string;
  
  // Semantic colors
  success: string;
  error: string;
  warning: string;
  info: string;
  
  // Git-specific colors
  gitAdded: string;
  gitModified: string;
  gitDeleted: string;
  gitRenamed: string;
  gitConflict: string;
  
  // Graph colors
  graphBranch1: string;
  graphBranch2: string;
  graphBranch3: string;
  graphBranch4: string;
  graphBranch5: string;
  graphBranch6: string;
}

export interface Theme {
  id: string;
  name: string;
  mode: 'dark' | 'light';
  colors: ThemeColors;
}

export interface UserPreferences {
  themeMode: ThemeMode;
  fontFamily: string;
  fontSize: number;
  uiDensity: 'compact' | 'normal' | 'spacious';
}

export const DEFAULT_PREFERENCES: UserPreferences = {
  themeMode: 'auto',
  fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: 14,
  uiDensity: 'normal',
};
