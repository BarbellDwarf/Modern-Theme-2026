# Stream Comments: Visual Overhaul Plan

## Current State Analysis

**User Requirements:**
- Comments look "visibly poor" and "minorly functional"
- Too narrow horizontally
- Too much vertical space
- Lack differentiation between comments
- Need Instagram/Facebook/X quality UX
- Nested comments should be disabled if they look bad

**Code Review Issues:**

### 1. Layout Problems
- **File**: `_stream-comments.scss` line 56-74
- **Issue**: `display: flex; gap: var(--space-3)` creates horizontal layout (avatar | content)
- **Problem**: On mobile (375px), avatar takes 32px + gap 12px = 44px, leaving only 331px for content
- **Result**: Text area feels cramped

### 2. Vertical Spacing
- **File**: `_stream-comments.scss` line 29-31
- **Issue**: Top-level comments have `padding: var(--space-3) 0` (12px top/bottom)
- **Issue**: Comment container has `padding: var(--space-3) var(--space-4)` (line 215)
- **Problem**: Multiple padding layers create excessive vertical space
- **Result**: Comments feel sparse and disconnected

### 3. No Visual Separation
- **Issue**: Comments have no background, border, or card styling
- **Issue**: No visual hierarchy between top-level and replies
- **Result**: Comments blend together, hard to distinguish where one ends and another begins

### 4. Reply Differentiation
- **File**: `_stream-comments.scss` line 125-142
- **Issue**: Replies have slightly smaller padding (0.5rem vs var(--space-3))
- **Issue**: Replies are NOT visually nested (no indentation, no thread lines)
- **Issue**: All comments look identical
- **Result**: Hierarchy unclear, conversation flow hard to follow

---

## Comparison: Instagram/Facebook/X Quality

**What they do well:**
1. **Card-based comments**: Each comment has subtle background/border
2. **Clear hierarchy**: Avatar, name (bold), timestamp (muted), content
3. **Adequate spacing**: Not too tight, not too loose
4. **Action buttons**: Like, reply clearly visible with icons
5. **Thread indicators**: Nested replies indented with visual thread line
6. **Responsive**: On mobile, full-width with proper padding

**What our theme lacks:**
- ❌ Card backgrounds
- ❌ Strong visual hierarchy
- ❌ Thread indicators for replies
- ❌ Icon-based action buttons (uses text links)
- ❌ Responsive optimization

---

## Fix Plan

### Phase A: Comment Card Styling (Priority: HIGH)

**Goal**: Make each comment feel like a distinct card

**Changes to `_stream-comments.scss`:**

```scss
// Add card background to each comment
.single-comment {
  background: var(--color-bg-secondary, #f8fafc);
  border-radius: var(--radius-md, 8px);
  padding: var(--space-3);  // Internal padding instead of external
  margin-bottom: var(--space-2);  // Spacing between comments
  transition: background 0.15s;
  
  &:hover {
    background: var(--color-bg-tertiary, #f1f5f9);
  }
}

// Remove external padding from .comment
.comment {
  > .single-comment:first-of-type {
    padding: 0;  // Remove padding, use margin instead
  }
}
```

**Result**: Each comment is a distinct card with hover state

### Phase B: Horizontal Space Optimization (Priority: HIGH)

**Goal**: Maximize text area width on mobile

**Changes:**

```scss
// Reduce avatar size on mobile
@media (max-width: 768px) {
  .single-comment .comment-header-image img {
    width: 28px;  // Smaller avatar
    height: 28px;
  }
  
  .single-comment {
    gap: var(--space-2);  // Tighter gap
  }
}

// Ensure content takes full available width
.single-comment .flex-grow-1 {
  flex: 1;
  min-width: 0;  // Allow text to wrap properly
  word-break: break-word;  // Prevent overflow
}
```

**Result**: More horizontal space for text on mobile

### Phase C: Vertical Spacing Reduction (Priority: MEDIUM)

**Goal**: Reduce excessive vertical padding

