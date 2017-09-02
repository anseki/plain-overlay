
describe('options', function() {
  'use strict';

  var window, document, PlainOverlay, pageDone;

  beforeAll(function(beforeDone) {
    loadPage('spec/common/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      pageDone = done;

      beforeDone();
    });
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainOverlay.limit).toBe(!!self.top.LIMIT);
  });

  it('face', function(done) {
    var overlay = new PlainOverlay(document.getElementById('elm-plain'));

    // default
    expect(typeof overlay.face).toBe('undefined');

    // Update - element
    var face = document.getElementById('elm-plain2');
    overlay.face = face;
    expect(overlay.face).toBe(face);

    // Update - false
    overlay.face = false;
    expect(overlay.face).toBe(false);

    // Update - default
    overlay.face = null;
    expect(typeof overlay.face).toBe('undefined');

    // Invalid -> ignored
    overlay.face = face;
    expect(overlay.face).toBe(face);
    overlay.face = 5;
    expect(overlay.face).toBe(face);

    // Another option -> ignored face
    overlay.face = face;
    expect(overlay.face).toBe(face);
    overlay.duration = 5;
    expect(overlay.face).toBe(face);

    done();
  });

  it('duration', function(done) {
    var overlay = new PlainOverlay(document.getElementById('elm-plain'));

    // default
    expect(overlay.duration).toBe(200);

    // Update
    overlay.duration = 300;
    expect(overlay.duration).toBe(300);

    // Update - default
    overlay.duration = 200;
    expect(overlay.duration).toBe(200);

    // Invalid -> ignored
    overlay.duration = 400;
    expect(overlay.duration).toBe(400);
    overlay.duration = false;
    expect(overlay.duration).toBe(400);

    // Another option -> ignored duration
    overlay.duration = 400;
    expect(overlay.duration).toBe(400);
    overlay.blur = 5;
    expect(overlay.duration).toBe(400);

    done();
  });

  it('blur', function(done) {
    var overlay = new PlainOverlay(document.getElementById('elm-plain'));

    // default
    expect(overlay.blur).toBe(false);

    // Update
    overlay.blur = 2;
    expect(overlay.blur).toBe(2);

    // Update - default
    overlay.blur = false;
    expect(overlay.blur).toBe(false);

    // Invalid -> ignored
    overlay.blur = 3;
    expect(overlay.blur).toBe(3);
    overlay.blur = 'x';
    expect(overlay.blur).toBe(3);

    // Another option -> ignored blur
    overlay.blur = 3;
    expect(overlay.blur).toBe(3);
    overlay.duration = 5;
    expect(overlay.blur).toBe(3);

    done();
  });

  it('onShow', function(done) {
    var overlay = new PlainOverlay(document.getElementById('elm-plain'));

    function fnc() {}

    // default
    expect(typeof overlay.onShow).toBe('undefined');

    // Update
    overlay.onShow = fnc;
    expect(overlay.onShow).toBe(fnc);

    // Update - default
    overlay.onShow = null;
    expect(typeof overlay.onShow).toBe('undefined');

    // Invalid -> ignored
    overlay.onShow = fnc;
    expect(overlay.onShow).toBe(fnc);
    overlay.onShow = 5;
    expect(overlay.onShow).toBe(fnc);

    // Another option -> ignored onShow
    overlay.onShow = fnc;
    expect(overlay.onShow).toBe(fnc);
    overlay.duration = 5;
    expect(overlay.onShow).toBe(fnc);

    done();
  });

  it('onHide', function(done) {
    var overlay = new PlainOverlay(document.getElementById('elm-plain'));

    function fnc() {}

    // default
    expect(typeof overlay.onHide).toBe('undefined');

    // Update
    overlay.onHide = fnc;
    expect(overlay.onHide).toBe(fnc);

    // Update - default
    overlay.onHide = null;
    expect(typeof overlay.onHide).toBe('undefined');

    // Invalid -> ignored
    overlay.onHide = fnc;
    expect(overlay.onHide).toBe(fnc);
    overlay.onHide = 5;
    expect(overlay.onHide).toBe(fnc);

    // Another option -> ignored onHide
    overlay.onHide = fnc;
    expect(overlay.onHide).toBe(fnc);
    overlay.duration = 5;
    expect(overlay.onHide).toBe(fnc);

    done();
  });

  it('onBeforeShow', function(done) {
    var overlay = new PlainOverlay(document.getElementById('elm-plain'));

    function fnc() {}

    // default
    expect(typeof overlay.onBeforeShow).toBe('undefined');

    // Update
    overlay.onBeforeShow = fnc;
    expect(overlay.onBeforeShow).toBe(fnc);

    // Update - default
    overlay.onBeforeShow = null;
    expect(typeof overlay.onBeforeShow).toBe('undefined');

    // Invalid -> ignored
    overlay.onBeforeShow = fnc;
    expect(overlay.onBeforeShow).toBe(fnc);
    overlay.onBeforeShow = 5;
    expect(overlay.onBeforeShow).toBe(fnc);

    // Another option -> ignored onBeforeShow
    overlay.onBeforeShow = fnc;
    expect(overlay.onBeforeShow).toBe(fnc);
    overlay.duration = 5;
    expect(overlay.onBeforeShow).toBe(fnc);

    done();
  });

  it('onBeforeHide', function(done) {
    var overlay = new PlainOverlay(document.getElementById('elm-plain'));

    function fnc() {}

    // default
    expect(typeof overlay.onBeforeHide).toBe('undefined');

    // Update
    overlay.onBeforeHide = fnc;
    expect(overlay.onBeforeHide).toBe(fnc);

    // Update - default
    overlay.onBeforeHide = null;
    expect(typeof overlay.onBeforeHide).toBe('undefined');

    // Invalid -> ignored
    overlay.onBeforeHide = fnc;
    expect(overlay.onBeforeHide).toBe(fnc);
    overlay.onBeforeHide = 5;
    expect(overlay.onBeforeHide).toBe(fnc);

    // Another option -> ignored onBeforeHide
    overlay.onBeforeHide = fnc;
    expect(overlay.onBeforeHide).toBe(fnc);
    overlay.duration = 5;
    expect(overlay.onBeforeHide).toBe(fnc);

    done();
  });

  it('onPosition', function(done) {
    var overlay = new PlainOverlay(document.getElementById('elm-plain'));

    function fnc() {}

    // default
    expect(typeof overlay.onPosition).toBe('undefined');

    // Update
    overlay.onPosition = fnc;
    expect(overlay.onPosition).toBe(fnc);

    // Update - default
    overlay.onPosition = null;
    expect(typeof overlay.onPosition).toBe('undefined');

    // Invalid -> ignored
    overlay.onPosition = fnc;
    expect(overlay.onPosition).toBe(fnc);
    overlay.onPosition = 5;
    expect(overlay.onPosition).toBe(fnc);

    // Another option -> ignored onPosition
    overlay.onPosition = fnc;
    expect(overlay.onPosition).toBe(fnc);
    overlay.duration = 5;
    expect(overlay.onPosition).toBe(fnc);

    done();
  });

});
