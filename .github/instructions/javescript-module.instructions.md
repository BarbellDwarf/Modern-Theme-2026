---
description: "Use when modifying or creating JavaScript modules for the Modern Theme. Covers ES6 modules in resources/js/ for reaction picker, context switcher, mobile nav, notifications, and theme switching."
name: "JavaScript Modules Guidelines"
applyTo: "resources/js/**/*.js"
---

# JavaScript Modules Guidelines

## Overview

Modern Theme 2026 uses ES6+ JavaScript modules for interactivity:
- Reaction picker interactions
- Context switcher keyboard shortcuts
- Mobile navigation interactions
- Palette switching (theme colors)
- Notifications handling
- Accessibility features (focus guards, modal fixes)

All JavaScript is modular, event-driven, and registered via `ModernThemeAsset.php`.

## Module Location & Registration

**Location**: `resources/js/`

**Registration**: Modules listed in `assets/ModernThemeAsset.php`:

```php
public $js = [
    'js/contextSwitcher.js',
    'js/reactionPicker.js',
    'js/peopleFocusGuard.js',
    'js/paletteSwitcher.js',
    'js/notifications.js',
    'js/modalFocusFix.js',
    'js/mobileKeyboardFix.js',
];
```

When you create a new JavaScript module, add it to this array in `ModernThemeAsset.php`.

## Module Pattern (IIFE)

Use the Immediately Invoked Function Expression (IIFE) pattern to avoid global namespace pollution:

```javascript
// resources/js/myFeature.js
(function() {
    'use strict';
    
    // Module initialization
    const MyFeature = {
        /**
         * Initialize the feature
         */
        init() {
            this.cacheElements();
            this.bindEvents();
        },
        
        /**
         * Cache frequently-used DOM elements
         */
        cacheElements() {
            this.$container = document.querySelectorAll('[data-mt2026-my-feature]');
            this.$button = document.getElementById('my-button');
        },
        
        /**
         * Bind event listeners
         */
        bindEvents() {
            if (this.$button) {
                this.$button.addEventListener('click', () => this.handleClick());
            }
            
            this.$container.forEach(el => {
                el.addEventListener('mouseenter', () => this.handleHover(el));
            });
        },
        
        /**
         * Handle click event
         */
        handleClick() {
            console.log('Button clicked');
            // Do something
        },
        
        /**
         * Handle hover event
         */
        handleHover(element) {
            element.classList.add('active');
        }
    };
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MyFeature.init());
    } else {
        MyFeature.init();
    }
    
    // Expose for debugging (optional)
    window.HumHubTheme = window.HumHubTheme || {};
    window.HumHubTheme.MyFeature = MyFeature;
})();
```

## Data Attributes Convention

Use `data-mt2026-*` attributes to identify elements:

```html
<!-- HTML with data attributes -->
<div data-mt2026-reaction-picker>
    <button data-mt2026-reaction-type="like">👍</button>
</div>

<!-- CSS selector in JavaScript -->
const pickers = document.querySelectorAll('[data-mt2026-reaction-picker]');
```

**Naming**:
- Use kebab-case for data attributes: `data-mt2026-component-name`
- Prefix all with `mt2026-` to avoid conflicts
- Use semantic names: `data-mt2026-modal`, not `data-mt2026-pop-up`

## Core Modules

### 1. reactionPicker.js

**Purpose**: Handle emoji reaction interactions

**Features**:
- Show/hide picker on hover (desktop) or tap (mobile)
- Submit reaction via AJAX
- Update UI on success
- Handle errors gracefully

