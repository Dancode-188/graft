# Phase 9.5: Performance & Polish - Implementation Plan

**Date**: November 2, 2025  
**Status**: 🚧 In Progress  
**Estimated Time**: 1 hour

---

## 🎯 Goals

1. **Performance**: Make search instant, prevent unnecessary re-renders
2. **Polish**: Add smooth animations and loading states
3. **Accessibility**: Add ARIA labels for screen readers
4. **Tracking**: Implement recent commands feature

---

## 📋 Implementation Checklist

### Step 1: Performance Optimizations (30 minutes)

#### 1.1 Debounce Search Inputs (10 min)
- [ ] Create `useDebounce` hook
- [ ] Apply to CommandPalette search
- [ ] Apply to QuickSearch search
- [ ] Test: typing should feel instant, but searching should debounce

#### 1.2 Memoize Expensive Operations (10 min)
- [ ] CommandPalette: Memoize `groupedCommands`
- [ ] CommandPalette: Memoize `allVisibleCommands`
- [ ] QuickSearch: Memoize `searchAll` results
- [ ] Test: no performance degradation with 1000+ commits

#### 1.3 Optimize Re-renders (10 min)
- [ ] Wrap CommandItem in React.memo
- [ ] Wrap SearchResultItem in React.memo
- [ ] Wrap CommandCategory in React.memo
- [ ] Test: components only re-render when props change

---

### Step 2: Polish & Accessibility (30 minutes)

#### 2.1 Accessibility (ARIA labels) (10 min)
- [ ] Add aria-label to search inputs
- [ ] Add aria-selected to selected items
- [ ] Add role="listbox" to result lists
- [ ] Add role="option" to result items
- [ ] Test: screen reader can navigate

#### 2.2 Recent Commands Tracking (15 min)
- [ ] Create localStorage utility
- [ ] Track command usage on execution
- [ ] Load recent commands on app start
- [ ] Show recent commands in CommandPalette
- [ ] Limit to last 5 commands
- [ ] Test: recent commands persist across sessions

#### 2.3 Final Polish (5 min)
- [ ] Verify all animations are smooth
- [ ] Check error handling is consistent
- [ ] Test edge cases (empty repo, no branches, etc.)
- [ ] Verify cross-platform (Windows CMD vs PowerShell)

---

## 🔧 Technical Approach

### Debouncing Hook
```typescript
// src/hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    
    return () => clearTimeout(handler);
  }, [value, delay]);
  
  return debouncedValue;
}
```

### React.memo Pattern
```typescript
export const CommandItem = React.memo(({ command, isSelected, onClick }: Props) => {
  // ... component code
}, (prevProps, nextProps) => {
  // Custom comparison for optimization
  return prevProps.command.id === nextProps.command.id &&
         prevProps.isSelected === nextProps.isSelected;
});
```

### ARIA Attributes
```tsx
<input
  role="combobox"
  aria-label="Search commands"
  aria-controls="command-results"
  aria-activedescendant={`command-${selectedIndex}`}
/>

<div role="listbox" id="command-results">
  <div 
    role="option"
    aria-selected={isSelected}
    id={`command-${index}`}
  >
</div>
```

### Recent Commands Storage
```typescript
// src/utils/recentCommands.ts
export function saveRecentCommand(commandId: string) {
  const recent = getRecentCommands();
  const updated = [commandId, ...recent.filter(id => id !== commandId)].slice(0, 5);
  localStorage.setItem('graft_recent_commands', JSON.stringify(updated));
}

export function getRecentCommands(): string[] {
  const stored = localStorage.getItem('graft_recent_commands');
  return stored ? JSON.parse(stored) : [];
}
```

---

## 🧪 Testing Strategy

### Performance Tests
1. **Debouncing**: Type fast in search, verify it doesn't lag
2. **Memoization**: Open command palette 100 times, no slowdown
3. **Re-renders**: Use React DevTools to verify minimal re-renders

### Accessibility Tests
1. **Screen reader**: Use VoiceOver (Mac) or NVDA (Windows)
2. **Keyboard only**: Navigate entire UI without mouse
3. **Focus management**: Tab order makes sense

### Recent Commands
1. Use several commands
2. Close and reopen app
3. Verify recent commands appear
4. Verify limit of 5 works

---

## 📊 Performance Targets

| Metric | Before | Target | Method |
|--------|--------|--------|--------|
| Search response | Immediate | <100ms | Debounce |
| Component re-renders | Many | Minimal | React.memo |
| Memory usage | N/A | Stable | Memoization |
| Load time | N/A | <50ms | No change |

---

## ✨ Expected Outcomes

After Phase 9.5:
1. **Faster**: Search feels instant with no lag
2. **Smoother**: No unnecessary re-renders
3. **Accessible**: Screen readers work perfectly
4. **Smarter**: Recent commands make workflow faster
5. **Production-ready**: No performance issues

---

## 🚀 Implementation Order

1. Create `useDebounce` hook
2. Apply debouncing to searches
3. Add React.memo to child components
4. Add memoization to expensive operations
5. Add ARIA labels
6. Implement recent commands tracking
7. Test everything
8. Create completion report

---

**Let's make Phase 9 perfect!** ⚡
