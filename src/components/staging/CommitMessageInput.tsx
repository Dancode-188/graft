import { useState, useEffect, useRef } from 'react';

interface CommitMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}

export function CommitMessageInput({ value, onChange, onSubmit, disabled }: CommitMessageInputProps) {
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Enter or Cmd+Enter to commit
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter' && !disabled && value.trim()) {
        e.preventDefault();
        onSubmit();
      }
    };

    if (focused) {
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [focused, disabled, value, onSubmit]);

  const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
  const shortcutKey = isMac ? '⌘' : 'Ctrl';
  return (
    <div className="border border-theme-default rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-3 py-2 bg-theme-surface border-b border-theme-default flex items-center justify-between">
        <span className="text-xs font-semibold text-theme-secondary uppercase tracking-wider">
          Commit Message
        </span>
        <div className="flex items-center gap-2 text-xs text-theme-tertiary">
          <span>{value.length} characters</span>
          {!disabled && value.trim() && (
            <>
              <span>•</span>
              <kbd className="px-1.5 py-0.5 bg-theme-surface-hover rounded text-theme-secondary">
                {shortcutKey}+Enter
              </kbd>
            </>
          )}
        </div>
      </div>

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        disabled={disabled}
        placeholder="Enter commit message... (First line is the summary)"
        className="w-full min-h-24 max-h-48 px-3 py-2 bg-theme-bg text-theme-primary text-sm font-mono placeholder-theme-tertiary resize-y focus:outline-none focus:ring-2 focus:ring-graft-500 disabled:opacity-50 disabled:cursor-not-allowed"
      />

      {/* Validation */}
      {value.trim().length === 0 && focused && (
        <div className="px-3 py-2 bg-theme-surface border-t border-theme-default text-xs text-theme-tertiary">
          ⚠️ Commit message cannot be empty
        </div>
      )}
    </div>
  );
}
