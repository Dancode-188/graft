import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Theme, ThemeMode, UserPreferences } from '../types/theme';
import { themes } from '../styles/themes';
import {
  loadPreferences,
  savePreferences,
  getEffectiveThemeMode,
  detectSystemTheme,
} from '../utils/settings';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  preferences: UserPreferences;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [preferences, setPreferences] = useState<UserPreferences>(loadPreferences);
  const [systemTheme, setSystemTheme] = useState<'dark' | 'light'>(detectSystemTheme);
  
  // Detect system theme changes
  useEffect(() => {
    try {
      const query = window.matchMedia('(prefers-color-scheme: dark)');
      setSystemTheme(query.matches ? 'dark' : 'light');
      
      const handler = (e: MediaQueryListEvent) => {
        setSystemTheme(e.matches ? 'dark' : 'light');
      };
      
      query.addEventListener('change', handler);
      return () => query.removeEventListener('change', handler);
    } catch (error) {
      console.error('Failed to setup system theme detection:', error);
    }
  }, []);
  
  // Determine active theme
  const activeMode = getEffectiveThemeMode(preferences.themeMode, systemTheme);
  const theme = themes[activeMode];
  
  // Apply theme colors as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    // Apply all color variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      // Convert camelCase to kebab-case
      const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      root.style.setProperty(`--color-${cssKey}`, value);
    });
    
    // Set data-theme attribute for CSS targeting
    root.setAttribute('data-theme', activeMode);
    
  }, [theme, activeMode]);
  
  // Apply font preferences
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--font-family', preferences.fontFamily);
    root.style.setProperty('--font-size', `${preferences.fontSize}px`);
  }, [preferences.fontFamily, preferences.fontSize]);
  
  const setThemeMode = (mode: ThemeMode) => {
    const updated = { ...preferences, themeMode: mode };
    setPreferences(updated);
    savePreferences(updated);
  };
  
  const toggleTheme = () => {
    const newMode = activeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(newMode);
  };
  
  const updatePreferences = (prefs: Partial<UserPreferences>) => {
    const updated = { ...preferences, ...prefs };
    setPreferences(updated);
    savePreferences(updated);
  };
  
  const value: ThemeContextType = {
    theme,
    themeMode: preferences.themeMode,
    preferences,
    setThemeMode,
    toggleTheme,
    updatePreferences,
  };
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}
