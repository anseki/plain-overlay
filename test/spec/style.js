
describe('style', function() {
  'use strict';

  var window, document, frmWindow, frmDocument,
    PlainOverlay, insProps, pageDone,
    overlay1, overlay2, frmOverlay1, frmOverlay2;

  beforeAll(function(beforeDone) {
    loadPage('spec/style/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      frmWindow = document.getElementById('iframe1').contentWindow;
      frmDocument = frmWindow.document;
      PlainOverlay = window.PlainOverlay;
      insProps = window.insProps;
      pageDone = done;

      beforeDone();
    }, 'style');
  });

  afterAll(function() {
    pageDone();
  });

  it('adds single element', function(done) {
    expect(document.getElementsByTagName('style').length).toBe(0);
    overlay1 = new PlainOverlay(document.getElementById('elm-1')); // <style> is added
    expect(document.getElementsByTagName('style').length).toBe(1);
    overlay2 = new PlainOverlay(document.getElementById('elm-2')); // <style> is not added
    expect(document.getElementsByTagName('style').length).toBe(1);
    done();
  });

  it('adds single element into upper of head', function(done) {
    expect(frmDocument.getElementsByTagName('style').length).toBe(1);
    frmOverlay1 = new PlainOverlay(frmDocument.getElementById('elm-1')); // <style> is added
    expect(frmDocument.getElementsByTagName('style').length).toBe(2);
    frmOverlay2 = new PlainOverlay(frmDocument.getElementById('elm-2')); // <style> is not added
    expect(frmDocument.getElementsByTagName('style').length).toBe(2);
    done();
  });

  it('applies default style', function() {
    // Trident returns zIndex as number
    expect(window.getComputedStyle(insProps[overlay1._id].elmOverlay, '').zIndex + '').toBe('9000');
    expect(window.getComputedStyle(insProps[overlay1._id].elmOverlay, '').cursor).toBe('wait');
    expect(window.getComputedStyle(insProps[overlay2._id].elmOverlay, '').zIndex + '').toBe('9000');
    expect(window.getComputedStyle(insProps[overlay2._id].elmOverlay, '').cursor).toBe('wait');
  });

  it('applies style that is merged default and additional', function(done) {
    function test() {
      // Trident returns zIndex as number
      expect(frmWindow.getComputedStyle(insProps[frmOverlay1._id].elmOverlay, '').zIndex + '').toBe('9000');
      expect(frmWindow.getComputedStyle(insProps[frmOverlay1._id].elmOverlay, '').cursor).toBe('pointer');
      expect(frmWindow.getComputedStyle(insProps[frmOverlay2._id].elmOverlay, '').zIndex + '').toBe('9000');
      expect(frmWindow.getComputedStyle(insProps[frmOverlay2._id].elmOverlay, '').cursor).toBe('pointer');
      done();
    }

    if (window.IS_TRIDENT || window.IS_EDGE) {
      // Wait for forceReflow() to finish.
      setTimeout(test, 10);
    } else {
      test();
    }
  });

});
