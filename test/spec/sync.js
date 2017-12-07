
describe('sync-mode', function() {
  'use strict';

  var window, PlainOverlay, traceLog, pageDone,
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
      duration: 100
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

        traceLog.length = 0;
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

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlay._id, '</show>',

            '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlay._id, '</finishShowing>',

            // onShow -> hide()

            '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',
            '_id:' + overlay._id, '</hide>',

            '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-hide', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '_id:' + overlay._id, '</finishHiding>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

            '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
          ]);

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

        traceLog.length = 0;
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

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // add(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-show',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',

            '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlay._id, '</finishShowing>',

            '_id:' + overlay._id, '</show>',

            // onShow -> hide()

            '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',

            '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '_id:' + overlay._id, '</finishHiding>',

            '_id:' + overlay._id, '</hide>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

            '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 100);

      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - show(), show()', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = hideListener = null;
        traceLog.length = 0;

        overlay.show();
        overlay.show();

        window.setTimeout(function() {

          expect(traceLog).toEqual([
            // ======== 1
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // remove(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
        }, 300);

      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - show(), show(true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = hideListener = null;
        traceLog.length = 0;

        overlay.show();
        overlay.show(true);

        window.setTimeout(function() {

          expect(traceLog).toEqual([
            // ======== 1
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // remove(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlay._id, '</show>',

            // ======== 2
            '<show>', '_id:' + overlay._id, 'state:STATE_SHOWING', 'force:true',

            // add(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show,plainoverlay-force',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',

            '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlay._id, '</finishShowing>',

            '_id:' + overlay._id, '</show>'
          ]);

          done();
        }, 300);

      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - show(true), show()', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = hideListener = null;
        traceLog.length = 0;

        overlay.show(true);
        overlay.show();

        window.setTimeout(function() {

          expect(traceLog).toEqual([
            // ======== 1
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-show',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
        }, 300);

      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - show(true), show(true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = hideListener = null;
        traceLog.length = 0;

        overlay.show(true);
        overlay.show(true);

        window.setTimeout(function() {

          expect(traceLog).toEqual([
            // ======== 1
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-show',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
        }, 300);

      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(), hide()', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide();
            overlay.hide();

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',

                // remove(STYLE_CLASS_FORCE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',
                '_id:' + overlay._id, '</hide>',

                // ======== 2
                '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:false',
                'CANCEL', '</hide>',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-hide', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                '_id:' + overlay._id, '</finishHiding>',

                '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'state:STATE_HIDDEN', 'focusListener:ADD',

                '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
                'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

                '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
              ]);

              done();
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(), hide(true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide();
            overlay.hide(true);

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',

                // remove(STYLE_CLASS_FORCE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',
                '_id:' + overlay._id, '</hide>',

                // ======== 2
                '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:true',

                // add(STYLE_CLASS_FORCE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
                'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                '_id:' + overlay._id, '</finishHiding>',

                '_id:' + overlay._id, '</hide>',

                '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'state:STATE_HIDDEN', 'focusListener:ADD',

                '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
                'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

                '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
              ]);

              done();
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(true), hide()', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide(true);
            overlay.hide();

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
                'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(true), hide(true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide(true);
            overlay.hide(true);

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
                'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

  });

  describe('sync-mode', function() {
    beforeAll(function(beforeDone) {
      loadPage('spec/sync.html', function(pageWindow, pageDocument, pageBody, done) {
        window = pageWindow;
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

        traceLog.length = 0;
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

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlay._id, '</show>',

            '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlay._id, '</finishShowing>',

            // onShow -> hide()

            '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false', 'sync:false',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',
            '_id:' + overlay._id, '</hide>',

            '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING', 'sync:false',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-hide', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '_id:' + overlay._id, '</finishHiding>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

            '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
          ]);

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

        traceLog.length = 0;
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

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // add(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-show',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',

            '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlay._id, '</finishShowing>',

            '_id:' + overlay._id, '</show>',

            // onShow -> hide()

            '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true', 'sync:false',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',

            '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING', 'sync:false',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '_id:' + overlay._id, '</finishHiding>',

            '_id:' + overlay._id, '</hide>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

            '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
          ]);

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

        traceLog.length = 0;
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

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-show',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',

            '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlay._id, '</finishShowing>',

            '_id:' + overlay._id, '</show>',

            // onShow -> hide()

            '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true', 'sync:true',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',

            '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING', 'sync:true',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

            '_id:' + overlay._id, '</finishHiding.restoreAndFinish>',

            '_id:' + overlay._id, '</finishHiding>',

            '_id:' + overlay._id, '</hide>'
          ]);

          done();
        }, 100);

      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - show(), show()', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = hideListener = null;
        traceLog.length = 0;

        overlay.show();
        overlay.show();

        window.setTimeout(function() {

          expect(traceLog).toEqual([
            // ======== 1
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // remove(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
        }, 300);

      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - show(), show(true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = hideListener = null;
        traceLog.length = 0;

        overlay.show();
        overlay.show(true);

        window.setTimeout(function() {

          expect(traceLog).toEqual([
            // ======== 1
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // remove(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlay._id, '</show>',

            // ======== 2
            '<show>', '_id:' + overlay._id, 'state:STATE_SHOWING', 'force:true',

            // add(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show,plainoverlay-force',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',

            '<finishShowing>', '_id:' + overlay._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlay._id, '</finishShowing>',

            '_id:' + overlay._id, '</show>'
          ]);

          done();
        }, 300);

      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - show(true), show()', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = hideListener = null;
        traceLog.length = 0;

        overlay.show(true);
        overlay.show();

        window.setTimeout(function() {

          expect(traceLog).toEqual([
            // ======== 1
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-show',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
        }, 300);

      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - show(true), show(true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = hideListener = null;
        traceLog.length = 0;

        overlay.show(true);
        overlay.show(true);

        window.setTimeout(function() {

          expect(traceLog).toEqual([
            // ======== 1
            '<show>', '_id:' + overlay._id, 'state:STATE_HIDDEN', 'force:true',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlay._id, '</avoidSelect>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-show',
            'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
        }, 300);

      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(), hide()', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide();
            overlay.hide();

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',
                'sync:false',

                // remove(STYLE_CLASS_FORCE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',
                '_id:' + overlay._id, '</hide>',

                // ======== 2
                '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:false',
                'sync:false',
                'CANCEL', '</hide>',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'sync:false',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-hide', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                '_id:' + overlay._id, '</finishHiding>',

                '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'state:STATE_HIDDEN', 'focusListener:ADD',

                '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
                'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

                '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
              ]);

              done();
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(), hide(true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide();
            overlay.hide(true);

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',
                'sync:false',

                // remove(STYLE_CLASS_FORCE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',
                '_id:' + overlay._id, '</hide>',

                // ======== 2
                '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:true',
                'sync:false',

                // add(STYLE_CLASS_FORCE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'sync:false',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
                'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                '_id:' + overlay._id, '</finishHiding>',

                '_id:' + overlay._id, '</hide>',

                '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'state:STATE_HIDDEN', 'focusListener:ADD',

                '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
                'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

                '_id:' + overlay._id, '</finishHiding.restoreAndFinish>'
              ]);

              done();
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(), hide(true, true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide();
            overlay.hide(true, true);

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:false',
                'sync:false',

                // remove(STYLE_CLASS_FORCE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',
                '_id:' + overlay._id, '</hide>',

                // ======== 2
                '<hide>', '_id:' + overlay._id, 'state:STATE_HIDING', 'force:true',
                'sync:true',

                // add(STYLE_CLASS_FORCE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'sync:true',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
                'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                '<finishHiding.restoreAndFinish>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'state:STATE_HIDDEN', 'focusListener:ADD',

                '<restoreScroll>', '_id:' + overlay._id, 'state:STATE_HIDDEN',
                'DONE:ALL', '_id:' + overlay._id, '</restoreScroll>',

                '_id:' + overlay._id, '</finishHiding.restoreAndFinish>',

                '_id:' + overlay._id, '</finishHiding>',

                '_id:' + overlay._id, '</hide>'
              ]);

              done();
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(true), hide()', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide(true);
            overlay.hide();

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
                'sync:false',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'sync:false',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
                'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(true), hide(true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide(true);
            overlay.hide(true);

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
                'sync:false',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'sync:false',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
                'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(true), hide(true, true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide(true);
            overlay.hide(true, true);

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
                'sync:false',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'sync:false',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
                'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(true, true), hide()', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide(true, true);
            overlay.hide();

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
                'sync:true',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'sync:true',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
                'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(true, true), hide(true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide(true, true);
            overlay.hide(true);

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
                'sync:true',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'sync:true',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
                'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

    it('controls repeated calling - hide(true, true), hide(true, true)', function(done) {
      hideAndDo(function() {
        arrLog = [];
        showListener = function() {
          window.setTimeout(function() {
            traceLog.length = 0;

            overlay.hide(true, true);
            overlay.hide(true, true);

            window.setTimeout(function() {

              expect(traceLog).toEqual([
                // ======== 1
                '<hide>', '_id:' + overlay._id, 'state:STATE_SHOWN', 'force:true',
                'sync:true',

                // remove(STYLE_CLASS_SHOW)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                'state:STATE_HIDING',

                '<finishHiding>', '_id:' + overlay._id, 'state:STATE_HIDING',
                'sync:true',

                // add(STYLE_CLASS_HIDE)
                '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
                'target.id:elm-plain',
                'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

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
            }, 300);
          }, 10);
        };
        hideListener = null;
        overlay.show(true);
      }, overlay, window, PlainOverlay);
    });

  });
});
