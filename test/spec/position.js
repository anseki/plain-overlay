
describe('position()', function() {
  'use strict';

  var window, document,
    PlainOverlay, insProps, pageDone,
    getBBox, iframe0102Window, iframe0304Window, iframe0102Document, iframe0304Document,
    TOLERANCE = 0.5;

  function testFace(document) {
    var face = document.createElement('div'),
      style = face.style;
    style.boxSizing = 'border-box';
    style.width = style.height = '100%';
    style.border = '1px solid red';
    return face;
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/position/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      insProps = window.insProps;
      getBBox = window.getBBox;
      iframe0102Window = pageDocument.getElementById('case-01-02').contentWindow;
      iframe0304Window = pageDocument.getElementById('case-03-04').contentWindow;
      iframe0102Document = iframe0102Window.document;
      iframe0304Document = iframe0304Window.document;
      pageDone = done;

      beforeDone();
    }, 'position()');
  });

  afterAll(function() {
    pageDone();
  });

  it('body{position:static}, target{position:static}', function(done) {
    var target = iframe0102Document.getElementById('case-01'),
      overlay = new PlainOverlay(target, {face: testFace(document)}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, iframe0102Window),
      bBoxOverlay, overlayCmpStyle;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    expect(Math.abs(bBoxTarget.left - 16)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - 32)).toBeLessThan(TOLERANCE);
    // relative to document
    expect(Math.abs(parseFloat(overlayCmpStyle.left) - 16)).toBeLessThan(TOLERANCE);
    expect(Math.abs(parseFloat(overlayCmpStyle.top) - 32)).toBeLessThan(TOLERANCE);

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('body{position:static}, target{position:absolute}', function(done) {
    var target = iframe0102Document.getElementById('case-02'),
      overlay = new PlainOverlay(target, {face: testFace(document)}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, iframe0102Window),
      bBoxOverlay, overlayCmpStyle;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    expect(Math.abs(bBoxTarget.left - 64)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - 128)).toBeLessThan(TOLERANCE);
    // relative to document
    expect(Math.abs(parseFloat(overlayCmpStyle.left) - 64)).toBeLessThan(TOLERANCE);
    expect(Math.abs(parseFloat(overlayCmpStyle.top) - 128)).toBeLessThan(TOLERANCE);

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('body{position:relative}, target{position:static}', function(done) {
    var target = iframe0304Document.getElementById('case-03'),
      overlay = new PlainOverlay(target, {face: testFace(document)}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, iframe0304Window),
      bBoxOverlay, overlayCmpStyle;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    expect(Math.abs(bBoxTarget.left - 16)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - 32)).toBeLessThan(TOLERANCE);
    // relative to body
    expect(Math.abs(parseFloat(overlayCmpStyle.left))).toBeLessThan(TOLERANCE);
    expect(Math.abs(parseFloat(overlayCmpStyle.top))).toBeLessThan(TOLERANCE);

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('body{position:relative}, target{position:absolute}', function(done) {
    var target = iframe0304Document.getElementById('case-04'),
      overlay = new PlainOverlay(target, {face: testFace(document)}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, iframe0304Window),
      bBoxOverlay, overlayCmpStyle;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    expect(Math.abs(bBoxTarget.left - 64)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - 128)).toBeLessThan(TOLERANCE);
    // relative to body
    expect(Math.abs(parseFloat(overlayCmpStyle.left) - 48)).toBeLessThan(TOLERANCE);
    expect(Math.abs(parseFloat(overlayCmpStyle.top) - 96)).toBeLessThan(TOLERANCE);

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('position:static', function(done) {
    var target = document.querySelector('#case-05 .target'),
      overlay = new PlainOverlay(target, {face: testFace(document)}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('position:absolute', function(done) {
    var target = document.querySelector('#case-06 .target'),
      overlay = new PlainOverlay(target, {face: testFace(document)}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('border:3px', function(done) {
    var target = document.querySelector('#case-07 .target'),
      overlay = new PlainOverlay(target, {face: testFace(document)}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);

    // border: 3px
    bBoxTarget.left += 3;
    bBoxTarget.top += 3;
    bBoxTarget.width -= 3 + 3;
    bBoxTarget.height -= 3 + 3;

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('border:1px 2px 4px 8px', function(done) {
    var target = document.querySelector('#case-08 .target'),
      overlay = new PlainOverlay(target, {face: testFace(document)}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);

    // border: 1px 2px 4px 8px
    bBoxTarget.left += 8;
    bBoxTarget.top += 1;
    bBoxTarget.width -= 8 + 2;
    bBoxTarget.height -= 1 + 4;

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });


});
