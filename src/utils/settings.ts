import { UserPreferences, DEFAULT_PREFERENCES, ThemeMode } from '../types/theme';

const STORAGE_KEY = 'graft_settings';

/**
 * Load user preferences from localStorage
 */
export function loadPreferences(): UserPreferences {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return { ...DEFAULT_PREFERENCES };
    }
    
    const parsed = JSON.parse(stored);
    return {
      ...DEFAULT_PREFERENCES,
      ...parsed,
    };
  } catch (error) {
    console.error('Failed to load preferences:', error);
    return { ...DEFAULT_PREFERENCES };
  }
}

/**
 * Save user preferences to localStorage
 */
export function savePreferences(preferences: Partial<UserPreferences>): void {
  try {
    const current = loadPreferences();
    const updated = { ...current, ...preferences };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Failed to save preferences:', error);
  }
}

/**
 * Reset preferences to defaults
 */
export function resetPreferences(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to reset preferences:', error);
  }
}

/**
 * Get the effective theme mode (resolve 'auto' to 'dark' or 'light')
 */
export function getEffectiveThemeMode(mode: ThemeMode, systemTheme: 'dark' | 'light'): 'dark' | 'light' {
  return mode === 'auto' ? systemTheme : mode;
}

/**
 * Detect system theme preference
 */
export function detectSystemTheme(): 'dark' | 'light' {
  if (typeof window === 'undefined') return 'dark';
  
  try {
    const query = window.matchMedia('(prefers-color-scheme: dark)');
    return query.matches ? 'dark' : 'light';
  } catch (error) {
    console.error('Failed to detect system theme:', error);
    return 'dark';
  }
}
