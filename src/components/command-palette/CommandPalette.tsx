// Command Palette - Main Modal Component
import { useState, useEffect, useRef } from 'react';
import { Command, CommandGroup } from './types';
import { searchCommands } from './fuzzySearch';
import { CommandItem } from './CommandItem';
import { CommandCategory } from './CommandCategory';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: Command[];
  recentCommands?: string[]; // Command IDs
}

export function CommandPalette({ 
  isOpen, 
  onClose, 
  commands,
  recentCommands = []
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      // Focus input after a short delay to ensure modal is rendered
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Filter commands based on query
  const availableCommands = commands.filter(cmd => !cmd.when || cmd.when());
  
  const filteredCommands: Command[] = query.trim() 
    ? searchCommands(query, availableCommands).map(match => match.command)
    : availableCommands;

  // Group commands by category
  const groupedCommands: CommandGroup[] = [];
  
  // If we have a query, show all results together
  if (query.trim()) {
    if (filteredCommands.length > 0) {
      groupedCommands.push({
        category: 'search',
        label: 'Search Results',
        commands: filteredCommands
      });
    }
  } else {
    // No query - show by category
    // First show recent commands if any
    if (recentCommands.length > 0) {
      const recent = commands.filter(cmd => 
        recentCommands.includes(cmd.id) && (!cmd.when || cmd.when())
      );
      if (recent.length > 0) {
        groupedCommands.push({
          category: 'repository',
          label: 'Recent',
          commands: recent
        });
      }
    }

    // Group remaining commands by category
    const categories = Array.from(new Set(filteredCommands.map(c => c.category)));
    const categoryLabels: Record<string, string> = {
      repository: 'Repository',
      staging: 'Staging',
      commits: 'Commits',
      branches: 'Branches',
      remote: 'Remote',
      stash: 'Stash',
      rebase: 'Rebase',
      view: 'View',
      search: 'Search',
      help: 'Help'
    };

    for (const category of categories) {
      const cmds = filteredCommands.filter(c => c.category === category);
      if (cmds.length > 0) {
        groupedCommands.push({
          category: category as any,
          label: categoryLabels[category] || category,
          commands: cmds
        });
      }
    }
  }

  // Flatten all commands for keyboard navigation
  const allVisibleCommands = groupedCommands.flatMap(g => g.commands);
  
  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, allVisibleCommands.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const command = allVisibleCommands[selectedIndex];
        if (command) {
          command.action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, allVisibleCommands, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (!listRef.current) return;
    
    const selectedElement = listRef.current.querySelector(`[data-index="${selectedIndex}"]`);
    if (selectedElement) {
      selectedElement.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-start justify-center pt-[20vh] z-50 pointer-events-none">
        <div 
          className="bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl w-full max-w-2xl 
                     pointer-events-auto max-h-[60vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-4 border-b border-zinc-800">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500">
                🔍
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0); // Reset selection when query changes
                }}
                placeholder="Type a command..."
                className="w-full bg-zinc-800 text-zinc-200 pl-10 pr-4 py-3 rounded-md
                          placeholder-zinc-500 focus:outline-none focus:ring-2 
                          focus:ring-indigo-500 border border-zinc-700"
              />
            </div>
          </div>

          {/* Results */}
          <div ref={listRef} className="overflow-y-auto flex-1">
            {groupedCommands.length === 0 ? (
              <div className="p-8 text-center text-zinc-500">
                No commands found
              </div>
            ) : (
              groupedCommands.map((group, groupIndex) => {
                const startIndex = groupedCommands
                  .slice(0, groupIndex)
                  .reduce((sum, g) => sum + g.commands.length, 0);

                return (
                  <div key={group.category}>
                    <CommandCategory label={group.label} />
                    {group.commands.map((command, cmdIndex) => {
                      const globalIndex = startIndex + cmdIndex;
                      return (
                        <CommandItem
                          key={command.id}
                          command={command}
                          isSelected={globalIndex === selectedIndex}
                          onClick={() => {
                            command.action();
                            onClose();
                          }}
                          dataIndex={globalIndex}
                        />
                      );
                    })}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div className="p-3 border-t border-zinc-800 text-xs text-zinc-500 flex items-center justify-between">
            <div className="flex gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
