describe('sync-mode', function() {
  'use strict';

  var window, utils, PlainOverlay, traceLog, pageDone,
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
      duration: 80
    });
  }

  describe('Normal build', function() {
    beforeAll(function(beforeDone) {
      loadPage('spec/common/page.html', function(pageWindow, pageDocument, pageBody, done) {
        window = pageWindow;
        utils = window.utils;
        PlainOverlay = window.PlainOverlay;
        traceLog = PlainOverlay.traceLog;
        overlay = initIns(PlainOverlay, pageDocument.getElementById('elm-plain'));
        pageDone = done;

        beforeDone();
      });
    });

    afterAll(function() {
      pageDone();
    });

    it('show(), hide()', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = function() {
            setTimeout(function() {
              setTimeout(function() { arrLog.push({type: 'time-3', state: overlay.state}); }, 0);
              overlay.hide();
              arrLog.push({type: 'time-2', state: overlay.state});
            }, 0);
          };
          hideListener = null;

          setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 0);

          traceLog.length = 0;
          overlay.show();
          arrLog.push({type: 'time-0', state: overlay.state});

          setTimeout(function() {
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

            expect(traceLog).toEqual([
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',
              '_id:' + overlay._id, '</show>',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>',

              // onShow -> hide()

              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',

              'state:STATE_HIDING',
              '_id:' + overlay._id, '</hide>',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

              '_id:' + overlay._id, '</finishHiding>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 240);
        }
      );
    });

    it('show(true), hide(true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = function() {
            setTimeout(function() {
              setTimeout(function() { arrLog.push({type: 'time-3', state: overlay.state}); }, 0);
              overlay.hide(true);
              arrLog.push({type: 'time-2', state: overlay.state});
            }, 0);
          };
          hideListener = null;

          setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 0);

          traceLog.length = 0;
          overlay.show(true);
          arrLog.push({type: 'time-0', state: overlay.state});

          setTimeout(function() {
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

            expect(traceLog).toEqual([
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>',

              '_id:' + overlay._id, '</show>',

              // onShow -> hide()

              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - show(), show()', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.show();
          overlay.show();

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',
              '_id:' + overlay._id, '</show>',

              // ======== 2
              '<show>', '_id:' + overlay._id, 'state:STATE_SHOWING', 'force:false',
              'CANCEL', '</show>',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>'
            ]);

            done();
          }, 120);
        }
      );
    });

    it('controls repeated calling - show(), show(true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.show();
          overlay.show(true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',
              '_id:' + overlay._id, '</show>',

              // ======== 2
              '<show>', '_id:' + overlay._id, 'state:STATE_SHOWING', 'force:true',

              'state:STATE_SHOWING',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>',

              '_id:' + overlay._id, '</show>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - show(true), show()', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.show(true);
          overlay.show();

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>',

              '_id:' + overlay._id, '</show>',

              // ======== 2
              '<show>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',
              'CANCEL', '</show>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - show(true), show(true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.show(true);
          overlay.show(true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>',

              '_id:' + overlay._id, '</show>',

              // ======== 2
              '<show>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
              'CANCEL', '</show>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - hide(), hide()', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide();
          overlay.hide();

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',

              'state:STATE_HIDING',
              '_id:' + overlay._id, '</hide>',

              // ======== 2
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:false',
              'CANCEL', '</hide>',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

              '_id:' + overlay._id, '</finishHiding>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 120);
        }
      );
    });

    it('controls repeated calling - hide(), hide(true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide();
          overlay.hide(true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',

              'state:STATE_HIDING',
              '_id:' + overlay._id, '</hide>',

              // ======== 2
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:true',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - hide(true), hide()', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide(true);
          overlay.hide();

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              // ======== 2
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:false',
              'CANCEL', '</hide>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - hide(true), hide(true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide(true);
          overlay.hide(true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              // ======== 2
              // Not canceled
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:true',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'ClearPrevTimer',
              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 40);
        }
      );
    });

  });

  describe('sync-mode', function() {
    beforeAll(function(beforeDone) {
      loadPage('spec/sync.html', function(pageWindow, pageDocument, pageBody, done) {
        window = pageWindow;
        utils = window.utils;
        PlainOverlay = window.PlainOverlay;
        traceLog = PlainOverlay.traceLog;
        overlay = initIns(PlainOverlay, pageDocument.getElementById('elm-plain'));
        pageDone = done;

        beforeDone();
      });
    });

    afterAll(function() {
      pageDone();
    });

    it('show(), hide()', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = function() {
            setTimeout(function() {
              setTimeout(function() { arrLog.push({type: 'time-3', state: overlay.state}); }, 0);
              overlay.hide();
              arrLog.push({type: 'time-2', state: overlay.state});
            }, 0);
          };
          hideListener = null;

          setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 0);

          traceLog.length = 0;
          overlay.show();
          arrLog.push({type: 'time-0', state: overlay.state});

          setTimeout(function() {
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

            expect(traceLog).toEqual([
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',
              '_id:' + overlay._id, '</show>',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>',

              // onShow -> hide()

              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false', 'sync:false',

              'state:STATE_HIDING',
              '_id:' + overlay._id, '</hide>',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING', 'sync:false',

              '_id:' + overlay._id, '</finishHiding>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 240);
        }
      );
    });

    it('show(true), hide(true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = function() {
            setTimeout(function() {
              setTimeout(function() { arrLog.push({type: 'time-3', state: overlay.state}); }, 0);
              overlay.hide(true);
              arrLog.push({type: 'time-2', state: overlay.state});
            }, 0);
          };
          hideListener = null;

          setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 0);

          traceLog.length = 0;
          overlay.show(true);
          arrLog.push({type: 'time-0', state: overlay.state});

          setTimeout(function() {
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

            expect(traceLog).toEqual([
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>',

              '_id:' + overlay._id, '</show>',

              // onShow -> hide()

              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true', 'sync:false',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING', 'sync:false',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('show(true), hide(true, true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = function() {
            setTimeout(function() {
              setTimeout(function() { arrLog.push({type: 'time-3', state: overlay.state}); }, 0);
              overlay.hide(true, true);
              arrLog.push({type: 'time-2', state: overlay.state});
            }, 0);
          };
          hideListener = null;

          setTimeout(function() { arrLog.push({type: 'time-1', state: overlay.state}); }, 0);

          traceLog.length = 0;
          overlay.show(true);
          arrLog.push({type: 'time-0', state: overlay.state});

          setTimeout(function() {
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

            expect(traceLog).toEqual([
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>',

              '_id:' + overlay._id, '</show>',

              // onShow -> hide()

              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true', 'sync:true',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING', 'sync:true',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - show(), show()', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.show();
          overlay.show();

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',
              '_id:' + overlay._id, '</show>',

              // ======== 2
              '<show>', '_id:' + overlay._id, 'state:STATE_SHOWING', 'force:false',
              'CANCEL', '</show>',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>'
            ]);

            done();
          }, 120);
        }
      );
    });

    it('controls repeated calling - show(), show(true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.show();
          overlay.show(true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',
              '_id:' + overlay._id, '</show>',

              // ======== 2
              '<show>', '_id:' + overlay._id, 'state:STATE_SHOWING', 'force:true',

              'state:STATE_SHOWING',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>',

              '_id:' + overlay._id, '</show>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - show(true), show()', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.show(true);
          overlay.show();

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>',

              '_id:' + overlay._id, '</show>',

              // ======== 2
              '<show>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',
              'CANCEL', '</show>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - show(true), show(true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.show(true);
          overlay.show(true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

              '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

              'state:STATE_SHOWING',

              '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay._id, '</finishShowing>',

              '_id:' + overlay._id, '</show>',

              // ======== 2
              '<show>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
              'CANCEL', '</show>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - hide(), hide()', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide();
          overlay.hide();

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',
              'sync:false',

              'state:STATE_HIDING',
              '_id:' + overlay._id, '</hide>',

              // ======== 2
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:false',
              'sync:false',
              'CANCEL', '</hide>',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'sync:false',

              '_id:' + overlay._id, '</finishHiding>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 120);
        }
      );
    });

    it('controls repeated calling - hide(), hide(true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide();
          overlay.hide(true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',
              'sync:false',

              'state:STATE_HIDING',
              '_id:' + overlay._id, '</hide>',

              // ======== 2
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:true',
              'sync:false',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'sync:false',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - hide(), hide(true, true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide();
          overlay.hide(true, true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',
              'sync:false',

              'state:STATE_HIDING',
              '_id:' + overlay._id, '</hide>',

              // ======== 2
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:true',
              'sync:true',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'sync:true',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - hide(true), hide()', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide(true);
          overlay.hide();

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
              'sync:false',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'sync:false',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              // ======== 2
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:false',
              'sync:false',
              'CANCEL', '</hide>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - hide(true), hide(true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide(true);
          overlay.hide(true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
              'sync:false',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'sync:false',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              // ======== 2
              // Not canceled
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:true',
              'sync:false',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'sync:false',
              'ClearPrevTimer',
              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - hide(true), hide(true, true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide(true);
          overlay.hide(true, true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
              'sync:false',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'sync:false',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              // ======== 2
              // Not canceled
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:true',
              'sync:true',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'sync:true',
              'ClearPrevTimer',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - hide(true, true), hide()', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide(true, true);
          overlay.hide();

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
              'sync:true',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'sync:true',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              // ======== 2
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',
              'sync:false',
              'CANCEL', '</hide>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - hide(true, true), hide(true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide(true, true);
          overlay.hide(true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
              'sync:true',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'sync:true',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              // ======== 2
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',
              'sync:false',
              'CANCEL', '</hide>'
            ]);

            done();
          }, 40);
        }
      );
    });

    it('controls repeated calling - hide(true, true), hide(true, true)', function(done) {
      utils.makeState(overlay,
        PlainOverlay.STATE_SHOWN,
        function(overlay) { overlay.show(true); },
        function() {
          arrLog = [];
          showListener = hideListener = null;
          traceLog.length = 0;

          overlay.hide(true, true);
          overlay.hide(true, true);

          setTimeout(function() {

            expect(traceLog).toEqual([
              // ======== 1
              '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
              'sync:true',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'sync:true',

              '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

              '_id:' + overlay._id, '</finishHiding.restoreAndFinish>',

              '_id:' + overlay._id, '</finishHiding>',

              '_id:' + overlay._id, '</hide>',

              // ======== 2
              '<hide>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',
              'sync:true',
              'CANCEL', '</hide>'
            ]);

            done();
          }, 40);
        }
      );
    });

  });
});
