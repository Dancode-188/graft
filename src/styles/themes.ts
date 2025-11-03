import { Theme } from '../types/theme';

// Dark Theme (Graft Dark - Current)
export const darkTheme: Theme = {
  id: 'graft-dark',
  name: 'Graft Dark',
  mode: 'dark',
  colors: {
    // Background colors
    background: '#09090b',
    surface: '#18181b',
    surfaceHover: '#27272a',
    
    // Border colors
    border: '#3f3f46',
    borderHover: '#52525b',
    
    // Text colors
    textPrimary: '#fafafa',
    textSecondary: '#d4d4d8',
    textTertiary: '#a1a1aa',
    
    // Brand colors
    primary: '#10b981',
    primaryHover: '#059669',
    
    // Semantic colors
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    
    // Git-specific colors
    gitAdded: '#10b981',
    gitModified: '#f59e0b',
    gitDeleted: '#ef4444',
    gitRenamed: '#3b82f6',
    gitConflict: '#a855f7',
    
    // Graph colors (vibrant for dark background)
    graphBranch1: '#10b981', // green
    graphBranch2: '#3b82f6', // blue
    graphBranch3: '#f59e0b', // amber
    graphBranch4: '#a855f7', // purple
    graphBranch5: '#ec4899', // pink
    graphBranch6: '#06b6d4', // cyan
  },
};

// Light Theme (Graft Light - New)
export const lightTheme: Theme = {
  id: 'graft-light',
  name: 'Graft Light',
  mode: 'light',
  colors: {
    // Background colors
    background: '#ffffff',
    surface: '#f5f5f5',
    surfaceHover: '#e5e5e5',
    
    // Border colors
    border: '#e0e0e0',
    borderHover: '#d0d0d0',
    
    // Text colors
    textPrimary: '#1a1a1a',
    textSecondary: '#666666',
    textTertiary: '#999999',
    
    // Brand colors
    primary: '#10b981',
    primaryHover: '#059669',
    
    // Semantic colors
    success: '#10b981',
    error: '#ef4444',
    warning: '#f59e0b',
    info: '#3b82f6',
    
    // Git-specific colors
    gitAdded: '#059669',
    gitModified: '#d97706',
    gitDeleted: '#dc2626',
    gitRenamed: '#2563eb',
    gitConflict: '#9333ea',
    
    // Graph colors (slightly darker for light background)
    graphBranch1: '#059669', // green
    graphBranch2: '#2563eb', // blue
    graphBranch3: '#d97706', // amber
    graphBranch4: '#9333ea', // purple
    graphBranch5: '#db2777', // pink
    graphBranch6: '#0891b2', // cyan
  },
};

export const themes: Record<string, Theme> = {
  dark: darkTheme,
  light: lightTheme,
};
