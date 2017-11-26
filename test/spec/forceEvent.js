
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
            '<show>', '_id:' + overlay1._id, 'state:STATE_HIDDEN',

            // remove(STYLE_CLASS_HIDE) - Canceled by `PlainOverlay.forceEvent:false`
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'cancel', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW) - Canceled by `PlainOverlay.forceEvent:false`
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'cancel', '</mClassList.hookApply>',

            '_id:' + overlay1._id, 'state:STATE_SHOWING', '</show>',

            '<finishShowing>', '_id:' + overlay1._id, 'state:STATE_SHOWING',
            '_id:' + overlay1._id, 'state:STATE_SHOWN', '</finishShowing>',

            // onShow -> hide()

            '<hide>', '_id:' + overlay1._id, 'state:STATE_SHOWN',

            // remove(STYLE_CLASS_SHOW) - Canceled by `PlainOverlay.forceEvent:false`
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'cancel', '</mClassList.hookApply>',

            '_id:' + overlay1._id, 'state:STATE_HIDING', '</hide>',

            '<finishHiding>', '_id:' + overlay1._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE) - Canceled by `PlainOverlay.forceEvent:false`
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-hide', 'target.id:elm-plain',
            'PlainOverlay.forceEvent:false', 'cancel', '</mClassList.hookApply>',

            '_id:' + overlay1._id, 'state:STATE_HIDDEN', '</finishHiding>'
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
            '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',

            // remove(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
            'TriggerClassNotChanged', 'cancel', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain2',
            '<initEvent>', 'target.id:elm-plain2', 'duration:150', '</initEvent>',
            '</mClassList.hookApply>',

            '_id:' + overlay2._id, 'state:STATE_SHOWING', '</show>',

            '<fireEvent>', 'target.id:elm-plain2',

            '<finishShowing>', '_id:' + overlay2._id, 'state:STATE_SHOWING',
            '_id:' + overlay2._id, 'state:STATE_SHOWN', '</finishShowing>',

            '</fireEvent>',

            // onShow -> hide()

            '<hide>', '_id:' + overlay2._id, 'state:STATE_SHOWN',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
            '<initEvent>', 'target.id:elm-plain2', 'duration:150', '</initEvent>',
            '</mClassList.hookApply>',

            '_id:' + overlay2._id, 'state:STATE_HIDING', '</hide>',

            '<fireEvent>', 'target.id:elm-plain2',

            '<finishHiding>', '_id:' + overlay2._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-hide', 'target.id:elm-plain2',
            'TriggerClassNotChanged', 'cancel', '</mClassList.hookApply>',

            '_id:' + overlay2._id, 'state:STATE_HIDDEN', '</finishHiding>',

            '</fireEvent>'
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
            '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',

            // remove(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
            'TriggerClassNotChanged', 'cancel', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain2',
            '<initEvent>', 'target.id:elm-plain2', 'duration:150', '</initEvent>',
            '</mClassList.hookApply>',

            '_id:' + overlay2._id, 'state:STATE_SHOWING', '</show>',

            // hide()

            '<hide>', '_id:' + overlay2._id, 'state:STATE_SHOWING',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
            '<initEvent>', 'target.id:elm-plain2', 'duration:150',
            'clearPrevEvent', // event by add(STYLE_CLASS_SHOW)
            '</initEvent>',
            '</mClassList.hookApply>',

            '_id:' + overlay2._id, 'state:STATE_HIDING', '</hide>',

            '<fireEvent>', 'target.id:elm-plain2',

            '<finishHiding>', '_id:' + overlay2._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-hide', 'target.id:elm-plain2',
            'TriggerClassNotChanged', 'cancel', '</mClassList.hookApply>',

            '_id:' + overlay2._id, 'state:STATE_HIDDEN', '</finishHiding>',

            '</fireEvent>'
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
            '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',

            // remove(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
            'TriggerClassNotChanged', 'cancel', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain2',
            '<initEvent>', 'target.id:elm-plain2', 'duration:150', '</initEvent>',
            '</mClassList.hookApply>',

            // add(STYLE_CLASS_FORCE) - Canceled by `FORCE_CLASS`
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show,plainoverlay-force',
            'target.id:elm-plain2',
            'FORCE_CLASS:true',
            'clearPrevEvent', // event by add(STYLE_CLASS_SHOW)
            'cancel', '</mClassList.hookApply>',

            '<finishShowing>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            '_id:' + overlay2._id, 'state:STATE_SHOWN', '</finishShowing>',

            '_id:' + overlay2._id, 'state:STATE_SHOWN', '</show>'
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
          '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',

          // remove(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
          '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
          'TriggerClassNotChanged', 'cancel', '</mClassList.hookApply>',

          // add(STYLE_CLASS_SHOW)
          '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain2',
          '<initEvent>', 'target.id:elm-plain2', 'duration:150', '</initEvent>',
          '</mClassList.hookApply>',

          '_id:' + overlay2._id, 'state:STATE_SHOWING', '</show>',

          // show(true)

          '<show>', '_id:' + overlay2._id, 'state:STATE_SHOWING',

          // remove(STYLE_CLASS_HIDE) - Skip
          // add(STYLE_CLASS_SHOW) - Skip

          // add(STYLE_CLASS_FORCE) - Canceled by `FORCE_CLASS`
          '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show,plainoverlay-force',
          'target.id:elm-plain2',
          'FORCE_CLASS:true',
          'clearPrevEvent', // event by add(STYLE_CLASS_SHOW)
          'cancel', '</mClassList.hookApply>',

          '<finishShowing>', '_id:' + overlay2._id, 'state:STATE_SHOWING',
          '_id:' + overlay2._id, 'state:STATE_SHOWN', '</finishShowing>',

          '_id:' + overlay2._id, 'state:STATE_SHOWN', '</show>'
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
          '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',

          // remove(STYLE_CLASS_HIDE) - Canceled by `TriggerClassNotChanged`
          '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
          'TriggerClassNotChanged', 'cancel', '</mClassList.hookApply>',

          // add(STYLE_CLASS_SHOW)
          '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:elm-plain2',
          '<initEvent>', 'target.id:elm-plain2', 'duration:150', '</initEvent>',
          '</mClassList.hookApply>',

          '_id:' + overlay2._id, 'state:STATE_SHOWING', '</show>',

          // hide(true)

          '<hide>', '_id:' + overlay2._id, 'state:STATE_SHOWING',

          // remove(STYLE_CLASS_SHOW)
          '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:elm-plain2',
          '<initEvent>', 'target.id:elm-plain2', 'duration:150',
          'clearPrevEvent', // event by add(STYLE_CLASS_SHOW)
          '</initEvent>',
          '</mClassList.hookApply>',

          // add(STYLE_CLASS_FORCE) - Canceled by `FORCE_CLASS`
          '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:elm-plain2',
          'FORCE_CLASS:true',
          'clearPrevEvent', // event by remove(STYLE_CLASS_SHOW)
          'cancel', '</mClassList.hookApply>',

          '<finishHiding>', '_id:' + overlay2._id, 'state:STATE_SHOWING',

          // add(STYLE_CLASS_HIDE) - Canceled by `FORCE_CLASS`
          '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
          'target.id:elm-plain2',
          'FORCE_CLASS:true', 'cancel', '</mClassList.hookApply>',

          '_id:' + overlay2._id, 'state:STATE_HIDDEN', '</finishHiding>',

          '_id:' + overlay2._id, 'state:STATE_HIDDEN', '</hide>'
        ]);

        done();
      }, 200);
    });
  });

});
