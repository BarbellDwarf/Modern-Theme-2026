/**
 * Modal Accessibility Fix
 *
 * The browser warns when aria-hidden="true" is set on a modal that still
 * contains a focused element (e.g. the btn-close that was just clicked).
 *
 * HumHub sets aria-hidden="true" in the hidden.bs.modal handler (after the
 * modal closes), and Bootstrap's own _hideModal() also sets it during the
 * close animation — both fire while focus can still be on a descendant.
 *
 * Fix: on hide.bs.modal (fires before any aria-hidden change), move focus
 * away from any focused descendant so the modal is clean when hidden.
 */
humhub.module('modernTheme.modalFocusFix', function(module, require, $) {

    function init() {
        $(document).on('hide.bs.modal.mt2026fix', '.modal', function() {
            if (document.activeElement && $.contains(this, document.activeElement)) {
                document.activeElement.blur();
            }
        });
    }

    module.initOnPjaxLoad = false;
    module.export({ init: init });
});
