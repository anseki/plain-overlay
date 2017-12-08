
describe('forceEvent', function() {
  'use strict';

  var window, document, PlainOverlay, traceLog, pageDone,
    overlay1, overlay2;

  function hideAndDo(overlay, fnc) {
    var timer, methodCalled;

    function doFnc() {
      clearTimeout(timer);
      if (overlay.state === PlainOverlay.STATE_HIDDEN) {
        // Init
        window.mClassList(window.insProps[overlay._id].elmOverlay).remove('plainoverlay-force');
        fnc();
      } else {
        if (!methodCalled) {
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
      traceLog = PlainOverlay.traceLog;
      pageDone = done;

      overlay1 = new PlainOverlay(document.getElementById('elm-plain'), {duration: 100});
      overlay2 = new PlainOverlay(document.getElementById('elm-plain2'), {duration: 150});

      beforeDone();
    });
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainOverlay.limit).toBe(!!self.top.LIMIT);
  });

  it('Normal event', function(done) {
    overlay1.onShow = overlay1.onHide = null;
    hideAndDo(overlay1, function() {
      PlainOverlay.forceEvent = false;
      overlay1.onShow = function() { setTimeout(function() { overlay1.hide(); }, 0); };
      overlay1.onHide = function() {
        setTimeout(function() {
          expect(traceLog).toEqual([
            '<show>', '_id:' + overlay1._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE) - Canceled by `PlainOverlay.forceEvent:false`
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay1._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay1._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay1._id, 'state:STATE_HIDDEN',
            'NoRange',
            'NoSelection', '_id:' + overlay1._id, '</avoidSelect>',

            // add(STYLE_CLASS_SHOW) - Canceled by `PlainOverlay.forceEvent:false`
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlay1._id, '</show>',

            '<finishShowing>', '_id:' + overlay1._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlay1._id, '</finishShowing>',

            // onShow -> hide()

            '<hide>', '_id:' + overlay1._id, 'state:STATE_SHOWN', 'force:false',

            // remove(STYLE_CLASS_SHOW) - Canceled by `PlainOverlay.forceEvent:false`
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',
            '_id:' + overlay1._id, '</hide>',

            '<finishHiding>', '_id:' + overlay1._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE) - Canceled by `PlainOverlay.forceEvent:false`
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-hide', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '_id:' + overlay1._id, '</finishHiding>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlay1._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlay1._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlay1._id, '</restoreScroll>',

            '_id:' + overlay1._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 0);
      };

      traceLog.length = 0;
      overlay1.show();
    });
  });

  it('show() and hide()', function(done) {
    overlay2.onShow = overlay2.onHide = null;
    hideAndDo(overlay2, function() {
      PlainOverlay.forceEvent = true;
      overlay2.onShow = function() { setTimeout(function() { overlay2.hide(); }, 0); };
      overlay2.onHide = function() {
        setTimeout(function() {
          expect(traceLog).toEqual([
            '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
            'TriggerClassNotChanged', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay2._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'NoRange',
            'NoSelection', '_id:' + overlay2._id, '</avoidSelect>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain2',
            '<initEvent>', 'target.id:elm-plain2', 'duration:150', '</initEvent>',
            '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlay2._id, '</show>',

            '<fireEvent>', 'target.id:elm-plain2',

            '<finishShowing>', '_id:' + overlay2._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlay2._id, '</finishShowing>',

            '</fireEvent>',

            // onShow -> hide()

            '<hide>', '_id:' + overlay2._id, 'state:STATE_SHOWN', 'force:false',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
            '<initEvent>', 'target.id:elm-plain2', 'duration:150', '</initEvent>',
            '</mClassList.hookApply>',

            'state:STATE_HIDING',
            '_id:' + overlay2._id, '</hide>',

            '<fireEvent>', 'target.id:elm-plain2',

            '<finishHiding>', '_id:' + overlay2._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-hide', 'target.id:elm-plain2',
            'TriggerClassNotChanged', 'CANCEL', '</mClassList.hookApply>',

            '_id:' + overlay2._id, '</finishHiding>',

            '</fireEvent>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlay2._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlay2._id, '</restoreScroll>',

            '_id:' + overlay2._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 0);
      };

      traceLog.length = 0;
      overlay2.show();
    });
  });

  it('show() -> hide()', function(done) {
    overlay2.onShow = overlay2.onHide = null;
    hideAndDo(overlay2, function() {
      PlainOverlay.forceEvent = true;
      overlay2.onHide = function() {
        setTimeout(function() {
          expect(traceLog).toEqual([
            '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
            'TriggerClassNotChanged', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay2._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'NoRange',
            'NoSelection', '_id:' + overlay2._id, '</avoidSelect>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain2',
            '<initEvent>', 'target.id:elm-plain2', 'duration:150', '</initEvent>',
            '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlay2._id, '</show>',

            // hide()

            '<hide>', '_id:' + overlay2._id, 'state:STATE_SHOWING', 'force:false',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
            '<initEvent>', 'target.id:elm-plain2', 'duration:150',
            'ClearPrevEvent', // event by add(STYLE_CLASS_SHOW)
            '</initEvent>',
            '</mClassList.hookApply>',

            'state:STATE_HIDING',
            '_id:' + overlay2._id, '</hide>',

            '<fireEvent>', 'target.id:elm-plain2',

            '<finishHiding>', '_id:' + overlay2._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-hide', 'target.id:elm-plain2',
            'TriggerClassNotChanged', 'CANCEL', '</mClassList.hookApply>',

            '_id:' + overlay2._id, '</finishHiding>',

            '</fireEvent>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlay2._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlay2._id, '</restoreScroll>',

            '_id:' + overlay2._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 0);
      };

      traceLog.length = 0;
      overlay2.show();
      setTimeout(function() { overlay2.hide(); }, 80);
    });
  });

  it('show(force)', function(done) {
    overlay2.onShow = overlay2.onHide = null;
    hideAndDo(overlay2, function() {
      PlainOverlay.forceEvent = true;
      overlay2.onShow = function() {
        setTimeout(function() {
          expect(traceLog).toEqual([
            '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN', 'force:true',

            // remove(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
            'TriggerClassNotChanged', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay2._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'NoRange',
            'NoSelection', '_id:' + overlay2._id, '</avoidSelect>',

            // add(STYLE_CLASS_FORCE) - Canceled by `FORCE_CLASS`
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain2',
            'FORCE_CLASS:true',
            'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-show',
            'target.id:elm-plain2',
            'FORCE_CLASS:true',
            'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',

            '<finishShowing>', '_id:' + overlay2._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlay2._id, '</finishShowing>',

            '_id:' + overlay2._id, '</show>'
          ]);

          done();
        }, 0);
      };

      traceLog.length = 0;
      overlay2.show(true);
    });
  });

  it('show() -> show(force)', function(done) {
    overlay2.onShow = overlay2.onHide = null;
    hideAndDo(overlay2, function() {
      PlainOverlay.forceEvent = true;
      traceLog.length = 0;
      overlay2.show();
      setTimeout(function() { overlay2.show(true); }, 80);
      setTimeout(function() {
        expect(traceLog).toEqual([
          '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN', 'force:false',

          // remove(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
          '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
          'TriggerClassNotChanged', 'CANCEL', '</mClassList.hookApply>',

          '<avoidFocus>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
          'element:BODY',
          'NotInTarget', '_id:' + overlay2._id, '</avoidFocus>',

          '<avoidSelect>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
          'NoRange',
          'NoSelection', '_id:' + overlay2._id, '</avoidSelect>',

          // add(STYLE_CLASS_SHOW)
          '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain2',
          '<initEvent>', 'target.id:elm-plain2', 'duration:150', '</initEvent>',
          '</mClassList.hookApply>',

          'state:STATE_SHOWING',
          '_id:' + overlay2._id, '</show>',

          // show(true)

          '<show>', '_id:' + overlay2._id, 'state:STATE_SHOWING', 'force:true',

          // remove(STYLE_CLASS_HIDE) - Skip

          // add(STYLE_CLASS_FORCE) - Canceled by `FORCE_CLASS`
          '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show,plainoverlay-force',
          'target.id:elm-plain2',
          'FORCE_CLASS:true',
          'ClearPrevEvent', // event by add(STYLE_CLASS_SHOW)
          'CANCEL', '</mClassList.hookApply>',

          // add(STYLE_CLASS_SHOW) - Skip

          'state:STATE_SHOWING',

          '<finishShowing>', '_id:' + overlay2._id, 'state:STATE_SHOWING',
          'state:STATE_SHOWN',
          '_id:' + overlay2._id, '</finishShowing>',

          '_id:' + overlay2._id, '</show>'
        ]);

        done();
      }, 200);
    });
  });

  it('show() -> hide(force)', function(done) {
    overlay2.onShow = overlay2.onHide = null;
    hideAndDo(overlay2, function() {
      PlainOverlay.forceEvent = true;
      traceLog.length = 0;
      overlay2.show();
      setTimeout(function() { overlay2.hide(true); }, 80);
      setTimeout(function() {
        expect(traceLog).toEqual([
          '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN', 'force:false',

          // remove(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
          '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
          'TriggerClassNotChanged', 'CANCEL', '</mClassList.hookApply>',

          '<avoidFocus>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
          'element:BODY',
          'NotInTarget', '_id:' + overlay2._id, '</avoidFocus>',

          '<avoidSelect>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
          'NoRange',
          'NoSelection', '_id:' + overlay2._id, '</avoidSelect>',

          // add(STYLE_CLASS_SHOW)
          '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain2',
          '<initEvent>', 'target.id:elm-plain2', 'duration:150', '</initEvent>',
          '</mClassList.hookApply>',

          'state:STATE_SHOWING',
          '_id:' + overlay2._id, '</show>',

          // hide(true)

          '<hide>', '_id:' + overlay2._id, 'state:STATE_SHOWING', 'force:true',

          // add(STYLE_CLASS_FORCE) - Canceled by `FORCE_CLASS`
          '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show,plainoverlay-force',
          'target.id:elm-plain2',
          'FORCE_CLASS:true',
          'ClearPrevEvent', // event by add(STYLE_CLASS_SHOW)
          'CANCEL', '</mClassList.hookApply>',

          // remove(STYLE_CLASS_SHOW)
          '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain2',
          'FORCE_CLASS:true',
          'CANCEL', '</mClassList.hookApply>',

          'state:STATE_HIDING',

          '<finishHiding>', '_id:' + overlay2._id, 'state:STATE_HIDING',

          // add(STYLE_CLASS_HIDE) - Canceled by `FORCE_CLASS`
          '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
          'target.id:elm-plain2',
          'FORCE_CLASS:true', 'CANCEL', '</mClassList.hookApply>',

          '_id:' + overlay2._id, '</finishHiding>',

          '_id:' + overlay2._id, '</hide>',

          '<finishHiding.restoreAndFinish>', '_id:' + overlay2._id, 'state:STATE_HIDING',
          'state:STATE_HIDDEN', 'focusListener:ADD',

          '<restoreScroll>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
          'DONE:ALL', '_id:' + overlay2._id, '</restoreScroll>',

          '_id:' + overlay2._id, '</finishHiding.restoreAndFinish>'
        ]);

        done();
      }, 200);
    });
  });

});
