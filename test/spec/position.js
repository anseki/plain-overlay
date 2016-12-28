
describe('position()', function() {
  'use strict';

  var window, document,
    PlainOverlay, insProps, pageDone,
    TOLERANCE = 0.5;

  beforeAll(function(beforeDone) {
    loadPage('spec/position/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      insProps = window.insProps;
      pageDone = done;

      beforeDone();
    }, 'position()');
  });

  afterAll(function() {
    pageDone();
  });

  (function() {
    var id = '#case-01', title = 'isDoc:false, canScroll:false, position:static';
    it(title, function(done) {
      var target = document.querySelector(id + ' .target'),
        head = document.querySelector(id + ' .head'),
        overlay = new PlainOverlay(target),
        props = insProps[overlay._id],
        bBoxTarget = target.getBoundingClientRect(),
        bBoxOverlayBody;

      head.textContent = title;
      overlay.show();

      expect(props.isDoc).toBe(false);
      expect(props.canScroll).toBe(false);

      bBoxOverlayBody = props.elmOverlayBody.getBoundingClientRect();
      expect(Math.abs(bBoxTarget.width - bBoxOverlayBody.width)).toBeLessThan(TOLERANCE);
      expect(Math.abs(bBoxTarget.height - bBoxOverlayBody.height)).toBeLessThan(TOLERANCE);
      expect(Math.abs(bBoxTarget.left - bBoxOverlayBody.left)).toBeLessThan(TOLERANCE);
      expect(Math.abs(bBoxTarget.top - bBoxOverlayBody.top)).toBeLessThan(TOLERANCE);

      done();
    });
  })();

  (function() {
    var id = '#case-02', title = 'isDoc:false, canScroll:false, position:relative';
    it(title, function(done) {
      var target = document.querySelector(id + ' .target'),
        head = document.querySelector(id + ' .head'),
        overlay = new PlainOverlay(target),
        props = insProps[overlay._id],
        bBoxTarget = target.getBoundingClientRect(),
        bBoxOverlayBody;

      head.textContent = title;
      overlay.show();

      expect(props.isDoc).toBe(false);
      expect(props.canScroll).toBe(false);

      bBoxOverlayBody = props.elmOverlayBody.getBoundingClientRect();
      expect(Math.abs(bBoxTarget.width - bBoxOverlayBody.width)).toBeLessThan(TOLERANCE);
      expect(Math.abs(bBoxTarget.height - bBoxOverlayBody.height)).toBeLessThan(TOLERANCE);
      expect(Math.abs(bBoxTarget.left - bBoxOverlayBody.left)).toBeLessThan(TOLERANCE);
      expect(Math.abs(bBoxTarget.top - bBoxOverlayBody.top)).toBeLessThan(TOLERANCE);

      done();
    });
  })();

  (function() {
    var id = '#case-03', title = 'isDoc:false, canScroll:false, position:absolute';
    it(title, function(done) {
      var target = document.querySelector(id + ' .target'),
        head = document.querySelector(id + ' .head'),
        overlay = new PlainOverlay(target),
        props = insProps[overlay._id],
        bBoxTarget = target.getBoundingClientRect(),
        bBoxOverlayBody;

      head.textContent = title;
      overlay.show();

      expect(props.isDoc).toBe(false);
      expect(props.canScroll).toBe(false);

      bBoxOverlayBody = props.elmOverlayBody.getBoundingClientRect();
      expect(Math.abs(bBoxTarget.width - bBoxOverlayBody.width)).toBeLessThan(TOLERANCE);
      expect(Math.abs(bBoxTarget.height - bBoxOverlayBody.height)).toBeLessThan(TOLERANCE);
      expect(Math.abs(bBoxTarget.left - bBoxOverlayBody.left)).toBeLessThan(TOLERANCE);
      expect(Math.abs(bBoxTarget.top - bBoxOverlayBody.top)).toBeLessThan(TOLERANCE);

      done();
    });
  })();


});
