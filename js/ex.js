/* exported bindToggleButton */

function bindToggleButton(overlay, button, limitTime, initShow) {
  'use strict';

  var isShown, timer;
  if (typeof limitTime !== 'number') { limitTime = 10000; }

  function toggle() {
    clearTimeout(timer);
    if ((isShown = !isShown)) {
      overlay.show();
      button.textContent = 'HIDE';
      if (limitTime) { timer = setTimeout(toggle, limitTime); }
    } else {
      overlay.hide();
      button.textContent = 'SHOW';
    }
  }

  button.addEventListener('click', toggle, false);
  if (initShow) { toggle(); }

  return toggle;
}
