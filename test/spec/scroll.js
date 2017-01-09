
describe('scroll()', function() {
  'use strict';

  var window, document,
    PlainOverlay, pageDone,
    div, text, overlayDiv, overlayDoc,

    SCROLL_DIV_LEFT = 2,
    SCROLL_DIV_TOP = 4,
    SCROLL_DIV_TRY_LEFT = 8,
    SCROLL_DIV_TRY_TOP = 16,
    SCROLL_DOC_LEFT = 0,
    SCROLL_DOC_TOP = 32,
    SCROLL_DOC_TRY_LEFT = 0,
    SCROLL_DOC_TRY_TOP = 64;

  beforeAll(function(beforeDone) {
    loadPage('spec/scroll/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      div = document.getElementById('target');
      text = document.getElementById('text');
      overlayDiv = new PlainOverlay(div);
      overlayDoc = new PlainOverlay(window);
      pageDone = done;

      beforeDone();
    }, 'scroll()');
  });

  afterAll(function() {
    pageDone();
  });

  it('avoids scrolling DIV', function(done) {
    div.scrollLeft = SCROLL_DIV_LEFT;
    div.scrollTop = SCROLL_DIV_TOP;
    expect(div.scrollLeft).toBe(SCROLL_DIV_LEFT);
    expect(div.scrollTop).toBe(SCROLL_DIV_TOP);

    overlayDiv.show();

    setTimeout(function() {
      div.scrollLeft = SCROLL_DIV_TRY_LEFT;
      div.scrollTop = SCROLL_DIV_TRY_TOP;

      setTimeout(function() {
        expect(div.scrollLeft).toBe(SCROLL_DIV_LEFT);
        expect(div.scrollTop).toBe(SCROLL_DIV_TOP);

        overlayDiv.hide(true);

        setTimeout(function() {
          expect(div.scrollLeft).toBe(SCROLL_DIV_LEFT);
          expect(div.scrollTop).toBe(SCROLL_DIV_TOP);

          done();
        }, 200);
      }, 200);
    }, 200);
  });

  it('avoids scrolling DOC', function(done) {
    window.scrollTo(SCROLL_DOC_LEFT, SCROLL_DOC_TOP);
    expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT);
    expect(window.pageYOffset).toBe(SCROLL_DOC_TOP);
    // Contained element
    div.scrollLeft = SCROLL_DIV_LEFT;
    div.scrollTop = SCROLL_DIV_TOP;
    expect(div.scrollLeft).toBe(SCROLL_DIV_LEFT);
    expect(div.scrollTop).toBe(SCROLL_DIV_TOP);

    overlayDoc.show();

    setTimeout(function() {
      window.scrollTo(SCROLL_DOC_TRY_LEFT, SCROLL_DOC_TRY_TOP);
      // Contained element
      div.scrollLeft = SCROLL_DIV_TRY_LEFT;
      div.scrollTop = SCROLL_DIV_TRY_TOP;

      setTimeout(function() {
        expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT);
        expect(window.pageYOffset).toBe(SCROLL_DOC_TOP);
        // Contained element
        expect(div.scrollLeft).toBe(SCROLL_DIV_LEFT);
        expect(div.scrollTop).toBe(SCROLL_DIV_TOP);

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT);
          expect(window.pageYOffset).toBe(SCROLL_DOC_TOP);
          // Contained element
          expect(div.scrollLeft).toBe(SCROLL_DIV_LEFT);
          expect(div.scrollTop).toBe(SCROLL_DIV_TOP);

          done();
        }, 200);
      }, 200);
    }, 200);
  });

  it('updates scroll values DIV', function(done) {
    div.scrollLeft = SCROLL_DIV_LEFT;
    div.scrollTop = SCROLL_DIV_TOP;
    expect(div.scrollLeft).toBe(SCROLL_DIV_LEFT);
    expect(div.scrollTop).toBe(SCROLL_DIV_TOP);

    overlayDiv.show();

    setTimeout(function() {
      var left, top;
      left = overlayDiv.scrollLeft(SCROLL_DIV_TRY_LEFT);
      top = overlayDiv.scrollTop(SCROLL_DIV_TRY_TOP);
      expect(left).toBe(SCROLL_DIV_TRY_LEFT);
      expect(top).toBe(SCROLL_DIV_TRY_TOP);

      setTimeout(function() {
        expect(div.scrollLeft).toBe(SCROLL_DIV_TRY_LEFT);
        expect(div.scrollTop).toBe(SCROLL_DIV_TRY_TOP);

        overlayDiv.hide(true);

        setTimeout(function() {
          expect(div.scrollLeft).toBe(SCROLL_DIV_TRY_LEFT);
          expect(div.scrollTop).toBe(SCROLL_DIV_TRY_TOP);

          done();
        }, 200);
      }, 200);
    }, 200);
  });

  it('updates scroll values DOC', function(done) {
    text.focus();
    window.scrollTo(SCROLL_DOC_LEFT, SCROLL_DOC_TOP);
    expect(window.pageXOffset).toBe(SCROLL_DOC_LEFT);
    expect(window.pageYOffset).toBe(SCROLL_DOC_TOP);
    // Contained element
    div.scrollLeft = SCROLL_DIV_LEFT;
    div.scrollTop = SCROLL_DIV_TOP;
    expect(div.scrollLeft).toBe(SCROLL_DIV_LEFT);
    expect(div.scrollTop).toBe(SCROLL_DIV_TOP);
    // focus
    expect(document.activeElement).toBe(text);

    overlayDoc.show();

    setTimeout(function() {
      var left, top;
      left = overlayDoc.scrollLeft(SCROLL_DOC_TRY_LEFT);
      top = overlayDoc.scrollTop(SCROLL_DOC_TRY_TOP);
      expect(left).toBe(SCROLL_DOC_TRY_LEFT);
      expect(top).toBe(SCROLL_DOC_TRY_TOP);
      // Contained element
      left = overlayDoc.scrollLeft(SCROLL_DIV_TRY_LEFT, div);
      top = overlayDoc.scrollTop(SCROLL_DIV_TRY_TOP, div);
      expect(left).toBe(SCROLL_DIV_TRY_LEFT);
      expect(top).toBe(SCROLL_DIV_TRY_TOP);

      setTimeout(function() {
        expect(window.pageXOffset).toBe(SCROLL_DOC_TRY_LEFT);
        expect(window.pageYOffset).toBe(SCROLL_DOC_TRY_TOP);
        // Contained element
        expect(div.scrollLeft).toBe(SCROLL_DIV_TRY_LEFT);
        expect(div.scrollTop).toBe(SCROLL_DIV_TRY_TOP);

        overlayDoc.hide(true);

        setTimeout(function() {
          expect(window.pageXOffset).toBe(SCROLL_DOC_TRY_LEFT);
          expect(window.pageYOffset).toBe(SCROLL_DOC_TRY_TOP);
          // Contained element
          expect(div.scrollLeft).toBe(SCROLL_DIV_TRY_LEFT);
          expect(div.scrollTop).toBe(SCROLL_DIV_TRY_TOP);
          // focus
          expect(document.activeElement).toBe(text);

          done();
        }, 200);
      }, 200);
    }, 200);
  });

});
