// Command Item - Individual command row
import { Command } from './types';

interface CommandItemProps {
  command: Command;
  isSelected: boolean;
  onClick: () => void;
  dataIndex: number;
}

export function CommandItem({ command, isSelected, onClick, dataIndex }: CommandItemProps) {
  return (
    <button
      data-index={dataIndex}
      onClick={onClick}
      className={`w-full px-4 py-3 flex items-center justify-between gap-3 text-left
                  transition-colors ${
                    isSelected 
                      ? 'bg-zinc-800 border-l-2 border-indigo-500' 
                      : 'hover:bg-zinc-850 border-l-2 border-transparent'
                  }`}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {command.icon && (
          <span className="text-lg flex-shrink-0">{command.icon}</span>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-zinc-200 font-medium">{command.label}</div>
          {command.description && (
            <div className="text-xs text-zinc-500 truncate">{command.description}</div>
          )}
        </div>
      </div>
      {command.shortcut && (
        <kbd className="px-2 py-1 text-xs font-mono bg-zinc-800 border border-zinc-700 
                       rounded text-zinc-400 flex-shrink-0">
          {command.shortcut}
        </kbd>
      )}
    </button>
  );
}
