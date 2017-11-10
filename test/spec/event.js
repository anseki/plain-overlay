
describe('event', function() {
  'use strict';

  var window, document, PlainOverlay, pageDone,
    overlay, arrLog, returnValue, showListener, hideListener;

  function hideAndDo(fnc) {
    var timer, methodCalled;

    function doFnc() {
      clearTimeout(timer);
      if (overlay.state === PlainOverlay.STATE_HIDDEN) {
        fnc();
      } else {
        if (!methodCalled) {
          returnValue = true;
          hideListener = null;
          overlay.hide(true);
          methodCalled = true;
        }
        timer = setTimeout(doFnc, 10);
      }
    }

    doFnc();
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/common/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      overlay = new PlainOverlay(document.getElementById('elm-plain'), {
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
          return returnValue;
        },
        onBeforeHide: function() {
          arrLog.push({type: 'onBeforeHide', state: this.state});
          return returnValue;
        },
        duration: 200
      });
      pageDone = done;

      beforeDone();
    });
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainOverlay.limit).toBe(!!self.top.LIMIT);
  });

  it('Sequence', function(done) {
    hideAndDo(function() {
      arrLog = [];
      returnValue = true;
      showListener = function() { overlay.hide(); };
      hideListener = function() {
        expect(arrLog.length).toBe(6);
        expect(arrLog[0].type).toBe('onBeforeShow');
        expect(arrLog[0].state).toBe(PlainOverlay.STATE_HIDDEN);
        expect(arrLog[1].type).toBe('time-0');
        expect(arrLog[1].state).toBe(PlainOverlay.STATE_SHOWING);
        expect(arrLog[2].type).toBe('onShow');
        expect(arrLog[2].state).toBe(PlainOverlay.STATE_SHOWN);
        expect(arrLog[3].type).toBe('onBeforeHide');
        expect(arrLog[3].state).toBe(PlainOverlay.STATE_SHOWN);
        expect(arrLog[4].type).toBe('time-1');
        expect(arrLog[4].state).toBe(PlainOverlay.STATE_HIDING);
        expect(arrLog[5].type).toBe('onHide');
        expect(arrLog[5].state).toBe(PlainOverlay.STATE_HIDDEN);

        done();
      };

      setTimeout(function() { arrLog.push({type: 'time-0', state: overlay.state}); }, 100);
      setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 300);

      overlay.show();
    });
  });

  it('onBeforeShow cancels the showing', function(done) {
    hideAndDo(function() {
      arrLog = [];
      returnValue = false;
      showListener = function() { overlay.hide(); };
      hideListener = function() {};

      setTimeout(function() { arrLog.push({type: 'time-0', state: overlay.state}); }, 100);
      setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 300);

      setTimeout(function() {
        expect(arrLog.length).toBe(3);
        expect(arrLog[0].type).toBe('onBeforeShow');
        expect(arrLog[0].state).toBe(PlainOverlay.STATE_HIDDEN);
        expect(arrLog[1].type).toBe('time-0');
        expect(arrLog[1].state).toBe(PlainOverlay.STATE_HIDDEN); // Not changed
        expect(arrLog[2].type).toBe('time-1');
        expect(arrLog[2].state).toBe(PlainOverlay.STATE_HIDDEN); // Not changed

        done();
      }, 450);

      overlay.show();
    });
  });

  it('onBeforeHide cancels the hiding', function(done) {
    hideAndDo(function() {
      arrLog = [];
      returnValue = true;
      showListener = function() {
        returnValue = false;
        overlay.hide();
      };
      hideListener = function() {};

      setTimeout(function() { arrLog.push({type: 'time-0', state: overlay.state}); }, 100);
      setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 300);

      setTimeout(function() {
        expect(arrLog.length).toBe(5);
        expect(arrLog[0].type).toBe('onBeforeShow');
        expect(arrLog[0].state).toBe(PlainOverlay.STATE_HIDDEN);
        expect(arrLog[1].type).toBe('time-0');
        expect(arrLog[1].state).toBe(PlainOverlay.STATE_SHOWING);
        expect(arrLog[2].type).toBe('onShow');
        expect(arrLog[2].state).toBe(PlainOverlay.STATE_SHOWN);
        expect(arrLog[3].type).toBe('onBeforeHide');
        expect(arrLog[3].state).toBe(PlainOverlay.STATE_SHOWN);
        expect(arrLog[4].type).toBe('time-1');
        expect(arrLog[4].state).toBe(PlainOverlay.STATE_SHOWN); // Not changed

        done();
      }, 450);

      overlay.show();
    });
  });

  it('onBeforeShow is called only once', function(done) {
    hideAndDo(function() {
      arrLog = [];
      returnValue = true;
      showListener = function() { overlay.hide(); };
      hideListener = function() {
        expect(arrLog.length).toBe(8);
        expect(arrLog[0].type).toBe('onBeforeShow');
        expect(arrLog[0].state).toBe(PlainOverlay.STATE_HIDDEN);
        expect(arrLog[1].type).toBe('time-0-a');
        expect(arrLog[1].state).toBe(PlainOverlay.STATE_SHOWING);
        expect(arrLog[2].type).toBe('time-0-b');
        expect(arrLog[2].state).toBe(PlainOverlay.STATE_SHOWING);
        expect(arrLog[3].type).toBe('time-0-c');
        expect(arrLog[3].state).toBe(PlainOverlay.STATE_SHOWING);
        expect(arrLog[4].type).toBe('onShow');
        expect(arrLog[4].state).toBe(PlainOverlay.STATE_SHOWN);
        expect(arrLog[5].type).toBe('onBeforeHide');
        expect(arrLog[5].state).toBe(PlainOverlay.STATE_SHOWN);
        expect(arrLog[6].type).toBe('time-1');
        expect(arrLog[6].state).toBe(PlainOverlay.STATE_HIDING);
        expect(arrLog[7].type).toBe('onHide');
        expect(arrLog[7].state).toBe(PlainOverlay.STATE_HIDDEN);

        done();
      };

      setTimeout(function() {
        arrLog.push({type: 'time-0-a', state: overlay.state});
        overlay.show();
      }, 100);
      setTimeout(function() {
        arrLog.push({type: 'time-0-b', state: overlay.state});
        overlay.show();
      }, 110);
      setTimeout(function() {
        arrLog.push({type: 'time-0-c', state: overlay.state});
        overlay.show();
      }, 120);
      setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 300);

      overlay.show();
    });
  });

  it('onBeforeHide is called only once', function(done) {
    hideAndDo(function() {
      arrLog = [];
      returnValue = true;
      showListener = function() { overlay.hide(); };
      hideListener = function() {
        expect(arrLog.length).toBe(8);
        expect(arrLog[0].type).toBe('onBeforeShow');
        expect(arrLog[0].state).toBe(PlainOverlay.STATE_HIDDEN);
        expect(arrLog[1].type).toBe('time-0');
        expect(arrLog[1].state).toBe(PlainOverlay.STATE_SHOWING);
        expect(arrLog[2].type).toBe('onShow');
        expect(arrLog[2].state).toBe(PlainOverlay.STATE_SHOWN);
        expect(arrLog[3].type).toBe('onBeforeHide');
        expect(arrLog[3].state).toBe(PlainOverlay.STATE_SHOWN);
        expect(arrLog[4].type).toBe('time-1-a');
        expect(arrLog[4].state).toBe(PlainOverlay.STATE_HIDING);
        expect(arrLog[5].type).toBe('time-1-b');
        expect(arrLog[5].state).toBe(PlainOverlay.STATE_HIDING);
        expect(arrLog[6].type).toBe('time-1-c');
        expect(arrLog[6].state).toBe(PlainOverlay.STATE_HIDING);
        expect(arrLog[7].type).toBe('onHide');
        expect(arrLog[7].state).toBe(PlainOverlay.STATE_HIDDEN);

        done();
      };

      setTimeout(function() { arrLog.push({type: 'time-0', state: overlay.state}); }, 100);
      setTimeout(function() {
        arrLog.push({type: 'time-1-a', state: overlay.state});
        overlay.hide();
      }, 300);
      setTimeout(function() {
        arrLog.push({type: 'time-1-b', state: overlay.state});
        overlay.hide();
      }, 310);
      setTimeout(function() {
        arrLog.push({type: 'time-1-c', state: overlay.state});
        overlay.hide();
      }, 320);

      overlay.show();
    });
  });

});
