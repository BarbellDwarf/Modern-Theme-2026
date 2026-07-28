(function () {
  'use strict';

  var MobileContentToggle = {
    init: function () {
      if (window.matchMedia('(max-width: 991px)').matches) {
        this.bindToggle();
      }
      var self = this;
      window.matchMedia('(max-width: 991px)').addListener(function (mql) {
        if (mql.matches) {
          self.bindToggle();
        }
      });
    },

    bindToggle: function () {
      var self = this;
      document.querySelectorAll('.wall-entry-content.content').forEach(function (el) {
        el.addEventListener('click', function () {
          self.toggleExpanded(el);
        });
      });
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
