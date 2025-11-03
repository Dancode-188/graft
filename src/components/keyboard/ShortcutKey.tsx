// ShortcutKey - Visual keyboard key component
// Displays individual keys like ⌘, K, etc. with beautiful styling

interface ShortcutKeyProps {
  children: React.ReactNode;
  className?: string;
}

export function ShortcutKey({ children, className = '' }: ShortcutKeyProps) {
  return (
    <kbd 
      className={`
        inline-flex items-center justify-center
        min-w-[2rem] h-8 px-2
        text-sm font-mono font-medium
        bg-theme-bg 
        border border-theme-default 
        rounded
        text-theme-secondary
        shadow-sm
        ${className}
      `}
    >
      {children}
    </kbd>
  );
}

/**
 * Display a sequence of keys (e.g., Cmd+K)
 */
interface ShortcutKeysProps {
  keys: string[];
  separator?: string;
}

export function ShortcutKeys({ keys, separator = '+' }: ShortcutKeysProps) {
  return (
    <div className="flex items-center gap-1">
      {keys.map((key, index) => (
        <div key={index} className="flex items-center gap-1">
          <ShortcutKey>{key}</ShortcutKey>
          {index < keys.length - 1 && (
            <span className="text-theme-tertiary text-xs">{separator}</span>
          )}
        </div>
      ))}
    </div>
  );
}
