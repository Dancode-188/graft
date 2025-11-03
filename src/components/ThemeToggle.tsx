import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, themeMode, toggleTheme, setThemeMode } = useTheme();
  
  return (
    <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 shadow-lg">
      <span className="text-xs text-zinc-400">Theme:</span>
      
      {/* Quick toggle button */}
      <button
        onClick={toggleTheme}
        className="p-2 rounded hover:bg-zinc-700 transition-colors"
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
      
      {/* Mode selector */}
      <select
        value={themeMode}
        onChange={(e) => setThemeMode(e.target.value as any)}
        className="text-xs bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-emerald-500"
      >
        <option value="dark">Dark</option>
        <option value="light">Light</option>
        <option value="auto">Auto</option>
      </select>
      
      <span className="text-xs text-zinc-500">
        ({theme.name})
      </span>
    </div>
  );
}
