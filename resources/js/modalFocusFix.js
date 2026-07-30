(function() {
    'use strict';

    const ModalFocusFix = {
        previouslyFocused: null,
        focusableSelector: 'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',

        init() {
            this.bindModalEvents();
        },

        getFocusableElements(modal) {
            return Array.from(modal.querySelectorAll(this.focusableSelector))
                .filter(el => el.offsetParent !== null && !el.disabled);
        },

        trapFocus(e, modal) {
            const focusable = this.getFocusableElements(modal);
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
        },

        bindModalEvents() {
            document.addEventListener('show.bs.modal', (e) => {
                this.previouslyFocused = document.activeElement;
                const modal = e.target;
                setTimeout(() => {
                    const focusable = this.getFocusableElements(modal);
                    if (focusable.length > 0) {
                        focusable[0].focus();
                    }
                }, 100);
            });

            document.addEventListener('shown.bs.modal', (e) => {
                const modal = e.target;
                const handler = (ev) => this.trapFocus(ev, modal);
                modal.addEventListener('keydown', handler);
                modal._focusTrapHandler = handler;
            });

            document.addEventListener('hide.bs.modal', (e) => {
                const modal = e.target;
                if (modal._focusTrapHandler) {
                    modal.removeEventListener('keydown', modal._focusTrapHandler);
                    delete modal._focusTrapHandler;
                }
            });

            document.addEventListener('hidden.bs.modal', () => {
                if (this.previouslyFocused && this.previouslyFocused.focus) {
                    this.previouslyFocused.focus();
                    this.previouslyFocused = null;
                }
            });
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => ModalFocusFix.init());
    } else {
        ModalFocusFix.init();
    }
})();
