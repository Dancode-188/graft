// Command Item - Individual command row
import { memo } from 'react';
import { Command } from './types';

interface CommandItemProps {
  command: Command;
  isSelected: boolean;
  onClick: () => void;
  dataIndex: number;
}

export const CommandItem = memo(function CommandItem({ 
  command, 
  isSelected, 
  onClick, 
  dataIndex 
}: CommandItemProps) {
  return (
    <button
      data-index={dataIndex}
      onClick={onClick}
      className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left
                  transition-colors ${
                    isSelected 
                      ? 'bg-theme-surface-hover border-l-2 border-indigo-500' 
                      : 'hover:bg-theme-surface-hover border-l-2 border-transparent'
                  }`}
      role="option"
      aria-selected={isSelected}
      id={`command-${command.id}`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {command.icon && (
          <span className="text-lg flex-shrink-0">{command.icon}</span>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-theme-primary font-medium">{command.label}</div>
          {command.description && (
            <div className="text-xs text-theme-tertiary truncate">{command.description}</div>
          )}
        </div>
      </div>
      {command.shortcut && (
        <kbd className="px-2 py-1 text-xs font-mono bg-theme-bg border border-theme-default 
                       rounded text-theme-secondary flex-shrink-0">
          {command.shortcut}
        </kbd>
      )}
    </button>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return prevProps.command.id === nextProps.command.id &&
         prevProps.isSelected === nextProps.isSelected &&
         prevProps.dataIndex === nextProps.dataIndex;
});
