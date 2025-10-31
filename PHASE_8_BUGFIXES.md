# Phase 8: Bug Fixes Log

## Bug Fix 1: Arc::try_unwrap Panic
**Commit:** `27cbd43`  
**Issue:** Application crashed when opening stash sidebar  
**Error:** `called Result::unwrap() on an Err value: Mutex { data: [], poisoned: false, .. }`

**Root Cause:**  
`Arc::try_unwrap()` failed because `stashes_clone` was still in scope, meaning there were multiple strong references to the Arc.

**Fix:**  
Changed from attempting to unwrap the Arc to simply locking the mutex and cloning the Vec:
```rust
// Before (caused panic):
Ok(Arc::try_unwrap(stashes).unwrap().into_inner().unwrap())

// After (safe):
let result = stashes.lock().unwrap().clone();
Ok(result)
```

---

## Bug Fix 2: MutexGuard Lifetime Issue
**Commit:** `4754981`  
**Issue:** Compilation error E0597  
**Error:** `stashes does not live long enough`

**Root Cause:**  
MutexGuard was holding a borrow while `stashes` Arc was being dropped at the end of the function.

**Fix:**  
Extract cloned value to local variable before returning to ensure MutexGuard is dropped:
```rust
// Before (compilation error):
Ok(stashes.lock().unwrap().clone())

// After (compiles and works):
let result = stashes.lock().unwrap().clone();
Ok(result)
```

---

## Status
✅ Both bugs fixed  
✅ Application runs smoothly  
✅ Stash sidebar works perfectly  
✅ Phase 8 fully operational
