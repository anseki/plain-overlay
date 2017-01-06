
describe('disableAccKeys()', function() {
  'use strict';

  var window, document,
    PlainOverlay, pageDone;

  function matchArray(array1, array2) {
    return array1.length === array2.length &&
      array1.every(function(value1, i) { return value1 === array2[i]; });
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/keys/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      pageDone = done;

      beforeDone();
    }, 'disableAccKeys()');
  });

  afterAll(function() {
    pageDone();
  });

  it('parses target and its tree', function(done) {
    var elements = Array.prototype.slice.call(document.querySelectorAll('#target, #target *')),
      target = document.getElementById('target'),
      html = target.innerHTML,
      overlay = new PlainOverlay(target);

    overlay.show();
    expect(matchArray(window.targetElements, elements)).toBe(true);
    expect(target.innerHTML).not.toBe(html);
    expect(target.innerHTML).toMatch(/tabindex="-1"/);
    expect(target.innerHTML).not.toMatch(/accesskey="x"/);

    overlay.hide(true);
    expect(target.innerHTML).toBe(html);
    expect(target.innerHTML).not.toMatch(/tabindex="-1"/);
    expect(target.innerHTML).toMatch(/accesskey="x"/);

    done();
  });

  it('parses tree in body except overlay', function(done) {
    var elements = Array.prototype.slice.call(document.querySelectorAll('html, body *')),
      target = document.body,
      html = target.innerHTML,
      overlay = new PlainOverlay();

    overlay.show();
    expect(matchArray(window.targetElements, elements)).toBe(true);
    expect(target.innerHTML).not.toBe(html);
    expect(target.innerHTML).toMatch(/tabindex="-1"/);
    expect(target.innerHTML).not.toMatch(/accesskey="x"/);

    overlay.hide(true);
    target.removeChild(window.insProps[overlay._id].elmOverlay);
    expect(target.innerHTML).toBe(html);
    expect(target.innerHTML).not.toMatch(/tabindex="-1"/);
    expect(target.innerHTML).toMatch(/accesskey="x"/);

    done();
  });

});
