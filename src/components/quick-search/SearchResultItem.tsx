// Search Result Item - Display individual search result
import { memo } from 'react';
import { SearchResult } from './types';

interface SearchResultItemProps {
  result: SearchResult;
  isSelected: boolean;
  onClick: () => void;
  dataIndex: number;
}

export const SearchResultItem = memo(function SearchResultItem({ 
  result, 
  isSelected, 
  onClick,
  dataIndex 
}: SearchResultItemProps) {
  // Type-specific styling
  const typeColors = {
    commit: 'text-blue-400',
    branch: 'text-green-400',
    stash: 'text-purple-400',
    file: 'text-yellow-400',
  };

  return (
    <button
      data-index={dataIndex}
      onClick={onClick}
      className={`w-full px-4 py-3 flex items-center gap-3 text-left
                  transition-colors ${
                    isSelected 
                      ? 'bg-theme-surface-hover border-l-2 border-indigo-500' 
                      : 'hover:bg-theme-surface-hover border-l-2 border-transparent'
                  }`}
      role="option"
      aria-selected={isSelected}
      id={`search-result-${dataIndex}`}
    >
      {/* Icon */}
      <span className="text-xl flex-shrink-0">{result.icon}</span>
      
      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="text-theme-primary font-medium truncate">{result.title}</div>
        {result.subtitle && (
          <div className="text-xs text-theme-tertiary truncate">{result.subtitle}</div>
        )}
      </div>
      
      {/* Type badge and description */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {result.description && (
          <span className="text-xs text-theme-tertiary">{result.description}</span>
        )}
        <span className={`text-xs px-2 py-0.5 rounded bg-theme-bg ${typeColors[result.type]}`}>
          {result.type}
        </span>
      </div>
    </button>
  );
}, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return prevProps.result.id === nextProps.result.id &&
         prevProps.isSelected === nextProps.isSelected &&
         prevProps.dataIndex === nextProps.dataIndex;
});
