
describe('disableAccKeys()', function() {
  'use strict';

  var window, document,
    PlainOverlay, pageDone;

  function matchArray(array1, array2) {
    return array1.length === array2.length &&
      array1.every(function(value1, i) { return value1 === array2[i]; });
  }

  beforeEach(function(beforeDone) {
    loadPage('spec/keys.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      pageDone = done;

      beforeDone();
    });
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function(done) {
    expect(!!window.PlainOverlay.limit).toBe(!!self.top.LIMIT);

    pageDone();
    done();
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

    window.setTitle('disableAccKeys() #target');
    pageDone();
    done();
  });

  it('parses tree in body except overlay', function(done) {
    var elements = Array.prototype.slice.call(document.querySelectorAll('html, body, body *')),
      target = document.body,
      html = target.innerHTML,
      overlay = new PlainOverlay(),
      saveElement1, saveElement2;

    overlay.show();
    expect(matchArray(window.targetElements, elements)).toBe(true);
    saveElement1 = target.removeChild(PlainOverlay.insProps[overlay._id].elmOverlay);
    if (!self.top.LIMIT) {
      saveElement2 = target.removeChild(document.getElementById('plainoverlay-builtin-face-defs'));
    }
    expect(target.innerHTML).not.toBe(html);
    expect(target.innerHTML).toMatch(/tabindex="-1"/);
    expect(target.innerHTML).not.toMatch(/accesskey="x"/);
    target.appendChild(saveElement1);
    if (!self.top.LIMIT) {
      target.appendChild(saveElement2);
    }

    overlay.hide(true);
    saveElement1 = target.removeChild(PlainOverlay.insProps[overlay._id].elmOverlay);
    if (!self.top.LIMIT) {
      saveElement2 = target.removeChild(document.getElementById('plainoverlay-builtin-face-defs'));
    }
    expect(target.innerHTML).toBe(html);
    expect(target.innerHTML).not.toMatch(/tabindex="-1"/);
    expect(target.innerHTML).toMatch(/accesskey="x"/);

    window.setTitle('disableAccKeys() body');
    pageDone();
    done();
  });

});
