
describe('focus', function() {
  'use strict';

  var window, document, utils,
    PlainOverlay, traceLog, pageDone,
    overlayElm, overlayDoc,
    textInDoc, textInTarget, textInFace1, textInFace2,
    IS_TRIDENT, IS_BLINK, IS_GECKO;

  function blurElement(element) {
    if (element.blur) {
      element.blur();
    } else {
      element.ownerDocument.body.focus();
    }
  }

  function reset() {
    var selection = ('getSelection' in window ? window : document).getSelection();
    if (selection.rangeCount > 0) { selection.removeAllRanges(); }
    if (document.activeElement) { blurElement(document.activeElement); }
    document.body.focus();
    // Trident bug? It seems that `focus()` makes selection again.
    if (selection.rangeCount > 0) { selection.removeAllRanges(); }
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/focus.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
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

      IS_TRIDENT = window.IS_TRIDENT;
      IS_BLINK = window.IS_BLINK;
      IS_GECKO = window.IS_GECKO;

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
    overlayElm.onShow = overlayElm.onHide = overlayElm.onBeforeShow = overlayElm.onBeforeHide =
      overlayDoc.onShow = overlayDoc.onHide = overlayDoc.onBeforeShow = overlayDoc.onBeforeHide = null;

    reset();
    setTimeout(function() {
      utils.makeState([overlayElm, overlayDoc],
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          textInDoc.focus(); // focus: ON

          setTimeout(function() {
            expect(document.activeElement).toBe(textInDoc);

            overlayElm.onShow = function() {
              setTimeout(function() {
                expect(document.activeElement).toBe(textInDoc); // Not changed

                blurElement(textInDoc); // focus: OFF

                setTimeout(function() {
                  expect(document.activeElement).not.toBe(textInDoc);

                  textInDoc.focus(); // focus: ON

                  setTimeout(function() {
                    expect(document.activeElement).toBe(textInDoc);

                    overlayElm.hide(true);
                  }, 0);
                }, 0);
              }, 0);
            };

            overlayElm.onHide = function() {
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
                  IS_TRIDENT ? 'NoRange' : 'start:BODY(3),end:BODY(3),isCollapsed:true',
                  'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',

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
                  IS_TRIDENT ? 'target:BODY' : 'target:INPUT#textInDoc',
                  '_id:' + overlayDoc._id, '</focusListener>'
                ].concat(
                  IS_TRIDENT ? [
                    '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                    'target:INPUT#textInDoc',
                    '_id:' + overlayDoc._id, '</focusListener>'
                  ] : []
                ).concat([
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
                ]));

                done();
              }, 0);
            };

            traceLog.length = 0;
            overlayElm.show();
          }, 50); // focus() needs time
        }
      );
    }, 0);
  });

  it('Target: element, Focus: inside', function(done) {
    overlayElm.onShow = overlayElm.onHide = overlayElm.onBeforeShow = overlayElm.onBeforeHide =
      overlayDoc.onShow = overlayDoc.onHide = overlayDoc.onBeforeShow = overlayDoc.onBeforeHide = null;

    reset();
    setTimeout(function() {
      utils.makeState([overlayElm, overlayDoc],
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          textInTarget.focus(); // focus: ON

          setTimeout(function() {
            expect(document.activeElement).toBe(textInTarget);

            overlayElm.onShow = function() {
              setTimeout(function() {
                expect(document.activeElement).not.toBe(textInTarget); // BLURRED

                textInTarget.focus(); // focus: ON

                setTimeout(function() {
                  expect(document.activeElement).not.toBe(textInTarget); // BLURRED

                  overlayElm.hide(true);
                }, 0);
              }, 0);
            };

            overlayElm.onHide = function() {
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
                  IS_TRIDENT ? 'start:P#pInDoc1(0),end:P#pInDoc1(0),isCollapsed:true' :
                    'start:DIV#target(3),end:DIV#target(3),isCollapsed:true',
                  IS_TRIDENT ? 'NoSelection' : 'DONE',
                  '_id:' + overlayElm._id, '</avoidSelect>',

                  // remove(STYLE_CLASS_FORCE)
                  '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:target',
                  'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                  // add(STYLE_CLASS_SHOW)
                  '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:target',
                  'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                  'state:STATE_SHOWING',
                  '_id:' + overlayElm._id, '</show>'
                ].concat(
                  IS_TRIDENT ? [
                    '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                    'target:BODY',
                    '_id:' + overlayDoc._id, '</focusListener>'
                  ] : []
                ).concat([
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
                  'AVOIDED', '_id:' + overlayElm._id, '</focusListener>'
                ]).concat(
                  IS_TRIDENT ? [
                    '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                    'target:BODY',
                    '_id:' + overlayDoc._id, '</focusListener>'
                  ] : []
                ).concat([
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
                ]));

                done();
              }, 0);
            };

            traceLog.length = 0;
            overlayElm.show();
          }, 50); // focus() needs time
        }
      );
    }, 0);
  });

  it('Target: element, Focus: face', function(done) {
    overlayElm.onShow = overlayElm.onHide = overlayElm.onBeforeShow = overlayElm.onBeforeHide =
      overlayDoc.onShow = overlayDoc.onHide = overlayDoc.onBeforeShow = overlayDoc.onBeforeHide = null;

    reset();
    setTimeout(function() {
      utils.makeState([overlayElm, overlayDoc],
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          textInFace1.focus(); // focus: ON

          setTimeout(function() {
            expect(document.activeElement).not.toBe(textInFace1); // HIDDEN

            overlayElm.onShow = function() {
              setTimeout(function() {
                expect(document.activeElement).not.toBe(textInFace1);

                textInFace1.focus(); // focus: ON

                setTimeout(function() {
                  expect(document.activeElement).toBe(textInFace1);

                  overlayElm.hide(true);
                }, 0);
              }, 0);
            };

            overlayElm.onHide = function() {
              setTimeout(function() {
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
                  'NoRange',
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
                  '_id:' + overlayDoc._id, '</focusListener>'
                ].concat(
                  IS_TRIDENT ? [
                    '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                    'target:DIV#face1',
                    '_id:' + overlayDoc._id, '</scroll-event>',
                    '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                    'target:document',
                    '_id:' + overlayDoc._id, '</scroll-event>'
                  ] : []
                ).concat([
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

                  '_id:' + overlayElm._id, '</hide>'
                ]).concat(
                  IS_TRIDENT ? [
                    '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                    'target:BODY',
                    '_id:' + overlayDoc._id, '</focusListener>'
                  ] : []
                ).concat([
                  '<finishHiding.restoreAndFinish>', '_id:' + overlayElm._id, 'state:STATE_HIDING',
                  'state:STATE_HIDDEN', 'focusListener:ADD',

                  '<restoreScroll>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
                  'DONE:ALL', '_id:' + overlayElm._id, '</restoreScroll>',

                  '_id:' + overlayElm._id, '</finishHiding.restoreAndFinish>'
                ]));

                done();
              }, 0);
            };

            traceLog.length = 0;
            overlayElm.show();
          }, 50); // focus() needs time
        }
      );
    }, 0);
  });

  it('Target: element, Focus: hidden', function(done) {
    overlayElm.onShow = overlayElm.onHide = overlayElm.onBeforeShow = overlayElm.onBeforeHide =
      overlayDoc.onShow = overlayDoc.onHide = overlayDoc.onBeforeShow = overlayDoc.onBeforeHide = null;

    reset();
    setTimeout(function() {
      utils.makeState([overlayElm, overlayDoc],
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          textInFace2.focus(); // focus: ON

          setTimeout(function() {
            expect(document.activeElement).not.toBe(textInFace2); // HIDDEN

            overlayElm.onShow = function() {
              setTimeout(function() {
                expect(document.activeElement).not.toBe(textInFace2);

                textInFace2.focus(); // focus: ON

                setTimeout(function() {
                  expect(document.activeElement).not.toBe(textInFace2); // Not changed

                  overlayElm.hide(true);
                }, 0);
              }, 0);
            };

            overlayElm.onHide = function() {
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
                  // Blink bug, strange!
                  IS_BLINK ? 'start:P#pInFace1(0),end:P#pInFace1(0),isCollapsed:true' : 'NoRange',
                  'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',

                  // remove(STYLE_CLASS_FORCE)
                  '<mClassList.hookApply>', 'list:plainoverlay', 'target.id:target',
                  'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                  // add(STYLE_CLASS_SHOW)
                  '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-show', 'target.id:target',
                  'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                  'state:STATE_SHOWING',
                  '_id:' + overlayElm._id, '</show>'
                ].concat(
                  // Bug?
                  IS_GECKO ? [
                    '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                    'target:DIV#face1',
                    '_id:' + overlayDoc._id, '</scroll-event>'
                  ] : []
                ).concat([
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
                ]));

                done();
              }, 0);
            };

            traceLog.length = 0;
            overlayElm.show();
          }, 50); // focus() needs time
        }
      );
    }, 0);
  });

  it('Target: document, Focus: inside 1', function(done) {
    overlayElm.onShow = overlayElm.onHide = overlayElm.onBeforeShow = overlayElm.onBeforeHide =
      overlayDoc.onShow = overlayDoc.onHide = overlayDoc.onBeforeShow = overlayDoc.onBeforeHide = null;

    reset();
    setTimeout(function() {
      utils.makeState([overlayElm, overlayDoc],
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          textInDoc.focus(); // focus: ON

          setTimeout(function() {
            expect(document.activeElement).toBe(textInDoc);

            overlayDoc.onShow = function() {
              setTimeout(function() {
                expect(document.activeElement).not.toBe(textInDoc); // BLURRED

                textInDoc.focus(); // focus: ON

                setTimeout(function() {
                  expect(document.activeElement).not.toBe(textInDoc); // BLURRED

                  overlayDoc.hide(true);
                }, 0);
              }, 0);
            };

            overlayDoc.onHide = function() {
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

                  '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                  IS_TRIDENT ? 'start:P#pInDoc1(0),end:P#pInDoc1(0),isCollapsed:true' :
                    'start:BODY(3),end:BODY(3),isCollapsed:true',
                  'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',

                  // add(STYLE_CLASS_SHOW)
                  '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show',
                  'target.id:UNKNOWN',
                  'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                  'state:STATE_SHOWING',
                  '_id:' + overlayDoc._id, '</show>'
                ].concat(
                  // Bug?
                  IS_GECKO ? [
                    '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'target:DIV#face2',
                    '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'NotInTarget', '_id:' + overlayDoc._id, '</restoreScroll>',
                    '_id:' + overlayDoc._id, '</scroll-event>'
                  ] :
                  IS_TRIDENT ? [
                    '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'target:BODY',
                    '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'element:BODY',
                    'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
                    '_id:' + overlayDoc._id, '</focusListener>',
                  ] : []
                ).concat([
                  '<finishShowing>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                  'state:STATE_SHOWN',
                  '_id:' + overlayDoc._id, '</finishShowing>',

                  // ========

                  '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                  'target:INPUT#textInDoc',
                  '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                  'element:INPUT#textInDoc',
                  'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
                  'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>'
                ]).concat(
                  IS_TRIDENT ? [
                    '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                    'target:BODY',
                    '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                    'element:BODY',
                    'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
                    '_id:' + overlayDoc._id, '</focusListener>'
                  ] : []
                ).concat([
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
                ]));

                done();
              }, 0);
            };

            traceLog.length = 0;
            overlayDoc.show();
          }, 50); // focus() needs time
        }
      );
    }, 0);
  });

  it('Target: document, Focus: inside 2', function(done) {
    overlayElm.onShow = overlayElm.onHide = overlayElm.onBeforeShow = overlayElm.onBeforeHide =
      overlayDoc.onShow = overlayDoc.onHide = overlayDoc.onBeforeShow = overlayDoc.onBeforeHide = null;

    reset();
    setTimeout(function() {
      utils.makeState([overlayElm, overlayDoc],
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          textInTarget.focus(); // focus: ON

          setTimeout(function() {
            expect(document.activeElement).toBe(textInTarget);

            overlayDoc.onShow = function() {
              setTimeout(function() {
                expect(document.activeElement).not.toBe(textInTarget); // BLURRED

                textInTarget.focus(); // focus: ON

                setTimeout(function() {
                  expect(document.activeElement).not.toBe(textInTarget); // BLURRED

                  overlayDoc.hide(true);
                }, 0);
              }, 0);
            };

            overlayDoc.onHide = function() {
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

                  '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                  IS_TRIDENT ? 'start:P#pInDoc1(0),end:P#pInDoc1(0),isCollapsed:true' :
                    'start:DIV#target(3),end:DIV#target(3),isCollapsed:true',
                  'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',

                  // remove(STYLE_CLASS_FORCE)
                  '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc', 'target.id:UNKNOWN',
                  'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                  // add(STYLE_CLASS_SHOW)
                  '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show',
                  'target.id:UNKNOWN',
                  'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                  'state:STATE_SHOWING',
                  '_id:' + overlayDoc._id, '</show>'
                ].concat(
                  // Bug?
                  IS_GECKO ? [
                    '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'target:DIV#face2',
                    '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'NotInTarget', '_id:' + overlayDoc._id, '</restoreScroll>',
                    '_id:' + overlayDoc._id, '</scroll-event>'
                  ] :
                  IS_TRIDENT ? [
                    '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'target:BODY',
                    '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'element:BODY',
                    'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
                    '_id:' + overlayDoc._id, '</focusListener>',
                  ] : []
                ).concat([
                  '<finishShowing>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                  'state:STATE_SHOWN',
                  '_id:' + overlayDoc._id, '</finishShowing>',

                  // ========

                  '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                  'target:INPUT#textInTarget',
                  '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                  'element:INPUT#textInTarget',
                  'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
                  'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>'
                ]).concat(
                  IS_TRIDENT ? [
                    '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                    'target:BODY',
                    '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                    'element:BODY',
                    'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
                    '_id:' + overlayDoc._id, '</focusListener>'
                  ] : []
                ).concat([
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
                ]).concat(
                  // focus event is fired after
                  IS_TRIDENT ? [
                    '[SAVE2]state:STATE_HIDING',

                    '_id:' + overlayDoc._id, '</finishHiding>',

                    '_id:' + overlayDoc._id, '</hide>',

                    '<focusListener>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
                    'target:INPUT#textInTarget',
                    '_id:' + overlayElm._id, '</focusListener>'
                  ] : [
                    '<focusListener>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
                    'target:INPUT#textInTarget',
                    '_id:' + overlayElm._id, '</focusListener>',
                    '[SAVE2]state:STATE_HIDING',

                    '_id:' + overlayDoc._id, '</finishHiding>',

                    '_id:' + overlayDoc._id, '</hide>'
                  ]
                ).concat([
                  '<finishHiding.restoreAndFinish>', '_id:' + overlayDoc._id, 'state:STATE_HIDING',
                  'state:STATE_HIDDEN',
                  'focusListener:ADD', // ==== REMOVED LISTENER END

                  '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                  'DONE:ALL', '_id:' + overlayDoc._id, '</restoreScroll>',

                  '_id:' + overlayDoc._id, '</finishHiding.restoreAndFinish>'
                ]));

                done();
              }, 0);
            };

            traceLog.length = 0;
            overlayDoc.show();
          }, 50); // focus() needs time
        }
      );
    }, 0);
  });

  it('Target: document, Focus: face', function(done) {
    overlayElm.onShow = overlayElm.onHide = overlayElm.onBeforeShow = overlayElm.onBeforeHide =
      overlayDoc.onShow = overlayDoc.onHide = overlayDoc.onBeforeShow = overlayDoc.onBeforeHide = null;

    reset();
    setTimeout(function() {
      utils.makeState([overlayElm, overlayDoc],
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          textInFace2.focus(); // focus: ON

          setTimeout(function() {
            expect(document.activeElement).not.toBe(textInFace2); // HIDDEN

            overlayDoc.onShow = function() {
              setTimeout(function() {
                expect(document.activeElement).not.toBe(textInFace2);

                textInFace2.focus(); // focus: ON

                setTimeout(function() {
                  expect(document.activeElement).toBe(textInFace2);

                  overlayDoc.hide(true);
                }, 0);
              }, 0);
            };

            overlayDoc.onHide = function() {
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
                  'element:BODY',
                  'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',

                  '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                  'NoRange',
                  'NoSelection', '_id:' + overlayDoc._id, '</avoidSelect>',

                  // remove(STYLE_CLASS_FORCE)
                  '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc', 'target.id:UNKNOWN',
                  'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                  // add(STYLE_CLASS_SHOW)
                  '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show',
                  'target.id:UNKNOWN',
                  'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                  'state:STATE_SHOWING',
                  '_id:' + overlayDoc._id, '</show>'
                ].concat(
                  // Bug?
                  IS_GECKO ? [
                    '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'target:DIV#face2',
                    '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'NotInTarget', '_id:' + overlayDoc._id, '</restoreScroll>',
                    '_id:' + overlayDoc._id, '</scroll-event>'
                  ] : []
                ).concat([
                  '<finishShowing>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                  'state:STATE_SHOWN',
                  '_id:' + overlayDoc._id, '</finishShowing>',

                  // ========

                  '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                  'target:INPUT#textInFace2',
                  '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                  'element:INPUT#textInFace2',
                  'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
                  '_id:' + overlayDoc._id, '</focusListener>'
                ]).concat(
                  IS_TRIDENT ? [
                    '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                    'target:DIV#face2',
                    '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
                    'NotInTarget', '_id:' + overlayDoc._id, '</restoreScroll>',
                    '_id:' + overlayDoc._id, '</scroll-event>'
                  ] : []
                ).concat([
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
                ]));

                done();
              }, 0);
            };

            traceLog.length = 0;
            overlayDoc.show();
          }, 50); // focus() needs time
        }
      );
    }, 0);
  });

  it('Target: document, Focus: hidden', function(done) {
    overlayElm.onShow = overlayElm.onHide = overlayElm.onBeforeShow = overlayElm.onBeforeHide =
      overlayDoc.onShow = overlayDoc.onHide = overlayDoc.onBeforeShow = overlayDoc.onBeforeHide = null;

    reset();
    setTimeout(function() {
      utils.makeState([overlayElm, overlayDoc],
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          textInFace1.focus(); // focus: ON

          setTimeout(function() {
            expect(document.activeElement).not.toBe(textInFace1); // HIDDEN

            overlayDoc.onShow = function() {
              setTimeout(function() {
                expect(document.activeElement).not.toBe(textInFace1);

                textInFace1.focus(); // focus: ON

                setTimeout(function() {
                  expect(document.activeElement).not.toBe(textInFace1); // Not changed

                  overlayDoc.hide(true);
                }, 0);
              }, 0);
            };

            overlayDoc.onHide = function() {
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
                  'element:BODY',
                  'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',

                  '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
                  // Blink bug, strange!
                  IS_BLINK ? 'start:P#pInFace2(0),end:P#pInFace2(0),isCollapsed:true' : 'NoRange',
                  'NoSelection', '_id:' + overlayDoc._id, '</avoidSelect>',

                  // remove(STYLE_CLASS_FORCE)
                  '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc', 'target.id:UNKNOWN',
                  'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                  // add(STYLE_CLASS_SHOW)
                  '<mClassList.hookApply>', 'list:plainoverlay,plainoverlay-doc,plainoverlay-show',
                  'target.id:UNKNOWN',
                  'PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>',

                  'state:STATE_SHOWING',
                  '_id:' + overlayDoc._id, '</show>'
                ].concat(
                  // Bug?
                  IS_GECKO ? [
                    '<scroll-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'target:DIV#face2',
                    '<restoreScroll>', '_id:' + overlayDoc._id, 'state:STATE_SHOWING',
                    'NotInTarget', '_id:' + overlayDoc._id, '</restoreScroll>',
                    '_id:' + overlayDoc._id, '</scroll-event>'
                  ] : []
                ).concat([
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
                ]));

                done();
              }, 0);
            };

            traceLog.length = 0;
            overlayDoc.show();
          }, 50); // focus() needs time
        }
      );
    }, 0);
  });

});
