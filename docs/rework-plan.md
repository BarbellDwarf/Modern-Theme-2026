# Post-Work Rework Plan: Phase 4 Audit

## Overview
After completing all 4 phases of the comprehensive UI/UX overhaul, this plan documents the post-work audit to verify fixes and identify any regressions.

## Phases Completed
- **Phase 1**: Critical Bugfixes (6 tasks) - ✅ Complete
- **Phase 2**: Mobile UX Overhaul (9 tasks) - ✅ Complete  
- **Phase 3**: Architecture (7 tasks) - ✅ Complete
- **Phase 4**: Accessibility, Performance & Polish (9 tasks) - ✅ Complete

## Current Status
**Branch**: `phase-4/polish`
**Tests**: 64/64 passing
**Commits**: 30+ commits across all phases

---

## Known Issues to Investigate

### 1. Admin Pages - "Completely Ruined"
**User Report**: "The admin pages is completely ruined"
**Likely Cause**: 
- Commit `3eedd94` (Task 4h) added 575px media query with stacked-card rules
- These rules target `.mt2026-admin-content .grid-view` at `max-width: 575px`
- May be too aggressive, stacking all admin tables including those without proper `data-label` attributes

**Files to Review**:
- `themes/ModernTheme2026/scss/humhub/_admin-settings.scss` (lines 200-226)
- `views/admin/views/layouts/main.php`

**Audit Action**:
```bash
# Test admin pages on mobile (375px)
BASE_URL=https://localhost ADMIN_PASS=admin123 node tests/playwright/test_admin_people_audit.js
```

**Potential Fix**:
- Revert the 575px stacked-card rules OR
- Add more specific selectors to only target User/Space management tables
- Ensure `data-label` attributes exist on TDs before applying `::before` content

### 2. People Directory - "Overlapping and Crushed"
**User Report**: "All the users are overlapping and crushed together... On mobile specifically"
**Likely Causes**:
1. Commit `889f34c` (Task 4g) changed `767px` → `768px` breakpoint
2. Removed `margin-left: -8px; margin-right: -8px` from `.row.cards`, replaced with `gap: 0`
3. No explicit gap between cards, may cause visual crushing

**Files to Review**:
- `themes/ModernTheme2026/scss/humhub/_mobile.scss` (lines 492-506)
- `themes/ModernTheme2026/views/user/widgets/peopleCard.php`

**Audit Action**:
```bash
# Test people directory on mobile (375px)
BASE_URL=https://localhost ADMIN_PASS=admin123 node tests/playwright/test_admin_people_audit.js
```

**Potential Fix**:
- Add `gap: 8px` to `.row.cards` instead of `gap: 0`
- OR restore `margin-left: -8px; margin-right: -8px` with proper card padding
- Revert breakpoint from `768px` to `767px` if tablet layout is broken

### 3. Phase 3 Refactoring - Potential Regressions
**Concern**: SCSS file splits (Phase 3) may have introduced cascade issues
**Files Changed**:
- `_dark-mode.scss` → 7 partials in `dark-mode/`
- `_admin.scss` → 5 partials
- `_stream.scss` → 2 partials
- `_mail.scss` → 4 partials

**Audit Action**:
- Verify all styles still apply correctly after split
- Check for missing imports in `build.scss`
- Verify dark mode styles still cascade properly

---

## Subagent Execution Plan

### Task 1: Run Comprehensive Audit
**Priority**: HIGH
**Assignee**: Subagent (general-purpose)
**Instructions**:
1. Run `test_admin_people_audit.js` on mobile (375x812)
2. Run on tablet (768x1024)
3. Run on desktop (1280x800)
4. Capture screenshots to `/tmp/audit-*.png`
5. Document all issues with severity ratings
6. Compare against pre-Phase-4 state

**Deliverables**:
- `docs/ui-audit/post-work-audit/mobile-375x812.md`
- `docs/ui-audit/post-work-audit/tablet-768x1024.md`
- `docs/ui-audit/post-work-audit/desktop-1280x800.md`
- Screenshots: `/tmp/audit-*.png`

### Task 2: Analyze Audit Results
**Priority**: HIGH
**Assignee**: Subagent (general-purpose)
**Instructions**:
1. Read all audit markdown files
2. Compare issues found vs issues from original audit
3. Identify regressions (new issues introduced by Phase 4)
4. Identify unresolved issues (original issues still present)
5. Categorize by severity: critical/major/minor/cosmetic

