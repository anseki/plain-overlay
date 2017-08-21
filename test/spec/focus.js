
describe('focus', function() {
  'use strict';

  var window, document,
    PlainOverlay, pageDone,
    overlayElm, overlayDoc,
    text1, text2, textFace1, textFace2;

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
      text1 = document.getElementById('text1');
      text2 = document.getElementById('text2');
      textFace1 = document.getElementById('text-face1');
      textFace2 = document.getElementById('text-face2');
      overlayElm = new PlainOverlay(document.getElementById('target'),
        {face: document.getElementById('face1')});
      overlayDoc = new PlainOverlay(window, {face: document.getElementById('face2')});
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
    text1.focus();
    expect(document.activeElement).toBe(text1);

    overlayElm.show();

    setTimeout(function() {
      expect(document.activeElement).toBe(text1);

      blurElement(text1);

      setTimeout(function() {
        expect(document.activeElement).not.toBe(text1);

        text1.focus();

        setTimeout(function() {
          expect(document.activeElement).toBe(text1);

          overlayElm.hide(true);

          setTimeout(function() {
            expect(document.activeElement).toBe(text1);

            done();
          }, 50);
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: element, Focus: inside', function(done) {
    text2.focus();
    expect(document.activeElement).toBe(text2);

    overlayElm.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(text2); // BLURRED

      text2.focus();

      setTimeout(function() {
        expect(document.activeElement).not.toBe(text2); // BLURRED

        overlayElm.hide(true);

        setTimeout(function() {
          expect(document.activeElement).not.toBe(text2); // NOT RESTORED

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: element, Focus: face', function(done) {
    textFace1.focus();
    expect(document.activeElement).not.toBe(textFace1); // HIDDEN

    overlayElm.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(textFace1);

      textFace1.focus();

      setTimeout(function() {
        expect(document.activeElement).toBe(textFace1);

        overlayElm.hide(true);

        setTimeout(function() {
          fixActive();
          expect(document.activeElement).not.toBe(textFace1);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: element, Focus: hidden', function(done) {
    textFace2.focus();
    expect(document.activeElement).not.toBe(textFace2); // HIDDEN

    overlayElm.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(textFace2);

      textFace2.focus();

      setTimeout(function() {
        expect(document.activeElement).not.toBe(textFace2);

        overlayElm.hide(true);

        setTimeout(function() {
          expect(document.activeElement).not.toBe(textFace2);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: document, Focus: inside 1', function(done) {
    text1.focus();
    expect(document.activeElement).toBe(text1);

    overlayDoc.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(text1); // BLURRED

      text1.focus();

      setTimeout(function() {
        expect(document.activeElement).not.toBe(text1); // BLURRED

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(document.activeElement).toBe(text1); // RESTORED

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: document, Focus: inside 2', function(done) {
    text2.focus();
    expect(document.activeElement).toBe(text2);

    overlayDoc.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(text2); // BLURRED

      text2.focus();

      setTimeout(function() {
        expect(document.activeElement).not.toBe(text2); // BLURRED

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(document.activeElement).toBe(text2);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: document, Focus: face', function(done) {
    textFace2.focus();
    expect(document.activeElement).not.toBe(textFace2); // HIDDEN

    overlayDoc.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(textFace2);

      textFace2.focus();

      setTimeout(function() {
        expect(document.activeElement).toBe(textFace2);

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(document.activeElement).not.toBe(textFace2);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('Target: document, Focus: hidden', function(done) {
    textFace1.focus();
    expect(document.activeElement).not.toBe(textFace1); // HIDDEN

    overlayDoc.show();

    setTimeout(function() {
      expect(document.activeElement).not.toBe(textFace1);

      textFace1.focus();

      setTimeout(function() {
        expect(document.activeElement).not.toBe(textFace1);

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(document.activeElement).not.toBe(textFace1);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

});
