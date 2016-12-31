
describe('disableKeys()', function() {
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
    }, 'disableKeys()');
  });

  afterAll(function() {
    pageDone();
  });

  it('parses target and its nodes', function(done) {
    var elements = Array.prototype.slice.call(document.querySelectorAll('#target-wrap *')), // #target is included
      target = document.getElementById('target'),
      html = target.innerHTML,
      overlay = new PlainOverlay(target);

    overlay.show();
    expect(matchArray(window.targetNodes, elements)).toBe(true);
    expect(target.innerHTML).not.toBe(html);
    expect(target.innerHTML).toMatch(/tabindex="-1"/);
    expect(target.innerHTML).not.toMatch(/accesskey="x"/);

    overlay.hide(true);
    expect(target.innerHTML).toBe(html);
    expect(target.innerHTML).not.toMatch(/tabindex="-1"/);
    expect(target.innerHTML).toMatch(/accesskey="x"/);

    done();
  });

  it('parses nodes in body except body', function(done) {
    var elements = Array.prototype.slice.call(document.querySelectorAll('body *')), // body is not included
      target = document.body,
      html = target.innerHTML,
      overlay = new PlainOverlay();

    overlay.show();
    expect(matchArray(window.targetNodes, elements)).toBe(true);
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
