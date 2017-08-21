
describe('scroll', function() {
  'use strict';

  var window, document,
    PlainOverlay, insProps, pageDone,
    overlayElm, overlayDoc,
    div, text, face1, face2,

    SCROLL_ELM_LEFT = 2,
    SCROLL_ELM_TOP = 4,
    SCROLL_ELM_LEFT_TRY = 8,
    SCROLL_ELM_TOP_TRY = 16,
    SCROLL_DOC_LEFT = 1,
    SCROLL_DOC_TOP = 32,
    SCROLL_DOC_LEFT_TRY = 3,
    SCROLL_DOC_TOP_TRY = 64,
    SCROLL_FACE1_LEFT = 5,
    SCROLL_FACE1_TOP = 33,
    SCROLL_FACE1_LEFT_TRY = 7,
    SCROLL_FACE1_TOP_TRY = 65,
    SCROLL_FACE2_LEFT = 9,
    SCROLL_FACE2_TOP = 35,
    SCROLL_FACE2_LEFT_TRY = 11,
    SCROLL_FACE2_TOP_TRY = 67,

    IS_TRIDENT;

  // scrollLeft/Top need shown display
  function setFaceScroll(overlay, scroll) {
    var face = overlay.face, elmOverlay = insProps[overlay._id].elmOverlay,
      display = elmOverlay.style.display;
    elmOverlay.style.display = 'block';
    face.scrollLeft = scroll.left;
    face.scrollTop = scroll.top;
    elmOverlay.style.display = display;
  }

  // scrollLeft/Top need shown display
  function getFaceScroll(overlay) {
    var face = overlay.face, elmOverlay = insProps[overlay._id].elmOverlay,
      display = elmOverlay.style.display, scroll;
    elmOverlay.style.display = 'block';
    scroll = {left: face.scrollLeft, top: face.scrollTop};
    elmOverlay.style.display = display;
    return scroll;
  }

  function initScroll() {
    div.scrollLeft = SCROLL_ELM_LEFT;
    div.scrollTop = SCROLL_ELM_TOP;
    window.scrollTo(SCROLL_DOC_LEFT, SCROLL_DOC_TOP);
    setFaceScroll(overlayElm, {left: SCROLL_FACE1_LEFT, top: SCROLL_FACE1_TOP});
    setFaceScroll(overlayDoc, {left: SCROLL_FACE2_LEFT, top: SCROLL_FACE2_TOP});
  }

  function tryScroll() {
    div.scrollLeft = SCROLL_ELM_LEFT_TRY;
    div.scrollTop = SCROLL_ELM_TOP_TRY;
    window.scrollTo(SCROLL_DOC_LEFT_TRY, SCROLL_DOC_TOP_TRY);
    face1.scrollLeft = SCROLL_FACE1_LEFT_TRY;
    face1.scrollTop = SCROLL_FACE1_TOP_TRY;
    face2.scrollLeft = SCROLL_FACE2_LEFT_TRY;
    face2.scrollTop = SCROLL_FACE2_TOP_TRY;
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/scroll.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      insProps = window.insProps;
      IS_TRIDENT = window.IS_TRIDENT;
      div = document.getElementById('target');
      text = document.getElementById('text');
      face1 = document.getElementById('face1');
      face2 = document.getElementById('face2');
      overlayElm = new PlainOverlay(div, {face: face1});
      overlayDoc = new PlainOverlay(window, {face: face2});
      pageDone = done;

      beforeDone();
    }, 'scroll');
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainOverlay.limit).toBe(!!self.top.LIMIT);
  });

  it('avoids scrolling DIV', function(done) {
    var faceScroll;
    initScroll();
    expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT);
    expect(div.scrollTop).toBe(SCROLL_ELM_TOP);
    expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT);
    expect(window.pageYOffset).toBe(SCROLL_DOC_TOP);
    faceScroll = getFaceScroll(overlayElm);
    expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT);
    expect(faceScroll.top).toBe(SCROLL_FACE1_TOP);
    faceScroll = getFaceScroll(overlayDoc);
    expect(faceScroll.left).toBe(SCROLL_FACE2_LEFT);
    expect(faceScroll.top).toBe(SCROLL_FACE2_TOP);

    overlayElm.show();

    setTimeout(function() {
      tryScroll();

      setTimeout(function() {
        expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT); // NOT CHANGED
        expect(div.scrollTop).toBe(SCROLL_ELM_TOP); // NOT CHANGED
        expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT_TRY);
        expect(window.pageYOffset).toBe(SCROLL_DOC_TOP_TRY);
        faceScroll = getFaceScroll(overlayElm);
        expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT_TRY);
        expect(faceScroll.top).toBe(SCROLL_FACE1_TOP_TRY);
        faceScroll = getFaceScroll(overlayDoc);
        // NOT CHANGED (because it is hidden)
        expect(faceScroll.left).toBe(IS_TRIDENT ? SCROLL_FACE2_LEFT_TRY : SCROLL_FACE2_LEFT);
        // NOT CHANGED (because it is hidden)
        expect(faceScroll.top).toBe(IS_TRIDENT ? SCROLL_FACE2_TOP_TRY : SCROLL_FACE2_TOP);

        overlayElm.hide(true);

        setTimeout(function() {
          expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT); // NOT CHANGED
          expect(div.scrollTop).toBe(SCROLL_ELM_TOP); // NOT CHANGED
          expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT_TRY);
          expect(window.pageYOffset).toBe(SCROLL_DOC_TOP_TRY);
          faceScroll = getFaceScroll(overlayElm);
          expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT_TRY);
          expect(faceScroll.top).toBe(SCROLL_FACE1_TOP_TRY);
          faceScroll = getFaceScroll(overlayDoc);
          // NOT CHANGED (because it is hidden)
          expect(faceScroll.left).toBe(IS_TRIDENT ? SCROLL_FACE2_LEFT_TRY : SCROLL_FACE2_LEFT);
          // NOT CHANGED (because it is hidden)
          expect(faceScroll.top).toBe(IS_TRIDENT ? SCROLL_FACE2_TOP_TRY : SCROLL_FACE2_TOP);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('avoids scrolling DOC', function(done) {
    var faceScroll;
    initScroll();
    expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT);
    expect(div.scrollTop).toBe(SCROLL_ELM_TOP);
    expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT);
    expect(window.pageYOffset).toBe(SCROLL_DOC_TOP);
    faceScroll = getFaceScroll(overlayElm);
    expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT);
    expect(faceScroll.top).toBe(SCROLL_FACE1_TOP);
    faceScroll = getFaceScroll(overlayDoc);
    expect(faceScroll.left).toBe(SCROLL_FACE2_LEFT);
    expect(faceScroll.top).toBe(SCROLL_FACE2_TOP);

    overlayDoc.show();

    setTimeout(function() {
      tryScroll();

      setTimeout(function() {
        expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT); // NOT CHANGED
        expect(div.scrollTop).toBe(SCROLL_ELM_TOP); // NOT CHANGED
        expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT); // NOT CHANGED
        expect(window.pageYOffset).toBe(SCROLL_DOC_TOP); // NOT CHANGED
        faceScroll = getFaceScroll(overlayElm);
        expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT); // NOT CHANGED
        expect(faceScroll.top).toBe(SCROLL_FACE1_TOP); // NOT CHANGED
        faceScroll = getFaceScroll(overlayDoc);
        expect(faceScroll.left).toBe(SCROLL_FACE2_LEFT_TRY);
        expect(faceScroll.top).toBe(SCROLL_FACE2_TOP_TRY);

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT); // NOT CHANGED
          expect(div.scrollTop).toBe(SCROLL_ELM_TOP); // NOT CHANGED
          expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT); // NOT CHANGED
          expect(window.pageYOffset).toBe(SCROLL_DOC_TOP); // NOT CHANGED
          faceScroll = getFaceScroll(overlayElm);
          expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT); // NOT CHANGED
          expect(faceScroll.top).toBe(SCROLL_FACE1_TOP); // NOT CHANGED
          faceScroll = getFaceScroll(overlayDoc);
          expect(faceScroll.left).toBe(SCROLL_FACE2_LEFT_TRY);
          expect(faceScroll.top).toBe(SCROLL_FACE2_TOP_TRY);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('updates scroll values DIV', function(done) {
    var faceScroll;
    initScroll();
    expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT);
    expect(div.scrollTop).toBe(SCROLL_ELM_TOP);
    expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT);
    expect(window.pageYOffset).toBe(SCROLL_DOC_TOP);
    faceScroll = getFaceScroll(overlayElm);
    expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT);
    expect(faceScroll.top).toBe(SCROLL_FACE1_TOP);
    faceScroll = getFaceScroll(overlayDoc);
    expect(faceScroll.left).toBe(SCROLL_FACE2_LEFT);
    expect(faceScroll.top).toBe(SCROLL_FACE2_TOP);

    overlayElm.show();

    setTimeout(function() {
      var left, top;
      left = overlayElm.scrollLeft(SCROLL_ELM_LEFT_TRY);
      top = overlayElm.scrollTop(SCROLL_ELM_TOP_TRY);
      expect(left).toBe(SCROLL_ELM_LEFT_TRY);
      expect(top).toBe(SCROLL_ELM_TOP_TRY);

      setTimeout(function() {
        expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT_TRY);
        expect(div.scrollTop).toBe(SCROLL_ELM_TOP_TRY);
        expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT); // NOT TRIED
        expect(window.pageYOffset).toBe(SCROLL_DOC_TOP); // NOT TRIED
        faceScroll = getFaceScroll(overlayElm);
        expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT); // NOT TRIED
        expect(faceScroll.top).toBe(SCROLL_FACE1_TOP); // NOT TRIED
        faceScroll = getFaceScroll(overlayDoc);
        expect(faceScroll.left).toBe(SCROLL_FACE2_LEFT); // NOT TRIED
        expect(faceScroll.top).toBe(SCROLL_FACE2_TOP); // NOT TRIED

        overlayElm.hide(true);

        setTimeout(function() {
          expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT_TRY);
          expect(div.scrollTop).toBe(SCROLL_ELM_TOP_TRY);
          expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT); // NOT TRIED
          expect(window.pageYOffset).toBe(SCROLL_DOC_TOP); // NOT TRIED
          faceScroll = getFaceScroll(overlayElm);
          expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT); // NOT TRIED
          expect(faceScroll.top).toBe(SCROLL_FACE1_TOP); // NOT TRIED
          faceScroll = getFaceScroll(overlayDoc);
          expect(faceScroll.left).toBe(SCROLL_FACE2_LEFT); // NOT TRIED
          expect(faceScroll.top).toBe(SCROLL_FACE2_TOP); // NOT TRIED

          done();
        }, 50);
      }, 50);
    }, 50);
  });

  it('updates scroll values DOC', function(done) {
    var faceScroll;
    text.focus();

    initScroll();
    expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT);
    expect(div.scrollTop).toBe(SCROLL_ELM_TOP);
    expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT);
    expect(window.pageYOffset).toBe(SCROLL_DOC_TOP);
    faceScroll = getFaceScroll(overlayElm);
    expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT);
    expect(faceScroll.top).toBe(SCROLL_FACE1_TOP);
    faceScroll = getFaceScroll(overlayDoc);
    expect(faceScroll.left).toBe(SCROLL_FACE2_LEFT);
    expect(faceScroll.top).toBe(SCROLL_FACE2_TOP);

    // focus
    expect(document.activeElement).toBe(text);

    overlayDoc.show();

    setTimeout(function() {
      var left, top;
      left = overlayDoc.scrollLeft(SCROLL_DOC_LEFT_TRY);
      top = overlayDoc.scrollTop(SCROLL_DOC_TOP_TRY);
      expect(left).toBe(SCROLL_DOC_LEFT_TRY);
      expect(top).toBe(SCROLL_DOC_TOP_TRY);
      // Contained element
      left = overlayDoc.scrollLeft(SCROLL_ELM_LEFT_TRY, div);
      top = overlayDoc.scrollTop(SCROLL_ELM_TOP_TRY, div);
      expect(left).toBe(SCROLL_ELM_LEFT_TRY);
      expect(top).toBe(SCROLL_ELM_TOP_TRY);

      setTimeout(function() {
        expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT_TRY);
        expect(div.scrollTop).toBe(SCROLL_ELM_TOP_TRY);
        expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT_TRY);
        expect(window.pageYOffset).toBe(SCROLL_DOC_TOP_TRY);
        faceScroll = getFaceScroll(overlayElm);
        expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT); // NOT TRIED
        expect(faceScroll.top).toBe(SCROLL_FACE1_TOP); // NOT TRIED
        faceScroll = getFaceScroll(overlayDoc);
        expect(faceScroll.left).toBe(SCROLL_FACE2_LEFT); // NOT TRIED
        expect(faceScroll.top).toBe(SCROLL_FACE2_TOP); // NOT TRIED

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(div.scrollLeft).toBe(SCROLL_ELM_LEFT_TRY);
          expect(div.scrollTop).toBe(SCROLL_ELM_TOP_TRY);
          expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT_TRY);
          expect(window.pageYOffset).toBe(SCROLL_DOC_TOP_TRY);
          faceScroll = getFaceScroll(overlayElm);
          expect(faceScroll.left).toBe(SCROLL_FACE1_LEFT); // NOT TRIED
          expect(faceScroll.top).toBe(SCROLL_FACE1_TOP); // NOT TRIED
          faceScroll = getFaceScroll(overlayDoc);
          expect(faceScroll.left).toBe(SCROLL_FACE2_LEFT); // NOT TRIED
          expect(faceScroll.top).toBe(SCROLL_FACE2_TOP); // NOT TRIED
          // focus
          expect(document.activeElement).toBe(text);

          done();
        }, 50);
      }, 50);
    }, 50);
  });

});
