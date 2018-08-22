/* exported utils */
/* eslint-env browser */
/* eslint no-var: "off", prefer-arrow-callback: "off", object-shorthand: "off" */

var utils = (function() {
  'use strict';

  var DEFAULT_INTERVAL = 10;

  function intervalExec(list) {
    var interval = 1, // default value for first
      index = -1;

    function execNext() {
      var fnc;
      while (++index <= list.length - 1) {
        if (typeof list[index] === 'number') {
          interval = list[index];
        } else if (typeof list[index] === 'function') {
          fnc = list[index];
          break;
        }
      }
      if (fnc) {
        setTimeout(function() {
          fnc();
          interval = DEFAULT_INTERVAL;
          execNext();
        }, interval);
      }
    }

    execNext();
  }

  /**
   * @param {(Object|Object[])} instances - A instance or an Array that contains instances.
   * @param {(number|number[])} states - Wanted state. Last one is copied if there is a shortage of elements.
   * @param {function} cbChange - It is called to change the state. It is not called again if this returned `true`.
   * @param {function} cbReady - It is called when all instances have each wanted state.
   * @returns {void}
   */
  function makeState(instances, states, cbChange, cbReady) {
    var SAVE_PROP_NAMES = ['onShow', 'onHide', 'onBeforeShow', 'onBeforeHide'],
      waitCount = 0,
      changed = [],
      saveProps = [],
      nomoreChange, timer, instancesLen;

    function doFnc() {
      clearTimeout(timer);

      var readyCount = 0;
      instances.forEach(function(instance, i) {
        if (instance.state === states[i]) {
          if (changed[i]) {
            // Restore props
            SAVE_PROP_NAMES.forEach(function(propName) {
              instance[propName] = saveProps[i][propName];
            });
          }
          readyCount++;

        } else {
          setTimeout(function() { // setTimeout for separation
            if (!nomoreChange && !changed[i]) {
              // Save props
              saveProps[i] = {};
              SAVE_PROP_NAMES.forEach(function(propName) {
                saveProps[i][propName] = instance[propName];
                instance[propName] = null;
              });

              changed[i] = true;
              nomoreChange = cbChange(instance);
            }
          }, 0);
        }
      });

      if (readyCount >= instancesLen) {
        cbReady();
      } else {
        waitCount++;
        if (waitCount > makeState.MAX_WAIT_COUNT) {
          throw new Error('`state` can not become ' + states + '.');
        }
        timer = setTimeout(doFnc, 10);
      }
    }

    if (!Array.isArray(instances)) { instances = [instances]; }
    instancesLen = instances.length;

    if (!Array.isArray(states)) { states = [states]; }
    var statesLen = states.length;
    if (statesLen < instancesLen) { // Repeat last value
      var lastValue = states[statesLen - 1];
      for (var i = statesLen; i < instancesLen; i++) {
        states[i] = lastValue;
      }
    }

    doFnc();
  }

  makeState.MAX_WAIT_COUNT = 500;

  return {
    intervalExec: intervalExec,
    makeState: makeState
  };
})();
