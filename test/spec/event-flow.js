
describe('event-flow', function() {
  'use strict';

  var window, document, utils,
    PlainOverlay, traceLog, pageDone,
    overlay1, overlay2;

  beforeAll(function(beforeDone) {
    loadPage('spec/common/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      PlainOverlay = window.PlainOverlay;
      traceLog = PlainOverlay.traceLog;
      pageDone = done;

      overlay1 = new PlainOverlay(document.getElementById('elm-plain'), {duration: 81});
      overlay2 = new PlainOverlay(document.getElementById('elm-plain2'), {duration: 80});

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
    overlay1.onShow = overlay1.onHide = overlay1.onBeforeShow = overlay1.onBeforeHide =
      overlay2.onShow = overlay2.onHide = overlay2.onBeforeShow = overlay2.onBeforeHide = null;

    utils.makeState([overlay1, overlay2],
      PlainOverlay.STATE_HIDDEN,
      function(overlay) { overlay.hide(true); },
      function() {
        window.mClassList(window.insProps[overlay1._id].elmOverlay).remove('plainoverlay-force');
        window.mClassList(window.insProps[overlay2._id].elmOverlay).remove('plainoverlay-force');

        overlay1.onShow = function() { setTimeout(function() { overlay1.hide(); }, 0); };
        overlay1.onHide = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              '<show>', '_id:' + overlay1._id, 'state:STATE_HIDDEN', 'force:false',

              '<avoidFocus>', '_id:' + overlay1._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay1._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay1._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay1._id, '</avoidSelect>',

              'state:STATE_SHOWING',
              '_id:' + overlay1._id, '</show>',

              '<finishShowing>', '_id:' + overlay1._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay1._id, '</finishShowing>',

              // onShow -> hide()

              '<hide>', '_id:' + overlay1._id, 'state:STATE_SHOWN', 'force:false',

              'state:STATE_HIDING',
              '_id:' + overlay1._id, '</hide>',

              '<finishHiding>', '_id:' + overlay1._id, 'state:STATE_HIDING',

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
      }
    );
  });

  it('show() and hide()', function(done) {
    overlay1.onShow = overlay1.onHide = overlay1.onBeforeShow = overlay1.onBeforeHide =
      overlay2.onShow = overlay2.onHide = overlay2.onBeforeShow = overlay2.onBeforeHide = null;

    utils.makeState([overlay1, overlay2],
      PlainOverlay.STATE_HIDDEN,
      function(overlay) { overlay.hide(true); },
      function() {
        window.mClassList(window.insProps[overlay1._id].elmOverlay).remove('plainoverlay-force');
        window.mClassList(window.insProps[overlay2._id].elmOverlay).remove('plainoverlay-force');

        overlay2.onShow = function() { setTimeout(function() { overlay2.hide(); }, 0); };
        overlay2.onHide = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN', 'force:false',

              '<avoidFocus>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay2._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay2._id, '</avoidSelect>',

              'state:STATE_SHOWING',
              '_id:' + overlay2._id, '</show>',

              '<finishShowing>', '_id:' + overlay2._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlay2._id, '</finishShowing>',

              // onShow -> hide()

              '<hide>', '_id:' + overlay2._id, 'state:STATE_SHOWN', 'force:false',

              'state:STATE_HIDING',
              '_id:' + overlay2._id, '</hide>',

              '<finishHiding>', '_id:' + overlay2._id, 'state:STATE_HIDING',
              '_id:' + overlay2._id, '</finishHiding>',

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
      }
    );
  });

  it('show() -> hide()', function(done) {
    overlay1.onShow = overlay1.onHide = overlay1.onBeforeShow = overlay1.onBeforeHide =
      overlay2.onShow = overlay2.onHide = overlay2.onBeforeShow = overlay2.onBeforeHide = null;

    utils.makeState([overlay1, overlay2],
      PlainOverlay.STATE_HIDDEN,
      function(overlay) { overlay.hide(true); },
      function() {
        window.mClassList(window.insProps[overlay1._id].elmOverlay).remove('plainoverlay-force');
        window.mClassList(window.insProps[overlay2._id].elmOverlay).remove('plainoverlay-force');

        overlay2.onHide = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN', 'force:false',

              '<avoidFocus>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay2._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay2._id, '</avoidSelect>',

              'state:STATE_SHOWING',
              '_id:' + overlay2._id, '</show>',

              // hide()

              '<hide>', '_id:' + overlay2._id, 'state:STATE_SHOWING', 'force:false',

              'state:STATE_HIDING',
              '_id:' + overlay2._id, '</hide>',

              '<finishHiding>', '_id:' + overlay2._id, 'state:STATE_HIDING',
              '_id:' + overlay2._id, '</finishHiding>',

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
        setTimeout(function() { overlay2.hide(); }, 40);
      }
    );
  });

  it('show(force)', function(done) {
    overlay1.onShow = overlay1.onHide = overlay1.onBeforeShow = overlay1.onBeforeHide =
      overlay2.onShow = overlay2.onHide = overlay2.onBeforeShow = overlay2.onBeforeHide = null;

    utils.makeState([overlay1, overlay2],
      PlainOverlay.STATE_HIDDEN,
      function(overlay) { overlay.hide(true); },
      function() {
        window.mClassList(window.insProps[overlay1._id].elmOverlay).remove('plainoverlay-force');
        window.mClassList(window.insProps[overlay2._id].elmOverlay).remove('plainoverlay-force');

        overlay2.onShow = function() {
          setTimeout(function() {
            expect(traceLog).toEqual([
              '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN', 'force:true',

              '<avoidFocus>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
              'element:BODY',
              'NotInTarget', '_id:' + overlay2._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
              'NoRange',
              'NoSelection', '_id:' + overlay2._id, '</avoidSelect>',

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
      }
    );
  });

  it('show() -> show(force)', function(done) {
    overlay1.onShow = overlay1.onHide = overlay1.onBeforeShow = overlay1.onBeforeHide =
      overlay2.onShow = overlay2.onHide = overlay2.onBeforeShow = overlay2.onBeforeHide = null;

    utils.makeState([overlay1, overlay2],
      PlainOverlay.STATE_HIDDEN,
      function(overlay) { overlay.hide(true); },
      function() {
        window.mClassList(window.insProps[overlay1._id].elmOverlay).remove('plainoverlay-force');
        window.mClassList(window.insProps[overlay2._id].elmOverlay).remove('plainoverlay-force');

        traceLog.length = 0;
        overlay2.show();
        setTimeout(function() { overlay2.show(true); }, 40);
        setTimeout(function() {
          expect(traceLog).toEqual([
            '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN', 'force:false',

            '<avoidFocus>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay2._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'NoRange',
            'NoSelection', '_id:' + overlay2._id, '</avoidSelect>',

            'state:STATE_SHOWING',
            '_id:' + overlay2._id, '</show>',

            // show(true)

            '<show>', '_id:' + overlay2._id, 'state:STATE_SHOWING', 'force:true',

            // remove(STYLE_CLASS_HIDE) - Skip

            // add(STYLE_CLASS_SHOW) - Skip

            'state:STATE_SHOWING',

            '<finishShowing>', '_id:' + overlay2._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlay2._id, '</finishShowing>',

            '_id:' + overlay2._id, '</show>'
          ]);

          done();
        }, 120);
      }
    );
  });

  it('show() -> hide(force)', function(done) {
    overlay1.onShow = overlay1.onHide = overlay1.onBeforeShow = overlay1.onBeforeHide =
      overlay2.onShow = overlay2.onHide = overlay2.onBeforeShow = overlay2.onBeforeHide = null;

    utils.makeState([overlay1, overlay2],
      PlainOverlay.STATE_HIDDEN,
      function(overlay) { overlay.hide(true); },
      function() {
        window.mClassList(window.insProps[overlay1._id].elmOverlay).remove('plainoverlay-force');
        window.mClassList(window.insProps[overlay2._id].elmOverlay).remove('plainoverlay-force');

        traceLog.length = 0;
        overlay2.show();
        setTimeout(function() { overlay2.hide(true); }, 40);
        setTimeout(function() {
          expect(traceLog).toEqual([
            '<show>', '_id:' + overlay2._id, 'state:STATE_HIDDEN', 'force:false',

            '<avoidFocus>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlay2._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'NoRange',
            'NoSelection', '_id:' + overlay2._id, '</avoidSelect>',

            'state:STATE_SHOWING',
            '_id:' + overlay2._id, '</show>',

            // hide(true)

            '<hide>', '_id:' + overlay2._id, 'state:STATE_SHOWING', 'force:true',

            'state:STATE_HIDING',

            '<finishHiding>', '_id:' + overlay2._id, 'state:STATE_HIDING',

            '_id:' + overlay2._id, '</finishHiding>',

            '_id:' + overlay2._id, '</hide>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlay2._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlay2._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlay2._id, '</restoreScroll>',

            '_id:' + overlay2._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 120);
      }
    );
  });

});
