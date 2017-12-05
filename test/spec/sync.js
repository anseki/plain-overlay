
describe('sync-mode', function() {
  'use strict';

  var window, PlainOverlay, pageDone,
    overlay, arrLog, showListener, hideListener;

  function initIns(PlainOverlay, element) {
    return new PlainOverlay(element, {
      onShow: function() {
        arrLog.push({type: 'onShow', state: this.state});
        if (showListener) { showListener(); }
      },
      onHide: function() {
        arrLog.push({type: 'onHide', state: this.state});
        if (hideListener) { hideListener(); }
      },
      onBeforeShow: function() {
        arrLog.push({type: 'onBeforeShow', state: this.state});
      },
      onBeforeHide: function() {
        arrLog.push({type: 'onBeforeHide', state: this.state});
      },
      duration: 200
    });
  }

  function hideAndDo(fnc, overlay, window, PlainOverlay) {
    var timer, methodCalled;

    function doFnc() {
      window.clearTimeout(timer);
      if (overlay.state === PlainOverlay.STATE_HIDDEN) {
        fnc();
      } else {
        if (!methodCalled) {
          hideListener = null;
          overlay.hide(true);
          methodCalled = true;
        }
        timer = window.setTimeout(doFnc, 10);
      }
    }

    doFnc();
  }

  describe('Normal build', function() {
    beforeAll(function(beforeDone) {
      loadPage('spec/common/page.html', function(pageWindow, pageDocument, pageBody, done) {
        window = pageWindow;
        PlainOverlay = window.PlainOverlay;
        overlay = initIns(PlainOverlay, pageDocument.getElementById('elm-plain'));
        pageDone = done;

        beforeDone();
      });
    });

    afterAll(function() {
      pageDone();
    });

    it('show(), hide()', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            window.setTimeout(function() { arrLog.push({type: 'time-3', state: overlay.state}); }, 0);
            overlay.hide();
            arrLog.push({type: 'time-2', state: overlay.state});
          }, 0);
        };
        hideListener = null;

        window.setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 0);
        overlay.show();
        arrLog.push({type: 'time-0', state: overlay.state});

        window.setTimeout(function() {
          expect(arrLog.length).toBe(8);
          expect(arrLog[0].type).toBe('onBeforeShow');
          expect(arrLog[0].state).toBe(PlainOverlay.STATE_HIDDEN);
          // .show() done
          expect(arrLog[1].type).toBe('time-0');
          expect(arrLog[1].state).toBe(PlainOverlay.STATE_SHOWING);
          expect(arrLog[2].type).toBe('time-1');
          expect(arrLog[2].state).toBe(PlainOverlay.STATE_SHOWING);
          expect(arrLog[3].type).toBe('onShow');
          expect(arrLog[3].state).toBe(PlainOverlay.STATE_SHOWN);
          // showListener starts
          expect(arrLog[4].type).toBe('onBeforeHide');
          expect(arrLog[4].state).toBe(PlainOverlay.STATE_SHOWN);
          // .hide() done
          expect(arrLog[5].type).toBe('time-2');
          expect(arrLog[5].state).toBe(PlainOverlay.STATE_HIDING);
          expect(arrLog[6].type).toBe('time-3');
          expect(arrLog[6].state).toBe(PlainOverlay.STATE_HIDING);
          expect(arrLog[7].type).toBe('onHide');
          expect(arrLog[7].state).toBe(PlainOverlay.STATE_HIDDEN);

          done();
        }, 500);

      }, overlay, window, PlainOverlay);
    });

    it('show(true), hide(true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            window.setTimeout(function() { arrLog.push({type: 'time-3', state: overlay.state}); }, 0);
            overlay.hide(true);
            arrLog.push({type: 'time-2', state: overlay.state});
          }, 0);
        };
        hideListener = null;

        window.setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 0);
        overlay.show(true);
        arrLog.push({type: 'time-0', state: overlay.state});

        window.setTimeout(function() {
          expect(arrLog.length).toBe(8);
          expect(arrLog[0].type).toBe('onBeforeShow');
          expect(arrLog[0].state).toBe(PlainOverlay.STATE_HIDDEN);
          expect(arrLog[1].type).toBe('onShow'); // This is called in show().
          expect(arrLog[1].state).toBe(PlainOverlay.STATE_SHOWN);
          // .show() done
          expect(arrLog[2].type).toBe('time-0');
          expect(arrLog[2].state).toBe(PlainOverlay.STATE_SHOWN);
          expect(arrLog[3].type).toBe('time-1');
          expect(arrLog[3].state).toBe(PlainOverlay.STATE_SHOWN);
          // showListener starts
          expect(arrLog[4].type).toBe('onBeforeHide');
          expect(arrLog[4].state).toBe(PlainOverlay.STATE_SHOWN);
          // .hide() done
          expect(arrLog[5].type).toBe('time-2');
          expect(arrLog[5].state).toBe(PlainOverlay.STATE_HIDING);
          expect(arrLog[6].type).toBe('time-3');
          expect(arrLog[6].state).toBe(PlainOverlay.STATE_HIDING);
          expect(arrLog[7].type).toBe('onHide'); // This is called with async-mode.
          expect(arrLog[7].state).toBe(PlainOverlay.STATE_HIDDEN);

          done();
        }, 100);

      }, overlay, window, PlainOverlay);
    });

  });

  describe('sync-mode', function() {
    beforeAll(function(beforeDone) {
      loadPage('spec/sync.html', function(pageWindow, pageDocument, pageBody, done) {
        window = pageWindow;
        PlainOverlay = window.PlainOverlay;
        overlay = initIns(PlainOverlay, pageDocument.getElementById('elm-plain'));
        pageDone = done;

        beforeDone();
      });
    });

    afterAll(function() {
      pageDone();
    });

    it('show(), hide()', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            window.setTimeout(function() { arrLog.push({type: 'time-3', state: overlay.state}); }, 0);
            overlay.hide();
            arrLog.push({type: 'time-2', state: overlay.state});
          }, 0);
        };
        hideListener = null;

        window.setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 0);
        overlay.show();
        arrLog.push({type: 'time-0', state: overlay.state});

        window.setTimeout(function() {
          expect(arrLog.length).toBe(8);
          expect(arrLog[0].type).toBe('onBeforeShow');
          expect(arrLog[0].state).toBe(PlainOverlay.STATE_HIDDEN);
          // .show() done
          expect(arrLog[1].type).toBe('time-0');
          expect(arrLog[1].state).toBe(PlainOverlay.STATE_SHOWING);
          expect(arrLog[2].type).toBe('time-1');
          expect(arrLog[2].state).toBe(PlainOverlay.STATE_SHOWING);
          expect(arrLog[3].type).toBe('onShow');
          expect(arrLog[3].state).toBe(PlainOverlay.STATE_SHOWN);
          // showListener starts
          expect(arrLog[4].type).toBe('onBeforeHide');
          expect(arrLog[4].state).toBe(PlainOverlay.STATE_SHOWN);
          // .hide() done
          expect(arrLog[5].type).toBe('time-2');
          expect(arrLog[5].state).toBe(PlainOverlay.STATE_HIDING);
          expect(arrLog[6].type).toBe('time-3');
          expect(arrLog[6].state).toBe(PlainOverlay.STATE_HIDING);
          expect(arrLog[7].type).toBe('onHide');
          expect(arrLog[7].state).toBe(PlainOverlay.STATE_HIDDEN);

          done();
        }, 500);

      }, overlay, window, PlainOverlay);
    });

    it('show(true), hide(true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            window.setTimeout(function() { arrLog.push({type: 'time-3', state: overlay.state}); }, 0);
            overlay.hide(true);
            arrLog.push({type: 'time-2', state: overlay.state});
          }, 0);
        };
        hideListener = null;

        window.setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 0);
        overlay.show(true);
        arrLog.push({type: 'time-0', state: overlay.state});

        window.setTimeout(function() {
          expect(arrLog.length).toBe(8);
          expect(arrLog[0].type).toBe('onBeforeShow');
          expect(arrLog[0].state).toBe(PlainOverlay.STATE_HIDDEN);
          expect(arrLog[1].type).toBe('onShow'); // This is called in show().
          expect(arrLog[1].state).toBe(PlainOverlay.STATE_SHOWN);
          // .show() done
          expect(arrLog[2].type).toBe('time-0');
          expect(arrLog[2].state).toBe(PlainOverlay.STATE_SHOWN);
          expect(arrLog[3].type).toBe('time-1');
          expect(arrLog[3].state).toBe(PlainOverlay.STATE_SHOWN);
          // showListener starts
          expect(arrLog[4].type).toBe('onBeforeHide');
          expect(arrLog[4].state).toBe(PlainOverlay.STATE_SHOWN);
          // .hide() done
          expect(arrLog[5].type).toBe('time-2');
          expect(arrLog[5].state).toBe(PlainOverlay.STATE_HIDING);
          expect(arrLog[6].type).toBe('time-3');
          expect(arrLog[6].state).toBe(PlainOverlay.STATE_HIDING);
          expect(arrLog[7].type).toBe('onHide'); // This is called with async-mode.
          expect(arrLog[7].state).toBe(PlainOverlay.STATE_HIDDEN);

          done();
        }, 100);

      }, overlay, window, PlainOverlay);
    });

    it('show(true), hide(true, true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            window.setTimeout(function() { arrLog.push({type: 'time-3', state: overlay.state}); }, 0);
            overlay.hide(true, true);
            arrLog.push({type: 'time-2', state: overlay.state});
          }, 0);
        };
        hideListener = null;

        window.setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 0);
        overlay.show(true);
        arrLog.push({type: 'time-0', state: overlay.state});

        window.setTimeout(function() {
          expect(arrLog.length).toBe(8);
          expect(arrLog[0].type).toBe('onBeforeShow');
          expect(arrLog[0].state).toBe(PlainOverlay.STATE_HIDDEN);
          expect(arrLog[1].type).toBe('onShow'); // This is called in show().
          expect(arrLog[1].state).toBe(PlainOverlay.STATE_SHOWN);
          // .show() done
          expect(arrLog[2].type).toBe('time-0');
          expect(arrLog[2].state).toBe(PlainOverlay.STATE_SHOWN);
          expect(arrLog[3].type).toBe('time-1');
          expect(arrLog[3].state).toBe(PlainOverlay.STATE_SHOWN);
          // showListener starts
          expect(arrLog[4].type).toBe('onBeforeHide');
          expect(arrLog[4].state).toBe(PlainOverlay.STATE_SHOWN);
          expect(arrLog[5].type).toBe('onHide'); // This is called in hide() with async-mode.
          expect(arrLog[5].state).toBe(PlainOverlay.STATE_HIDDEN);
          // .hide() done
          expect(arrLog[6].type).toBe('time-2');
          expect(arrLog[6].state).toBe(PlainOverlay.STATE_HIDDEN);
          expect(arrLog[7].type).toBe('time-3');
          expect(arrLog[7].state).toBe(PlainOverlay.STATE_HIDDEN);

          done();
        }, 100);

      }, overlay, window, PlainOverlay);
    });

  });
});
