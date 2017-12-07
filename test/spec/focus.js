
describe('focus', function() {
  'use strict';

  var window, document,
    PlainOverlay, traceLog, pageDone,
    overlayElm, overlayDoc,
    textInDoc, textInTarget, textInFace1, textInFace2;

  function blurElement(element) {
    if (element.blur) {
      element.blur();
    } else {
      element.ownerDocument.body.focus();
    }
  }

  // Gecko bug, the element is not blurred when it is hidden.
  function fixActive() {
    var element = document.activeElement;
    element.blur();
    element.focus();
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/focus.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      traceLog = PlainOverlay.traceLog;
      textInDoc = document.getElementById('textInDoc');
      textInTarget = document.getElementById('textInTarget');
      textInFace1 = document.getElementById('textInFace1');
      textInFace2 = document.getElementById('textInFace2');
      overlayElm = new PlainOverlay(document.getElementById('target'),
        {face: document.getElementById('face1'), duration: 20});
      overlayDoc = new PlainOverlay(window,
        {face: document.getElementById('face2'), duration: 20});
      pageDone = done;

      beforeDone();
    }, 'focus');
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainOverlay.limit).toBe(!!self.top.LIMIT);
  });

  it('Target: element, Focus: outside', function(done) {
    textInDoc.focus(); // focus: ON
    expect(document.activeElement).toBe(textInDoc);

    traceLog.length = 0;
    overlayElm.show();

    setTimeout(function() {
      expect(document.activeElement).toBe(textInDoc); // Not changed

      blurElement(textInDoc); // focus: OFF

      setTimeout(function() {
        expect(document.activeElement).not.toBe(textInDoc);

        textInDoc.focus(); // focus: ON

        setTimeout(function() {
          expect(document.activeElement).toBe(textInDoc);

          overlayElm.hide(true);

          setTimeout(function() {
            expect(document.activeElement).toBe(textInDoc); // Not changed

            expect(traceLog).toEqual([
              '<show>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN', 'force:false',

              // remove(STYLE_CLASS_HIDE)
              '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:target',
              'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

              '<avoidFocus>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
              'element:INPUT#textInDoc',
              'NotInTarget', '_id:' + overlayElm._id, '</avoidFocus>',

              '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
              'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',

              // add(STYLE_CLASS_SHOW)
              '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:target',
              'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

              'state:STATE_SHOWING',
              '_id:' + overlayElm._id, '</show>',

              // By 1st focus
              '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
              'target:document',
              '_id:' + overlayDoc._id, '</scroll-event>',

              '<finishShowing>', '_id:' + overlayElm._id, 'state:STATE_SHOWING',
              'state:STATE_SHOWN',
              '_id:' + overlayElm._id, '</finishShowing>',

              // ========

              '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
              'target:INPUT#textInDoc',
              '_id:' + overlayDoc._id, '</focusListener>',

              // ========

              '<hide>', '_id:' + overlayElm._id, 'state:STATE_SHOWN', 'force:true',

              // add(STYLE_CLASS_FORCE)
              '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show,plainoverlay-force',
              'target.id:target',
              'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

              // remove(STYLE_CLASS_SHOW)
              '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:target',
              'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

              'state:STATE_HIDING',

              '<finishHiding>', '_id:' + overlayElm._id, 'state:STATE_HIDING',

              // add(STYLE_CLASS_HIDE)
              '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
              'target.id:target',
              'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

              '_id:' + overlayElm._id, '</finishHiding>',

              '_id:' + overlayElm._id, '</hide>',

              '<finishHiding.restoreAndFinish>', '_id:' + overlayElm._id, 'state:STATE_HIDING',
              'state:STATE_HIDDEN', 'focusListener:ADD',

              '<restoreScroll>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
              'DONE:ALL', '_id:' + overlayElm._id, '</restoreScroll>',

              '_id:' + overlayElm._id, '</finishHiding.restoreAndFinish>'
            ]);

            done();
          }, 50);
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: element, Focus: inside', function(done) {
    textInTarget.focus(); // focus: ON
    expect(document.activeElement).toBe(textInTarget);

    traceLog.length = 0;
    overlayElm.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(textInTarget); // BLURRED

      textInTarget.focus(); // focus: ON

      setTimeout(function() {
        expect(document.activeElement).not.toBe(textInTarget); // BLURRED

        overlayElm.hide(true);

        setTimeout(function() {
          expect(document.activeElement).not.toBe(textInTarget); // NOT RESTORED

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'element:INPUT#textInTarget',
            'DONE', '_id:' + overlayElm._id, '</avoidFocus>', // BLURRED

            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',

            // remove(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlayElm._id, '</show>',

            // By 1st focus
            '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'target:document',
            '_id:' + overlayDoc._id, '</scroll-event>',

            '<finishShowing>', '_id:' + overlayElm._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlayElm._id, '</finishShowing>',

            // ========

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'target:INPUT#textInTarget',
            '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'target:INPUT#textInTarget',
            '<avoidFocus>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'element:INPUT#textInTarget',
            'DONE', '_id:' + overlayElm._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayElm._id, '</focusListener>',

            // ========

            '<hide>', '_id:' + overlayElm._id, 'state:STATE_SHOWN', 'force:true',

            // add(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show,plainoverlay-force',
            'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',

            '<finishHiding>', '_id:' + overlayElm._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
            'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '_id:' + overlayElm._id, '</finishHiding>',

            '_id:' + overlayElm._id, '</hide>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlayElm._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlayElm._id, '</restoreScroll>',

            '_id:' + overlayElm._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: element, Focus: face', function(done) {
    textInFace1.focus(); // focus: ON
    expect(document.activeElement).not.toBe(textInFace1); // HIDDEN

    traceLog.length = 0;
    overlayElm.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(textInFace1);

      textInFace1.focus(); // focus: ON

      setTimeout(function() {
        expect(document.activeElement).toBe(textInFace1);

        overlayElm.hide(true);

        setTimeout(function() {
          fixActive();
          expect(document.activeElement).not.toBe(textInFace1);

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlayElm._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',

            // remove(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlayElm._id, '</show>',

            '<finishShowing>', '_id:' + overlayElm._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlayElm._id, '</finishShowing>',

            // ========

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'target:INPUT#textInFace1',
            '_id:' + overlayDoc._id, '</focusListener>',

            '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'target:document',
            '_id:' + overlayDoc._id, '</scroll-event>',

            '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'target:DIV#face1',
            '_id:' + overlayDoc._id, '</scroll-event>',

            // ========

            '<hide>', '_id:' + overlayElm._id, 'state:STATE_SHOWN', 'force:true',

            // add(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show,plainoverlay-force',
            'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',

            '<finishHiding>', '_id:' + overlayElm._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
            'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '_id:' + overlayElm._id, '</finishHiding>',

            '_id:' + overlayElm._id, '</hide>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlayElm._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlayElm._id, '</restoreScroll>',

            '_id:' + overlayElm._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: element, Focus: hidden', function(done) {
    textInFace2.focus(); // focus: ON
    expect(document.activeElement).not.toBe(textInFace2); // HIDDEN

    traceLog.length = 0;
    overlayElm.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(textInFace2);

      textInFace2.focus(); // focus: ON

      setTimeout(function() {
        expect(document.activeElement).not.toBe(textInFace2); // Not changed

        overlayElm.hide(true);

        setTimeout(function() {
          expect(document.activeElement).not.toBe(textInFace2);

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '<avoidFocus>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'element:BODY',
            'NotInTarget', '_id:' + overlayElm._id, '</avoidFocus>',

            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',

            // remove(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlayElm._id, '</show>',

            '<finishShowing>', '_id:' + overlayElm._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlayElm._id, '</finishShowing>',

            // ========

            // No event

            // ========

            '<hide>', '_id:' + overlayElm._id, 'state:STATE_SHOWN', 'force:true',

            // add(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show,plainoverlay-force',
            'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force', 'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',

            '<finishHiding>', '_id:' + overlayElm._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-force,plainoverlay-hide',
            'target.id:target',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '_id:' + overlayElm._id, '</finishHiding>',

            '_id:' + overlayElm._id, '</hide>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlayElm._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN', 'focusListener:ADD',

            '<restoreScroll>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlayElm._id, '</restoreScroll>',

            '_id:' + overlayElm._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: document, Focus: inside 1', function(done) {
    textInDoc.focus(); // focus: ON
    expect(document.activeElement).toBe(textInDoc);

    traceLog.length = 0;
    overlayDoc.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(textInDoc); // BLURRED

      textInDoc.focus(); // focus: ON

      setTimeout(function() {
        expect(document.activeElement).not.toBe(textInDoc); // BLURRED

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(document.activeElement).toBe(textInDoc); // RESTORED

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc', 'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // From disableDocBars
            '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE:ELEMENT', '_id:' + overlayDoc._id, '</restoreScroll>',

            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'element:INPUT#textInDoc',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED

            // selection may be created by focusing text-box
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlayDoc._id, '</show>',

            // By 1st focus
            '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
            'target:document',
            '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
            'DONE:ELEMENT', '_id:' + overlayDoc._id, '</restoreScroll>',
            'AVOIDED',
            '_id:' + overlayDoc._id, '</scroll-event>',

            '<finishShowing>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlayDoc._id, '</finishShowing>',

            // ========

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:INPUT#textInDoc',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:INPUT#textInDoc',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>',

            // ========

            '<hide>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN', 'force:true',

            // add(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show,plainoverlay-force',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-force',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',

            '<finishHiding>', '_id:' + overlayDoc._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-force,plainoverlay-hide',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '[SAVE1]state:STATE_HIDDEN',
            'focusListener:REMOVE', // ==== REMOVED LISTENER START
            // No event
            '[SAVE2]state:STATE_HIDING',

            '_id:' + overlayDoc._id, '</finishHiding>',

            '_id:' + overlayDoc._id, '</hide>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlayDoc._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN',
            'focusListener:ADD', // ==== REMOVED LISTENER END

            '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlayDoc._id, '</restoreScroll>',

            '_id:' + overlayDoc._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: document, Focus: inside 2', function(done) {
    textInTarget.focus(); // focus: ON
    expect(document.activeElement).toBe(textInTarget);

    traceLog.length = 0;
    overlayDoc.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(textInTarget); // BLURRED

      textInTarget.focus(); // focus: ON

      setTimeout(function() {
        expect(document.activeElement).not.toBe(textInTarget); // BLURRED

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(document.activeElement).toBe(textInTarget); // RESTORED

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-force',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // From disableDocBars
            '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE:ELEMENT', '_id:' + overlayDoc._id, '</restoreScroll>',

            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'element:INPUT#textInTarget',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED

            // selection may be created by focusing text-box
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',

            // remove(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc', 'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlayDoc._id, '</show>',

            // By 1st focus
            '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
            'target:document',
            '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
            'DONE:ELEMENT', '_id:' + overlayDoc._id, '</restoreScroll>',
            'AVOIDED',
            '_id:' + overlayDoc._id, '</scroll-event>',

            '<finishShowing>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlayDoc._id, '</finishShowing>',

            // ========

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:INPUT#textInTarget',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:INPUT#textInTarget',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>',

            // ========

            '<hide>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN', 'force:true',

            // add(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show,plainoverlay-force',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-force', 'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',

            '<finishHiding>', '_id:' + overlayDoc._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-force,plainoverlay-hide',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '[SAVE1]state:STATE_HIDDEN',
            'focusListener:REMOVE', // ==== REMOVED LISTENER START
            // overlayElm gets the event
            '<focusListener>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'target:INPUT#textInTarget',
            '_id:' + overlayElm._id, '</focusListener>',
            '[SAVE2]state:STATE_HIDING',

            '_id:' + overlayDoc._id, '</finishHiding>',

            '_id:' + overlayDoc._id, '</hide>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlayDoc._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN',
            'focusListener:ADD', // ==== REMOVED LISTENER END

            '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlayDoc._id, '</restoreScroll>',

            '_id:' + overlayDoc._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: document, Focus: face', function(done) {
    textInFace2.focus(); // focus: ON
    expect(document.activeElement).not.toBe(textInFace2); // HIDDEN

    traceLog.length = 0;
    overlayDoc.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(textInFace2);

      textInFace2.focus(); // focus: ON

      setTimeout(function() {
        expect(document.activeElement).toBe(textInFace2);

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(document.activeElement).not.toBe(textInFace2);

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-force',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // From disableDocBars
            '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE:ELEMENT', '_id:' + overlayDoc._id, '</restoreScroll>',

            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'element:INPUT#textInTarget', // by prev test
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED

            // selection may be created by focusing text-box
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',

            // remove(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc', 'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlayDoc._id, '</show>',

            '<finishShowing>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlayDoc._id, '</finishShowing>',

            // ========

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:INPUT#textInFace2',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:INPUT#textInFace2',
            'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
            '_id:' + overlayDoc._id, '</focusListener>',

            '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:DIV#face2',
            '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'NotInTarget', '_id:' + overlayDoc._id, '</restoreScroll>',
            '_id:' + overlayDoc._id, '</scroll-event>',

            // ========

            '<hide>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN', 'force:true',

            // add(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show,plainoverlay-force',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-force', 'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',

            '<finishHiding>', '_id:' + overlayDoc._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-force,plainoverlay-hide',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '[SAVE1]state:STATE_HIDDEN',
            'focusListener:REMOVE', // ==== REMOVED LISTENER START

            '<focusListener>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'target:INPUT#textInTarget',
            '_id:' + overlayElm._id, '</focusListener>',

            '[SAVE2]state:STATE_HIDING',

            '_id:' + overlayDoc._id, '</finishHiding>',

            '_id:' + overlayDoc._id, '</hide>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlayDoc._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN',
            'focusListener:ADD', // ==== REMOVED LISTENER END

            '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlayDoc._id, '</restoreScroll>',

            '_id:' + overlayDoc._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: document, Focus: hidden', function(done) {
    textInFace1.focus(); // focus: ON
    expect(document.activeElement).not.toBe(textInFace1); // HIDDEN

    traceLog.length = 0;
    overlayDoc.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(textInFace1);

      textInFace1.focus(); // focus: ON

      setTimeout(function() {
        expect(document.activeElement).not.toBe(textInFace1); // Not changed

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(document.activeElement).not.toBe(textInFace1);

          expect(traceLog).toEqual([
            '<show>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN', 'force:false',

            // remove(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-force',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // From disableDocBars
            '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE:ELEMENT', '_id:' + overlayDoc._id, '</restoreScroll>',

            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'element:INPUT#textInTarget', // by prev test
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED

            // selection may be created by focusing text-box
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',

            // remove(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc', 'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // add(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_SHOWING',
            '_id:' + overlayDoc._id, '</show>',

            '<finishShowing>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
            'state:STATE_SHOWN',
            '_id:' + overlayDoc._id, '</finishShowing>',

            // ========

            // No event

            // ========

            '<hide>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN', 'force:true',

            // add(STYLE_CLASS_FORCE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show,plainoverlay-force',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            // remove(STYLE_CLASS_SHOW)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-force', 'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            'state:STATE_HIDING',

            '<finishHiding>', '_id:' + overlayDoc._id, 'state:STATE_HIDING',

            // add(STYLE_CLASS_HIDE)
            '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-force,plainoverlay-hide',
            'target.id:UNKNOWN',
            'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

            '[SAVE1]state:STATE_HIDDEN',
            'focusListener:REMOVE', // ==== REMOVED LISTENER START

            '<focusListener>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            'target:INPUT#textInTarget',
            '_id:' + overlayElm._id, '</focusListener>',

            '[SAVE2]state:STATE_HIDING',

            '_id:' + overlayDoc._id, '</finishHiding>',

            '_id:' + overlayDoc._id, '</hide>',

            '<finishHiding.restoreAndFinish>', '_id:' + overlayDoc._id, 'state:STATE_HIDING',
            'state:STATE_HIDDEN',
            'focusListener:ADD', // ==== REMOVED LISTENER END

            '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'DONE:ALL', '_id:' + overlayDoc._id, '</restoreScroll>',

            '_id:' + overlayDoc._id, '</finishHiding.restoreAndFinish>'
          ]);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

});