**Pattern**:
```javascript
(function() {
    'use strict';
    
    const ReactionPicker = {
        reactions: ['like', 'love', 'laugh', 'sad', 'pray'],
        
        init() {
            this.cacheElements();
            this.bindEvents();
        },
        
        cacheElements() {
            this.$pickers = document.querySelectorAll('[data-mt2026-reaction-picker]');
        },
        
        bindEvents() {
            this.$pickers.forEach(picker => {
                // Hover to show picker
                picker.addEventListener('mouseenter', (e) => this.showPicker(e));
                picker.addEventListener('mouseleave', (e) => this.hidePicker(e));
                
                // Click reaction button
                const buttons = picker.querySelectorAll('[data-mt2026-reaction-type]');
                buttons.forEach(btn => {
                    btn.addEventListener('click', (e) => this.submitReaction(e));
                });
            });
        },
        
        showPicker(event) {
            const picker = event.target.closest('[data-mt2026-reaction-picker]');
            const pickerUI = picker.querySelector('[data-mt2026-picker-ui]');
            if (pickerUI) {
                pickerUI.classList.add('visible');
            }
        },
        
        hidePicker(event) {
            const picker = event.target.closest('[data-mt2026-reaction-picker]');
            const pickerUI = picker.querySelector('[data-mt2026-picker-ui]');
            if (pickerUI) {
                pickerUI.classList.remove('visible');
            }
        },
        
        submitReaction(event) {
            event.preventDefault();
            
            const button = event.target;
            const type = button.dataset.mt2026ReactionType;
            const picker = button.closest('[data-mt2026-reaction-picker]');
            const contentId = picker.dataset.contentId;
            const contentClass = picker.dataset.contentClass;
            
            // Send AJAX request
            fetch('/reaction-api/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-Csrf-Token': this.getCsrfToken()
                },
                body: JSON.stringify({
                    content_id: contentId,
                    content_class: contentClass,
                    reaction_type: type
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    this.updateUI(picker, data);
                } else {
                    console.error('Reaction failed:', data.error);
                }
            })
            .catch(error => {
                console.error('Request failed:', error);
            });
        },
        
        updateUI(picker, data) {
            // Update reaction counts
            const countEl = picker.querySelector('[data-mt2026-reaction-count]');
            if (countEl) {
                countEl.textContent = data.total_count;
            }
            
            // Mark current user's reaction
            const buttons = picker.querySelectorAll('[data-mt2026-reaction-type]');
            buttons.forEach(btn => {
                if (btn.dataset.mt2026ReactionType === data.current_reaction) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        },
        
        getCsrfToken() {
            return document.querySelector('meta[name="csrf-token"]')?.content || '';
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ReactionPicker.init());
    } else {
        ReactionPicker.init();
    }
    
    window.HumHubTheme = window.HumHubTheme || {};
    window.HumHubTheme.ReactionPicker = ReactionPicker;
})();
```

### 2. contextSwitcher.js

**Purpose**: Keyboard shortcut (Ctrl/Cmd+K) for space switching

**Features**:
- Ctrl+K / Cmd+K opens context menu
- Search/filter spaces
- Arrow keys to navigate
- Enter to select
- Escape to close

```javascript
(function() {
    'use strict';
    
    const ContextSwitcher = {
        isOpen: false,
        selectedIndex: -1,
        
        init() {
            this.bindKeyboardShortcut();
        },
        
        bindKeyboardShortcut() {
            document.addEventListener('keydown', (e) => {
                // Check for Ctrl+K or Cmd+K
                if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                    e.preventDefault();
                    this.toggle();
                }
                
                // Navigation when open
                if (this.isOpen) {
                    if (e.key === 'ArrowDown') {
                        e.preventDefault();
                        this.selectNext();
                    }
                    if (e.key === 'ArrowUp') {
                        e.preventDefault();
                        this.selectPrev();
                    }
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.selectItem();
                    }
                    if (e.key === 'Escape') {
                        this.close();
                    }
                }
            });
        },
        
        toggle() {
            if (this.isOpen) {
                this.close();
            } else {
                this.open();
            }
        },
        
        open() {
            this.isOpen = true;
            const switcher = document.querySelector('[data-mt2026-context-switcher]');
            if (switcher) {
                switcher.classList.add('open');
                // Focus search input
                const input = switcher.querySelector('input');
                if (input) input.focus();
            }
        },
        
        close() {
            this.isOpen = false;
            const switcher = document.querySelector('[data-mt2026-context-switcher]');
            if (switcher) {
                switcher.classList.remove('open');
            }
        },
        
        selectNext() {
            const items = this.getVisibleItems();
            this.selectedIndex = Math.min(this.selectedIndex + 1, items.length - 1);
            this.updateSelection(items);
        },
        
        selectPrev() {
            const items = this.getVisibleItems();
            this.selectedIndex = Math.max(this.selectedIndex - 1, 0);
            this.updateSelection(items);
        },
        
        selectItem() {
            const items = this.getVisibleItems();
            if (items[this.selectedIndex]) {
                items[this.selectedIndex].click();
            }
        },
        
        getVisibleItems() {
            const switcher = document.querySelector('[data-mt2026-context-switcher]');
            return Array.from(switcher.querySelectorAll('[data-mt2026-context-item]'));
        },
        
        updateSelection(items) {
            items.forEach((item, index) => {
                if (index === this.selectedIndex) {
                    item.classList.add('selected');
                } else {
                    item.classList.remove('selected');
                }
            });
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ContextSwitcher.init());
    } else {
        ContextSwitcher.init();
    }
    
    window.HumHubTheme = window.HumHubTheme || {};
    window.HumHubTheme.ContextSwitcher = ContextSwitcher;
})();
```

### 3. paletteSwitcher.js

**Purpose**: Switch between 4 color palettes

**Features**:
- Theme selector UI
- Save preference
- Apply `data-theme` attribute to `<html>`
- Persist in localStorage

