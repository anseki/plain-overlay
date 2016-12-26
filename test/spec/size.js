
describe('resizeTarget()', function() {
  'use strict';

  var window, document,
    PlainOverlay, insProps, pageDone,
    resizeTarget,
    WIDTH = 320, HEIGHT = 160;

  beforeAll(function(beforeDone) {
    loadPage('spec/size/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      insProps = window.insProps;
      resizeTarget = window.resizeTarget;
      pageDone = done;

      beforeDone();
    }, 'resizeTarget()');
  });

  afterAll(function() {
    pageDone();
  });

  // unit:none

  it('resizes element (unit:none, position:static, box-sizing:content-box)', function(done) {
    var element = document.querySelector('.unit01 > .static.content-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:none, position:static, box-sizing:padding-box)', function(done) {
    var element = document.querySelector('.unit01 > .static.padding-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:none, position:static, box-sizing:border-box)', function(done) {
    var element = document.querySelector('.unit01 > .static.border-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:none, position:absolute, box-sizing:content-box)', function(done) {
    var element = document.querySelector('.unit01 > .absolute.content-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:none, position:absolute, box-sizing:padding-box)', function(done) {
    var element = document.querySelector('.unit01 > .absolute.padding-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:none, position:absolute, box-sizing:border-box)', function(done) {
    var element = document.querySelector('.unit01 > .absolute.border-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  // unit:px

  it('resizes element (unit:px, position:static, box-sizing:content-box)', function(done) {
    var element = document.querySelector('.unit02 > .static.content-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:px, position:static, box-sizing:padding-box)', function(done) {
    var element = document.querySelector('.unit02 > .static.padding-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:px, position:static, box-sizing:border-box)', function(done) {
    var element = document.querySelector('.unit02 > .static.border-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:px, position:absolute, box-sizing:content-box)', function(done) {
    var element = document.querySelector('.unit02 > .absolute.content-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:px, position:absolute, box-sizing:padding-box)', function(done) {
    var element = document.querySelector('.unit02 > .absolute.padding-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:px, position:absolute, box-sizing:border-box)', function(done) {
    var element = document.querySelector('.unit02 > .absolute.border-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  // unit:em

  it('resizes element (unit:em, position:static, box-sizing:content-box)', function(done) {
    var element = document.querySelector('.unit03 > .static.content-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:em, position:static, box-sizing:padding-box)', function(done) {
    var element = document.querySelector('.unit03 > .static.padding-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:em, position:static, box-sizing:border-box)', function(done) {
    var element = document.querySelector('.unit03 > .static.border-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:em, position:absolute, box-sizing:content-box)', function(done) {
    var element = document.querySelector('.unit03 > .absolute.content-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:em, position:absolute, box-sizing:padding-box)', function(done) {
    var element = document.querySelector('.unit03 > .absolute.padding-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:em, position:absolute, box-sizing:border-box)', function(done) {
    var element = document.querySelector('.unit03 > .absolute.border-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  // unit:%

  it('resizes element (unit:%, position:static, box-sizing:content-box)', function(done) {
    var element = document.querySelector('.unit04 > .static.content-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:%, position:static, box-sizing:padding-box)', function(done) {
    var element = document.querySelector('.unit04 > .static.padding-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:%, position:static, box-sizing:border-box)', function(done) {
    var element = document.querySelector('.unit04 > .static.border-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:%, position:absolute, box-sizing:content-box)', function(done) {
    var element = document.querySelector('.unit04 > .absolute.content-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:%, position:absolute, box-sizing:padding-box)', function(done) {
    var element = document.querySelector('.unit04 > .absolute.padding-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:%, position:absolute, box-sizing:border-box)', function(done) {
    var element = document.querySelector('.unit04 > .absolute.border-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  // unit:auto

  it('resizes element (unit:auto, position:static, box-sizing:content-box)', function(done) {
    var element = document.querySelector('.unit05 > .static.content-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:auto, position:static, box-sizing:padding-box)', function(done) {
    var element = document.querySelector('.unit05 > .static.padding-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:auto, position:static, box-sizing:border-box)', function(done) {
    var element = document.querySelector('.unit05 > .static.border-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:auto, position:absolute, box-sizing:content-box)', function(done) {
    var element = document.querySelector('.unit05 > .absolute.content-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:auto, position:absolute, box-sizing:padding-box)', function(done) {
    var element = document.querySelector('.unit05 > .absolute.padding-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

  it('resizes element (unit:auto, position:absolute, box-sizing:border-box)', function(done) {
    var element = document.querySelector('.unit05 > .absolute.border-box > *'),
      overlay = new PlainOverlay(element),
      props = insProps[overlay._id],
      cmpStyle = window.getComputedStyle(element, ''),

      borderLeft = cmpStyle.borderLeft,
      paddingLeft = cmpStyle.paddingLeft,
      paddingRight = cmpStyle.paddingRight,
      borderRight = cmpStyle.borderRight,
      bBox;

    resizeTarget(props, WIDTH, HEIGHT);

    bBox = element.getBoundingClientRect();
    expect(Math.abs(bBox.width - WIDTH)).toBeLessThan(0.5);
    expect(Math.abs(bBox.height - HEIGHT)).toBeLessThan(0.5);

    // these are not changed.
    cmpStyle = window.getComputedStyle(element, '');
    expect(cmpStyle.borderLeft).toBe(borderLeft);
    expect(cmpStyle.paddingLeft).toBe(paddingLeft);
    expect(cmpStyle.paddingRight).toBe(paddingRight);
    expect(cmpStyle.borderRight).toBe(borderRight);

    done();
  });

});
