
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
    style.border = '1px solid lawngreen';
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

  it('radius:16px', function(done) {
    var target = document.querySelector('#case-09 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('16px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('16px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('16px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('16px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('radius:16px, border:10px', function(done) {
    var target = document.querySelector('#case-10 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 10px
    bBoxTarget.left += 10;
    bBoxTarget.top += 10;
    bBoxTarget.width -= 10 + 10;
    bBoxTarget.height -= 10 + 10;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('6px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('6px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('6px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('6px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('top-left-radius:60px 40px, border:20px', function(done) {
    var target = document.querySelector('#case-11 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += 20;
    bBoxTarget.top += 20;
    bBoxTarget.width -= 20 + 20;
    bBoxTarget.height -= 20 + 20;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('40px 20px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('top-right-radius:60px 40px, border:20px', function(done) {
    var target = document.querySelector('#case-12 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += 20;
    bBoxTarget.top += 20;
    bBoxTarget.width -= 20 + 20;
    bBoxTarget.height -= 20 + 20;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('0px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('40px 20px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('bottom-right-radius:60px 40px, border:20px', function(done) {
    var target = document.querySelector('#case-13 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += 20;
    bBoxTarget.top += 20;
    bBoxTarget.width -= 20 + 20;
    bBoxTarget.height -= 20 + 20;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('0px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('40px 20px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('bottom-left-radius:60px 40px, border:20px', function(done) {
    var target = document.querySelector('#case-14 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += 20;
    bBoxTarget.top += 20;
    bBoxTarget.width -= 20 + 20;
    bBoxTarget.height -= 20 + 20;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('0px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('40px 20px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('radius:60px/40px, border-left:20px, border-top:20px', function(done) {
    var target = document.querySelector('#case-15 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle,

      borderLeft = 20, borderTop = 20;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += borderLeft;
    bBoxTarget.top += borderTop;
    bBoxTarget.width -= borderLeft;
    bBoxTarget.height -= borderTop;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('40px 20px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('radius:60px/40px, border-left:20px, border-top:40px', function(done) {
    var target = document.querySelector('#case-16 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle,

      borderLeft = 20, borderTop = 40;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += borderLeft;
    bBoxTarget.top += borderTop;
    bBoxTarget.width -= borderLeft;
    bBoxTarget.height -= borderTop;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('0px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('radius:60px/40px, border-left:20px, border-top:45px', function(done) {
    var target = document.querySelector('#case-17 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle,

      borderLeft = 20, borderTop = 45;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += borderLeft;
    bBoxTarget.top += borderTop;
    bBoxTarget.width -= borderLeft;
    bBoxTarget.height -= borderTop;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('0px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('radius:60px/40px, border-left:60px, border-top:20px', function(done) {
    var target = document.querySelector('#case-18 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle,

      borderLeft = 60, borderTop = 20;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += borderLeft;
    bBoxTarget.top += borderTop;
    bBoxTarget.width -= borderLeft;
    bBoxTarget.height -= borderTop;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('0px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('radius:60px/40px, border-left:60px, border-top:40px', function(done) {
    var target = document.querySelector('#case-19 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle,

      borderLeft = 60, borderTop = 40;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += borderLeft;
    bBoxTarget.top += borderTop;
    bBoxTarget.width -= borderLeft;
    bBoxTarget.height -= borderTop;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('0px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('radius:60px/40px, border-left:60px, border-top:45px', function(done) {
    var target = document.querySelector('#case-20 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle,

      borderLeft = 60, borderTop = 45;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += borderLeft;
    bBoxTarget.top += borderTop;
    bBoxTarget.width -= borderLeft;
    bBoxTarget.height -= borderTop;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('0px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('radius:60px/40px, border-left:65px, border-top:20px', function(done) {
    var target = document.querySelector('#case-21 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle,

      borderLeft = 65, borderTop = 20;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += borderLeft;
    bBoxTarget.top += borderTop;
    bBoxTarget.width -= borderLeft;
    bBoxTarget.height -= borderTop;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('0px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('radius:60px/40px, border-left:65px, border-top:40px', function(done) {
    var target = document.querySelector('#case-22 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle,

      borderLeft = 65, borderTop = 40;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += borderLeft;
    bBoxTarget.top += borderTop;
    bBoxTarget.width -= borderLeft;
    bBoxTarget.height -= borderTop;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('0px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

  it('radius:60px/40px, border-left:65px, border-top:45px', function(done) {
    var target = document.querySelector('#case-23 .target'),
      overlay = new PlainOverlay(target, {face: false}),
      props = insProps[overlay._id],
      bBoxTarget = getBBox(target, window),
      bBoxOverlay, overlayCmpStyle,

      borderLeft = 65, borderTop = 45;

    overlay.show();
    bBoxOverlay = getBBox(props.elmOverlay, props.window);
    overlayCmpStyle = props.window.getComputedStyle(props.elmOverlay, '');

    // border: 20px
    bBoxTarget.left += borderLeft;
    bBoxTarget.top += borderTop;
    bBoxTarget.width -= borderLeft;
    bBoxTarget.height -= borderTop;

    // border-radius
    expect(overlayCmpStyle.borderTopLeftRadius).toBe('0px');
    expect(overlayCmpStyle.borderTopRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomRightRadius).toBe('0px');
    expect(overlayCmpStyle.borderBottomLeftRadius).toBe('0px');

    expect(Math.abs(bBoxTarget.left - bBoxOverlay.left)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.top - bBoxOverlay.top)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.width - bBoxOverlay.width)).toBeLessThan(TOLERANCE);
    expect(Math.abs(bBoxTarget.height - bBoxOverlay.height)).toBeLessThan(TOLERANCE);

    done();
  });

});
