(function () {
  'use strict';

  var MobileContentToggle = {
    init: function () {
      if (window.matchMedia('(max-width: 991px)').matches) {
        this.bindToggle();
      }
      var self = this;
      window.matchMedia('(max-width: 991px)').addEventListener('change', function (mql) {
        if (mql.matches) {
          self.bindToggle();
        }
      });
    },

    bindToggle: function () {
      var self = this;
      if (self._delegationBound) return;
      document.addEventListener('click', function (e) {
        var el = e.target.closest('.wall-entry-content.content');
        if (el) self.toggleExpanded(el);
      });
      self._delegationBound = true;
    },

    toggleExpanded: function (el) {
      el.classList.toggle('expanded');
    }
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { MobileContentToggle.init(); });
  } else {
    MobileContentToggle.init();
  }

  window.HumHubTheme = window.HumHubTheme || {};
  window.HumHubTheme.MobileContentToggle = MobileContentToggle;
})();