```javascript
(function() {
    'use strict';
    
    const PaletteSwitcher = {
        themes: ['professional', 'purple', 'green', 'neutral'],
        storageKey: 'mt2026-theme',
        
        init() {
            this.loadTheme();
            this.bindEvents();
        },
        
        bindEvents() {
            const buttons = document.querySelectorAll('[data-mt2026-theme-btn]');
            buttons.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const theme = btn.dataset.mt2026Theme;
                    this.setTheme(theme);
                });
            });
        },
        
        loadTheme() {
            const saved = localStorage.getItem(this.storageKey);
            const theme = saved || 'professional';
            this.applyTheme(theme);
        },
        
        setTheme(theme) {
            if (!this.themes.includes(theme)) {
                console.error('Invalid theme:', theme);
                return;
            }
            
            localStorage.setItem(this.storageKey, theme);
            this.applyTheme(theme);
            
            // Dispatch custom event for other modules
            window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme } }));
        },
        
        applyTheme(theme) {
            const html = document.documentElement;
            
            if (theme === 'professional') {
                html.removeAttribute('data-theme');
            } else {
                html.setAttribute('data-theme', theme);
            }
            
            // Update button states
            const buttons = document.querySelectorAll('[data-mt2026-theme-btn]');
            buttons.forEach(btn => {
                if (btn.dataset.mt2026Theme === theme) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PaletteSwitcher.init());
    } else {
        PaletteSwitcher.init();
    }
    
    window.HumHubTheme = window.HumHubTheme || {};
    window.HumHubTheme.PaletteSwitcher = PaletteSwitcher;
})();
```

### 4. notifications.js

**Purpose**: Handle notification badge updates via live updates

**Features**:
- Listen for notification events
- Update badge count
- Save preference for notification sound

```javascript
(function() {
    'use strict';
    
    const Notifications = {
        init() {
            this.bindLiveUpdates();
        },
        
        bindLiveUpdates() {
            // Listen for HumHub live update events
            document.addEventListener('humhubLiveEventUpdate', (e) => {
                if (e.detail.event === 'notification:new') {
                    this.onNewNotification(e.detail.data);
                }
            });
        },
        
        onNewNotification(data) {
            // Update badge count
            this.updateNotificationBadge();
            
            // Play sound if enabled
            if (this.shouldPlaySound()) {
                this.playNotificationSound();
            }
        },
        
        updateNotificationBadge() {
            const badge = document.querySelector('[data-mt2026-notification-count]');
            if (badge) {
                // Fetch updated count (or use cached value)
                const count = this.getUnreadCount();
                badge.textContent = count > 99 ? '99+' : count;
            }
        },
        
        getUnreadCount() {
            // Get count from existing DOM or API
            const badge = document.querySelector('[data-mt2026-notification-count]');
            return parseInt(badge?.textContent || '0', 10);
        },
        
        shouldPlaySound() {
            return localStorage.getItem('mt2026-notification-sound') !== 'disabled';
        },
        
        playNotificationSound() {
            // Play sound file
            const audio = new Audio('/assets/notification.mp3');
            audio.play().catch(err => console.debug('Sound play failed:', err));
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => Notifications.init());
    } else {
        Notifications.init();
    }
    
    window.HumHubTheme = window.HumHubTheme || {};
    window.HumHubTheme.Notifications = Notifications;
})();
```

### 5. peopleFocusGuard.js

**Purpose**: Accessibility - prevent focus from escaping modal/dropdown

```javascript
(function() {
    'use strict';
    
    const PeopleFocusGuard = {
        init() {
            this.bindTrapFocus();
        },
        
        bindTrapFocus() {
            document.addEventListener('keydown', (e) => {
                if (e.key !== 'Tab') return;
                
                // Find active modal/dropdown
                const modal = document.querySelector('[data-mt2026-modal].active');
                if (!modal) return;
                
                const focusable = modal.querySelectorAll(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusable.length === 0) return;
                
                const first = focusable[0];
                const last = focusable[focusable.length - 1];
                
                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            });
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => PeopleFocusGuard.init());
    } else {
        PeopleFocusGuard.init();
    }
})();
```

### 6. modalFocusFix.js

**Purpose**: Handle modal focus management and escape key

```javascript
(function() {
    'use strict';
    
    const ModalFocusFix = {
        previouslyFocused: null,
        
        init() {
            this.bindModalEvents();
        },
        
        bindModalEvents() {
            document.addEventListener('show.bs.modal', (e) => {
                this.onModalOpen(e.target);
            });
            
            document.addEventListener('hide.bs.modal', (e) => {
                this.onModalClose(e.target);
            });
        },
        
        onModalOpen(modal) {
            this.previouslyFocused = document.activeElement;
            
            // Focus first input or button
            const focusable = modal.querySelector('button, input, select, textarea');
            if (focusable) {
                focusable.focus();
            }
        },
        
        onModalClose(modal) {
            // Return focus to trigger element
            if (this.previouslyFocused && this.previouslyFocused.focus) {
                this.previouslyFocused.focus();
            }
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ModalFocusFix.init());
    } else {
        ModalFocusFix.init();
    }
})();
```

