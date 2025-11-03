// KeyboardShortcuts - Full-screen overlay showing all keyboard shortcuts
import { useState, useEffect, useRef } from 'react';
import { getShortcutsByCategory, formatShortcut, ALL_SHORTCUTS } from './shortcuts';
import { ShortcutKeys } from './ShortcutKey';

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcuts({ isOpen, onClose }: KeyboardShortcutsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const searchInputRef = useRef<HTMLInputElement>(null);
  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;

  // Reset search when opened
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Filter shortcuts based on search
  const filteredGroups = getShortcutsByCategory().map(group => ({
    ...group,
    shortcuts: group.shortcuts.filter(shortcut => {
      if (!searchQuery.trim()) return true;
      
      const query = searchQuery.toLowerCase();
      const description = shortcut.description.toLowerCase();
      const formattedShortcut = formatShortcut(shortcut, isMac).toLowerCase();
      
      return description.includes(query) || formattedShortcut.includes(query);
    }),
  })).filter(group => group.shortcuts.length > 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-theme-overlay backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-8 z-50 pointer-events-none">
        <div 
          className="bg-theme-surface border border-theme-default rounded-lg shadow-2xl w-full max-w-4xl 
                     max-h-[85vh] pointer-events-auto flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-6 border-b border-theme-default">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-theme-primary">Keyboard Shortcuts</h2>
                <p className="text-sm text-theme-tertiary mt-1">
                  {ALL_SHORTCUTS.length} shortcuts available
                </p>
              </div>
              <button
                onClick={onClose}
                className="text-theme-tertiary hover:text-theme-primary transition-colors"
                title="Close (Esc)"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-tertiary">
                🔍
              </div>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shortcuts..."
                className="w-full bg-theme-bg text-theme-primary pl-10 pr-4 py-2.5 rounded-md
                          placeholder-theme-tertiary focus:outline-none focus:ring-2 
                          focus:ring-indigo-500 border border-theme-default"
              />
            </div>
          </div>

          {/* Shortcuts Grid */}
          <div className="overflow-y-auto flex-1 p-6">
            {filteredGroups.length === 0 ? (
              <div className="text-center py-12 text-theme-tertiary">
                No shortcuts found matching "{searchQuery}"
              </div>
            ) : (
              <div className="space-y-8">
                {filteredGroups.map(group => (
                  <div key={group.category}>
                    {/* Category Header */}
                    <h3 className="text-sm font-semibold text-theme-secondary uppercase tracking-wider mb-4">
                      {group.label}
                    </h3>
                    
                    {/* Shortcuts in this category */}
                    <div className="grid gap-3">
                      {group.shortcuts.map((shortcut, index) => {
                        const keys = formatShortcut(shortcut, isMac).split('+');
                        
                        return (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 rounded-lg
                                     bg-theme-bg hover:bg-theme-surface-hover transition-colors"
                          >
                            <span className="text-theme-primary">{shortcut.description}</span>
                            <ShortcutKeys keys={keys} />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-theme-default text-center">
            <p className="text-xs text-theme-tertiary">
              Press <kbd className="px-2 py-0.5 bg-theme-bg border border-theme-default rounded text-theme-secondary">Esc</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
