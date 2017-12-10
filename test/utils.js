/* exported utils */
/* eslint-env browser */

var utils = (function() {
  'use strict';

  function makeState(overlays, states, cbChange, cbReady) {
    var timer, waitCount = 0, overlaysLen, methodCalled = [], listeners = [],
      MAX_WAIT_COUNT = 500,
      EVENT_PROP_NAMES = ['onShow', 'onHide', 'onBeforeShow', 'onBeforeHide'];

    function doFnc() {
      clearTimeout(timer);

      var readyCount = 0;
      overlays.forEach(function(overlay, i) {
        if (overlay.state === states[i]) {
          if (methodCalled[i]) {
            // Restore listeners
            EVENT_PROP_NAMES.forEach(function(propName) {
              overlay[propName] = listeners[i][propName];
            });
          }
          readyCount++;

        } else if (!methodCalled[i]) {
          // Save listeners
          listeners[i] = {};
          EVENT_PROP_NAMES.forEach(function(propName) {
            listeners[i][propName] = overlay[propName];
            overlay[propName] = null;
          });

          methodCalled[i] = true;
          setTimeout(function() { cbChange(overlay); }, 0); // setTimeout for separation
        }
      });

      if (readyCount >= overlaysLen) {
        cbReady();
      } else {
        waitCount++;
        if (waitCount > MAX_WAIT_COUNT) { throw new Error('`state` can not become ' + states + '.'); }
        timer = setTimeout(doFnc, 10);
      }
    }

    if (!Array.isArray(overlays)) { overlays = [overlays]; }
    overlaysLen = overlays.length;

    if (!Array.isArray(states)) { states = [states]; }
    var statesLen = states.length;
    if (statesLen < overlaysLen) { // Repeat last value
      var lastValue = states[statesLen - 1];
      for (var i = statesLen; i < overlaysLen; i++) {
        states[i] = lastValue;
      }
    }

    doFnc();
  }

  return {
    makeState: makeState
  };
})();