### 7. mobileKeyboardFix.js

**Purpose**: Fix keyboard handling on mobile (prevent viewport jump on iOS)

```javascript
(function() {
    'use strict';
    
    const MobileKeyboardFix = {
        init() {
            this.fixKeyboardBehavior();
        },
        
        fixKeyboardBehavior() {
            // Prevent viewport jump on iOS keyboard show/hide
            const inputs = document.querySelectorAll('input, textarea');
            inputs.forEach(input => {
                input.addEventListener('focus', () => {
                    // Scroll input into view with padding
                    setTimeout(() => {
                        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                });
            });
            
            // Fix 100vh on mobile
            const setVH = () => {
                const vh = window.innerHeight * 0.01;
                document.documentElement.style.setProperty('--vh', `${vh}px`);
            };
            
            setVH();
            window.addEventListener('resize', setVH);
            window.addEventListener('orientationchange', setVH);
        }
    };
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => MobileKeyboardFix.init());
    } else {
        MobileKeyboardFix.init();
    }
})();
```

## JavaScript Best Practices

### 1. Event Delegation

Instead of adding listeners to many elements, use event delegation:

```javascript
// ❌ AVOID: Many listeners
elements.forEach(el => {
    el.addEventListener('click', handler);
});

// ✅ PREFER: Single delegated listener
container.addEventListener('click', (e) => {
    if (e.target.matches('[data-mt2026-button]')) {
        handler(e);
    }
});
```

### 2. Cache DOM Queries

Query the DOM once and cache references:

```javascript
// ❌ AVOID: Multiple queries
button.addEventListener('click', () => {
    document.querySelector('[data-mt2026-modal]').show();
});

// ✅ PREFER: Cache reference
const init = () => {
    const modal = document.querySelector('[data-mt2026-modal]');
    button.addEventListener('click', () => modal.show());
};
```

### 3. Error Handling

Always handle errors in AJAX and async operations:

```javascript
// ✅ Good error handling
fetch(url)
    .then(response => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
    })
    .then(data => this.updateUI(data))
    .catch(error => {
        console.error('Request failed:', error);
        this.showErrorMessage('Something went wrong');
    });
```

### 4. Accessibility

Always include ARIA attributes for screen readers:

```html
<!-- ✅ Good accessibility -->
<button data-mt2026-modal-toggle aria-label="Close menu" aria-expanded="false">
    <span aria-hidden="true">×</span>
</button>
```

### 5. Mobile Detection

Detect mobile without user agent sniffing:

```javascript
const isMobile = () => {
    return window.matchMedia('(max-width: 768px)').matches;
};

// Listen for changes
window.matchMedia('(max-width: 768px)').addListener((m) => {
    if (m.matches) {
        console.log('Now mobile');
    }
});
```

## Common Patterns

### Debounce for Performance

```javascript
const debounce = (fn, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => fn(...args), delay);
    };
};

// Usage
window.addEventListener('resize', debounce(() => {
    this.handleResize();
}, 250));
```

### Custom Events for Inter-Module Communication

```javascript
// Module A broadcasts event
window.dispatchEvent(new CustomEvent('themeChanged', { 
    detail: { theme: 'purple' } 
}));

// Module B listens
window.addEventListener('themeChanged', (e) => {
    console.log('New theme:', e.detail.theme);
});
```

### CSRF Token for AJAX

```javascript
const getCsrfToken = () => {
    return document.querySelector('meta[name="csrf-token"]')?.content || '';
};

fetch(url, {
    method: 'POST',
    headers: {
        'X-Csrf-Token': getCsrfToken(),
        'Content-Type': 'application/json'
    }
});
```

## Testing Checklist

- [ ] Module initializes without errors
- [ ] Events fire correctly
- [ ] Mobile view works (< 768px)
- [ ] Desktop view works (> 768px)
- [ ] Keyboard navigation works
- [ ] No console errors
- [ ] AJAX calls include CSRF token
- [ ] Accessibility features work (screen reader, keyboard)
- [ ] Performance: no excessive event listeners
- [ ] Memory: event listeners cleaned up

## Never Do

❌ **Forbidden**:
- Modify HumHub core JavaScript
- Use jQuery unnecessarily (HumHub provides it, but avoid if possible)
- Global variables outside module
- Synchronous AJAX
- Direct DOM manipulation for state
- Missing error handlers
- Assuming user input is valid
- Skipping mobile testing

---

**Key Principle**: All JavaScript lives in modular IIFE patterns with `data-mt2026-*` attribute selectors. Never edit HumHub's core JavaScript.