**Deliverables**:
- `docs/ui-audit/post-work-audit/regression-analysis.md`
- `docs/ui-audit/post-work-audit/unresolved-issues.md`

### Task 3: Fix Critical Regressions
**Priority**: HIGH
**Assignee**: Subagent (general-purpose)
**Instructions**:
1. Review regression analysis
2. Fix critical issues:
   - Admin pages overlapping/crushed
   - People cards overlapping on mobile
3. Commit fixes to `phase-4/polish` branch
4. Run Playwright tests to verify

**Deliverables**:
- Git commits with fix messages
- Updated test results

### Task 4: Fix Major Issues
**Priority**: MEDIUM
**Assignee**: Subagent (general-purpose)
**Instructions**:
1. Review unresolved issues list
2. Fix major issues (non-critical but significantly impacting UX)
3. Commit fixes
4. Verify with tests

**Deliverables**:
- Git commits
- Updated test results

### Task 5: Final Verification
**Priority**: MEDIUM
**Assignee**: Subagent (general-purpose)
**Instructions**:
1. Run full Playwright test suite
2. Verify all 64 original tests still pass
3. Run audit tests on all viewports
4. Generate final report

**Deliverables**:
- `docs/ui-audit/post-work-audit/final-report.md`
- Test results summary

---

## Rollback Plan

If critical regressions cannot be fixed quickly:
1. Revert specific commits:
   ```bash
   git revert 3eedd94  # Admin stacked-card rules
   git revert 889f34c  # People breakpoint change
   ```
2. Or revert entire Phase 4:
   ```bash
   git checkout main
   ```

---

## Success Criteria

✅ Admin pages render correctly on mobile (375px)
✅ People directory cards have proper spacing on mobile
✅ All 64 Playwright tests pass
✅ No new regressions introduced
✅ Tablet layout (768px) works correctly
✅ Desktop layout (1280px) unchanged

---

## Execution Order

1. **Subagent 1**: Run audit (Task 1)
2. **Subagent 2**: Analyze results (Task 2)
3. **Subagent 3**: Fix critical issues (Task 3)
4. **Subagent 4**: Fix major issues (Task 4)
5. **Subagent 5**: Final verification (Task 5)

**Note**: Tasks 1-2 can run in parallel. Tasks 3-5 must run sequentially.

---

## BLOCKER: Stream Comments Overhaul

**Status**: MUST FIX BEFORE AUDIT
**File**: `docs/ui-audit/post-work-audit/stream-comments-fix.md`
**Priority**: CRITICAL

### Problem
- Comments look "visibly poor" and "minorly functional"
- Too narrow horizontally, too much vertical space
- Lack visual differentiation between comments
- No Instagram/Facebook/X quality UX

### Required Work
6 phases of SCSS improvements:
1. **Phase A**: Card-based comment styling (backgrounds, borders)
2. **Phase B**: Horizontal space optimization (wider text area)
3. **Phase C**: Vertical spacing reduction (tighter layout)
4. **Phase D**: Visual hierarchy (stronger name/content/action styling)
5. **Phase E**: Reply differentiation (indented with thread lines)
6. **Phase F**: Mobile-specific optimizations

### Execution Plan

**Task 0: Stream Comments Fix** (NEW - blocks audit)
- **Priority**: CRITICAL
- **Assignee**: Subagent (general-purpose)
- **Instructions**: Implement all 6 phases from `stream-comments-fix.md`
- **Deliverables**: 
  - Updated `_stream-comments.scss`
  - Test posts with comments
  - Screenshots showing before/after
  - Git commit: `feat: stream comments visual overhaul — card styling, hierarchy, mobile optimization`

### Updated Execution Order

1. **Task 0**: Stream comments fix (BLOCKER)
2. **Task 1**: Run comprehensive audit (admin/people)
3. **Task 2**: Analyze audit results
4. **Task 3**: Fix critical regressions
5. **Task 4**: Fix major issues
6. **Task 5**: Final verification

### Success Criteria

✅ Comments look like Instagram/Facebook/X quality
✅ Each comment is a distinct card with background
✅ Text area is wide enough (not cramped)
✅ Vertical spacing is balanced (not excessive)
✅ Clear visual hierarchy (name, content, actions)
✅ Replies are visually distinct (indented with thread lines)
✅ Responsive on mobile (375px), tablet (768px), desktop (1280px)
