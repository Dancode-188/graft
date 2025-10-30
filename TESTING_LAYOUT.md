# Layout Optimization - Testing Guide

## Quick Test Instructions

To test the new layout optimization, run:
```bash
cd C:\Users\user\graft
npm run tauri:dev
```

## Testing Checklist

### 1. **Initial State** ✅
- [ ] App opens with branch sidebar **COLLAPSED** (hidden)
- [ ] Commit list has maximum space
- [ ] "🌿 Branches" button visible in header (gray/subtle styling)
- [ ] Layout looks balanced and uncluttered

### 2. **Branch Sidebar Toggle** ✅
- [ ] Click "🌿 Branches" button → Sidebar slides in from left
- [ ] Button changes to highlighted state (graft-green tint)
- [ ] Animation is smooth (0.2s slide-in)
- [ ] Press `Cmd+B` (Mac) or `Ctrl+B` (Windows) → Sidebar toggles
- [ ] Keyboard shortcut works both ways (show/hide)

### 3. **Branch Sidebar Appearance** ✅
- [ ] Sidebar width is 180px (narrower than before)
- [ ] Branch items show: Icon + Name only
- [ ] NO commit message or timestamp visible
- [ ] Hover over branch → Tooltip shows metadata
- [ ] Search placeholder says "Search..." (shorter)
- [ ] Current branch has ★ and graft-green color
- [ ] Footer "New Branch" button fits properly

### 4. **Layout Proportions** ✅
- [ ] Right panel (Details/Staging) is 320px wide
- [ ] Commit list has MORE space than before
- [ ] Graph + commits feel balanced
- [ ] No horizontal scrolling needed
- [ ] All sections fit comfortably

### 5. **State Persistence** ✅
- [ ] Toggle sidebar open → Refresh page → Sidebar stays open
- [ ] Toggle sidebar closed → Refresh page → Sidebar stays closed
- [ ] Close app → Reopen → State is remembered
- [ ] localStorage correctly saves preference

### 6. **Functionality** ✅
- [ ] Can still create branches (+ New Branch button)
- [ ] Can still switch branches (click branch name)
- [ ] Can still right-click for context menu
- [ ] Can still search branches
- [ ] Remote branches still collapse/expand
- [ ] All keyboard shortcuts work

### 7. **Visual Polish** ✅
- [ ] Branch sidebar slides in smoothly (no jank)
- [ ] Button states are clear (collapsed vs expanded)
- [ ] Tooltips appear on hover over branches
- [ ] Colors match graft design system
- [ ] No layout shift when toggling
- [ ] Animations are performant (60fps)

### 8. **Edge Cases** ✅
- [ ] Works with many branches (20+)
- [ ] Works with long branch names (truncation)
- [ ] Works with no branches (new repo)
- [ ] Works after creating a branch
- [ ] Works after switching branches
- [ ] Works after deleting a branch

### 9. **Cross-Platform** ✅
- [ ] Windows: Ctrl+B works correctly
- [ ] Mac: Cmd+B works correctly
- [ ] Keyboard shortcut hint shows correct key in tooltip

### 10. **Comparison** ✅
- [ ] Commit list has noticeably MORE space than before
- [ ] Layout feels less cramped
- [ ] Primary focus is on commits (as it should be)
- [ ] Branch management still easily accessible
- [ ] Overall UX improved

## Expected Visual Changes

### Header Button States:

**Sidebar Collapsed (Default):**
```
🌿 Branches
[Gray background, subtle border, zinc-400 text]
```

**Sidebar Expanded:**
```
🌿 Branches
[Graft-green tint, highlighted border, graft-400 text]
```

### Branch Items:

**Before (Cluttered):**
```
★ main
  feat: Phase 5 - Complete Branch Management
  today
```

**After (Clean):**
```
★ main
[Hover to see: "feat: Phase 5... | today"]
```

## Performance Expectations

- **Sidebar toggle**: < 200ms with smooth animation
- **Layout shift**: None (no jank)
- **Rendering**: Faster (less DOM when collapsed)
- **Memory**: Slightly lower (less components rendered by default)

## Known Good Behaviors

✅ Sidebar remembers state across sessions
✅ Smooth slide-in animation (not instant)
✅ Button reflects current state visually
✅ Tooltips provide access to metadata
✅ All functionality preserved
✅ Keyboard shortcuts work perfectly
✅ Right panel is comfortable at 320px
✅ Commit list has significantly more space

## Potential Issues to Watch For

⚠️ **If sidebar doesn't collapse by default:**
- Check localStorage is enabled in browser
- Try clearing localStorage: `localStorage.clear()`
- Ensure code has `return saved ? JSON.parse(saved) : false;`

⚠️ **If toggle button doesn't appear:**
- Ensure repo is open (button only shows when repoInfo exists)
- Check console for React errors

⚠️ **If animation is jerky:**
- Check CSS animation is loaded: `.animate-slide-in-left`
- Verify keyframes in styles.css

⚠️ **If w-45 doesn't work:**
- Verify tailwind.config.js has custom spacing
- Rebuild with `npm run build` if needed

## Success Criteria

This optimization is successful if:
1. ✅ Sidebar is collapsed by default
2. ✅ Commit list feels spacious and comfortable
3. ✅ Toggle is obvious and works instantly (Cmd+B)
4. ✅ Button provides clear visual feedback
5. ✅ No functionality is lost
6. ✅ Performance is maintained or improved
7. ✅ State persists across sessions
8. ✅ Overall UX feels more professional

## Next Steps After Testing

If all tests pass:
1. Mark as ✅ Complete
2. Update ROADMAP.md if needed
3. Continue to Phase 6: Push/Pull/Fetch

If issues found:
1. Document specific issues
2. Fix and re-test
3. Update commit if major changes needed

---

**Testing Status**: ⏳ Awaiting Manual Testing
**Expected Result**: All ✅
**Estimated Test Time**: 5-10 minutes
