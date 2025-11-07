import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { ThemePreview } from './ThemePreview';

export function ThemeToggle() {
  const { theme, themeMode, toggleTheme, setThemeMode } = useTheme();
  const [previewMode, setPreviewMode] = useState<string | null>(null);

  // Only preview dark/light, not auto
  const showPreview = previewMode === 'dark' || previewMode === 'light';

  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-theme-surface border border-theme-default rounded-lg px-3 py-2 shadow-lg">
      <span className="text-xs text-theme-tertiary">Theme:</span>

      {/* Quick toggle button */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded hover:bg-theme-surface-hover transition-colors"
        title={`Switch to ${theme.mode === 'dark' ? 'light' : 'dark'} theme`}
      >
        {theme.mode === 'dark' ? (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        ) : (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
        )}
      </button>

      {/* Mode selector with preview on hover */}
      <div className="relative">
        <select
          value={themeMode}
          onChange={(e) => setThemeMode(e.target.value as any)}
          className="text-xs bg-theme-bg border border-theme-default rounded px-2 py-1 text-theme-secondary focus:outline-none focus:ring-1 focus:ring-emerald-500"
          onMouseLeave={() => setPreviewMode(null)}
        >
          <option
            value="dark"
            onMouseEnter={() => setPreviewMode('dark')}
            onMouseLeave={() => setPreviewMode(null)}
          >
            Dark
          </option>
          <option
            value="light"
            onMouseEnter={() => setPreviewMode('light')}
            onMouseLeave={() => setPreviewMode(null)}
          >
            Light
          </option>
          <option
            value="auto"
            onMouseEnter={() => setPreviewMode(null)}
          >
            Auto
          </option>
        </select>
        {/* Preview tooltip */}
        {showPreview && (
          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-50" style={{ pointerEvents: 'none' }}>
            <ThemePreview mode={previewMode as 'dark' | 'light'} />
          </div>
        )}
      </div>

      <span className="text-xs text-theme-tertiary">
        ({theme.name})
      </span>
    </div>
  );
}
