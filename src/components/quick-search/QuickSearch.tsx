// Quick Search - Fast search across everything (Cmd+P)
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { SearchResult } from './types';
import { searchAll } from './searchEngine';
import { SearchResultItem } from './SearchResultItem';
import { useDebounce } from '../../hooks/useDebounce';

interface QuickSearchProps {
  isOpen: boolean;
  onClose: () => void;
  commits: any[];
  branches: any[];
  stashes: any[];
  onSelectCommit: (index: number) => void;
  onSelectBranch: (branchName: string) => void;
  onSelectStash: (stashIndex: number) => void;
}

export function QuickSearch({
  isOpen,
  onClose,
  commits,
  branches,
  stashes,
  onSelectCommit,
  onSelectBranch,
  onSelectStash,
}: QuickSearchProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Debounce query for performance
  const debouncedQuery = useDebounce(query, 100);

  // Reset state when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Perform search (memoized for performance)
  const results = useMemo(() => {
    return searchAll(debouncedQuery, { commits, branches, stashes });
  }, [debouncedQuery, commits, branches, stashes]);
  
  // Limit results for performance (top 50)
  const limitedResults = useMemo(() => {
    return results.slice(0, 50);
  }, [results]);

  // Handle result selection (memoized callback)
  const handleSelectResult = useCallback((result: SearchResult) => {
    switch (result.type) {
      case 'commit':
        const commitIndex = commits.findIndex(c => c.hash === result.id);
        if (commitIndex !== -1) {
          onSelectCommit(commitIndex);
        }
        break;
      case 'branch':
        onSelectBranch(result.id);
        break;
      case 'stash':
        const stashIndex = stashes.findIndex(s => `stash@{${s.index}}` === result.id);
        if (stashIndex !== -1) {
          onSelectStash(stashIndex);
        }
        break;
    }
    onClose();
  }, [commits, branches, stashes, onSelectCommit, onSelectBranch, onSelectStash, onClose]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(i => Math.min(i + 1, limitedResults.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(i => Math.max(i - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (limitedResults[selectedIndex]) {
          handleSelectResult(limitedResults[selectedIndex]);
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, limitedResults, handleSelectResult]);

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
        className="fixed inset-0 bg-theme-overlay backdrop-blur-sm z-50"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-start justify-center pt-[20vh] z-50 pointer-events-none">
        <div 
          className="bg-theme-surface border border-theme-default rounded-lg shadow-2xl w-full max-w-2xl 
                     pointer-events-auto max-h-[60vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Search Input */}
          <div className="p-4 border-b border-theme-default">
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-theme-tertiary">
                ⚡
              </div>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0); // Reset selection when query changes
                }}
                placeholder="Search commits, branches, stashes..."
                className="w-full bg-theme-bg text-theme-primary pl-10 pr-4 py-3 rounded-md
                          placeholder-theme-tertiary focus:outline-none focus:ring-2 
                          focus:ring-indigo-500 border border-theme-default"
                role="combobox"
                aria-label="Quick search across commits, branches, and stashes"
                aria-controls="search-results"
                aria-expanded={isOpen}
                aria-activedescendant={limitedResults[selectedIndex] ? `search-result-${selectedIndex}` : undefined}
              />
            </div>
          </div>

          {/* Results */}
          <div 
            ref={listRef} 
            className="overflow-y-auto flex-1"
            role="listbox"
            id="search-results"
            aria-label="Search results"
          >
            {query.trim() === '' ? (
              <div className="p-8 text-center text-theme-tertiary">
                <div className="text-4xl mb-3">🔍</div>
                <div className="text-sm">Start typing to search...</div>
                <div className="text-xs text-theme-tertiary mt-2">
                  Search across commits, branches, and stashes
                </div>
              </div>
            ) : limitedResults.length === 0 ? (
              <div className="p-8 text-center text-theme-tertiary">
                No results found for "{query}"
              </div>
            ) : (
              <div>
                {limitedResults.map((result, index) => (
                  <SearchResultItem
                    key={`${result.type}-${result.id}`}
                    result={result}
                    isSelected={index === selectedIndex}
                    onClick={() => handleSelectResult(result)}
                    dataIndex={index}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="p-3 border-t border-theme-default text-xs text-theme-tertiary flex items-center justify-between">
            <div className="flex gap-4">
              <span>↑↓ Navigate</span>
              <span>↵ Select</span>
              <span>Esc Close</span>
            </div>
            {limitedResults.length > 0 && (
              <span>{limitedResults.length} result{limitedResults.length !== 1 ? 's' : ''}</span>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