**Changes:**

```scss
// Reduce comment container padding
.comment-container {
  padding: var(--space-2) var(--space-3) !important;  // Reduced from space-3 space-4
}

// Reduce internal comment padding
.single-comment {
  padding: var(--space-2) var(--space-3);  // Reduced from space-3
}

// Reduce spacing between comments
.single-comment {
  margin-bottom: var(--space-2);  // Reduced from space-3
}
```

**Result**: Tighter, more compact comment layout

### Phase D: Visual Hierarchy (Priority: HIGH)

**Goal**: Make comment structure clear

**Changes:**

```scss
// Stronger name styling
.comment-heading {
  font-size: var(--font-size-base);  // Larger name
  font-weight: $font-weight-bold;  // Bolder
  margin-bottom: var(--space-1);
  
  .timestamp {
    font-size: var(--font-size-xs);
    color: var(--color-text-muted);
    font-weight: normal;
    margin-left: var(--space-2);
  }
}

// Content styling
.content {
  font-size: var(--font-size-base);  // Larger text
  line-height: 1.6;  // Better readability
  margin: var(--space-2) 0;
}

// Action buttons with icons
.wall-entry-controls {
  display: flex;
  gap: var(--space-3);
  margin-top: var(--space-2);
  
  a {
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--color-text-muted);
    font-size: var(--font-size-sm);
    
    &:hover {
      color: var(--color-primary);
    }
    
    i {
      font-size: 14px;
    }
  }
}
```

**Result**: Clear visual hierarchy, easier to scan

### Phase E: Reply Differentiation (Priority: HIGH)

**Goal**: Make nested replies visually distinct

**Option 1: Indented with thread line**
```scss
// Nested replies indented with visual thread
.comment > .single-comment ~ .single-comment {
  margin-left: 48px;  // Indent past avatar
  padding-left: var(--space-3);
  border-left: 2px solid var(--color-border);
  
  &::before {
    display: none;
  }
}
```

**Option 2: Disable nesting (simpler)**
```php
// In comment widget override, disable reply functionality
// All comments are flat, no nesting
```

**Recommendation**: Option 1 (indented with thread line) for better UX

**Result**: Clear conversation threads, easy to follow

### Phase F: Mobile-Specific Optimizations (Priority: MEDIUM)

**Goal**: Optimize for 375-430px screens

**Changes:**

```scss
@media (max-width: 576px) {
  // Stack avatar above text on very small screens
  .single-comment {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--space-2);
  }
  
  .comment-header-image {
    margin-bottom: var(--space-1);
  }
  
  // Reduce padding further
  .single-comment {
    padding: var(--space-2);
  }
}
```

**Result**: Better use of horizontal space on small screens

---

## Implementation Order

1. **Phase A**: Card styling (most visual impact)
2. **Phase B**: Horizontal space (fixes "too narrow")
3. **Phase C**: Vertical spacing (fixes "too much space")
4. **Phase D**: Hierarchy (improves readability)
5. **Phase E**: Reply differentiation (improves conversation flow)
6. **Phase F**: Mobile optimization (responsive polish)

---

## Testing Plan

After implementation:
1. Create test posts with comments (top-level and nested)
2. Test on mobile (375px), tablet (768px), desktop (1280px)
3. Verify:
   - Comments are distinct cards
   - Text area is wide enough
   - Vertical spacing is balanced
   - Hierarchy is clear
   - Replies are visually distinct
4. Compare to Instagram/Facebook/X screenshots
5. Run Playwright tests to verify no regressions

---

## Risk Assessment

**Low Risk:**
- SCSS changes only (no PHP/JS logic changes)
- Scoped to `.single-comment`, `.comment-container` selectors
- Existing functionality preserved

**Medium Risk:**
- Reply nesting changes may affect conversation flow
- Mobile layout changes may need iteration

**Mitigation:**
- Test thoroughly on all viewports
- Keep backup of original SCSS
- Git commit after each phase for easy rollback
