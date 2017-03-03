
describe('disableDocBars()', function() {
  'use strict';

  var window, document,
    PlainOverlay, insProps, pageDone,
    IS_TRIDENT, IS_GECKO, IS_EDGE,
    table, barSize,

    BAR_CASES = { // class
      'none:none': [],
      'right:none': ['height'],
      'left:none': ['height', 'bar-left'],
      'none:bottom': ['width'],
      'right:bottom': ['height', 'width'],
      'left:bottom': ['height', 'bar-left', 'width'],
      'none:top': ['width', 'bar-top'],
      'right:top': ['height', 'width', 'bar-top'],
      'left:top': ['height', 'bar-left', 'width', 'bar-top']
    },
    BODY_MARGIN = 10,
    DIR_KEYS = [
      {l: 'right', u: 'Right'},
      {l: 'left', u: 'Left'},
      {l: 'bottom', u: 'Bottom'},
      {l: 'top', u: 'Top'}
    ];

  function addTarget(label, classes, cb) {
    var tr = table.appendChild(document.createElement('tr')),
      iframe, iframeBefore;
    tr.appendChild(document.createElement('td')).textContent = label;

    iframeBefore = tr.appendChild(document.createElement('td')).appendChild(document.createElement('iframe'));
    iframe = tr.appendChild(document.createElement('td')).appendChild(document.createElement('iframe'));

    iframe.addEventListener('load', function() {
      if (IS_TRIDENT) { iframe.contentDocument.documentElement.classList.add('is-trident'); }
      if (IS_EDGE) { iframe.contentDocument.documentElement.classList.add('is-edge'); }
      cb(iframe);
    });
    iframeBefore.addEventListener('load', function() {
      if (IS_TRIDENT) { iframeBefore.contentDocument.documentElement.classList.add('is-trident'); }
      if (IS_EDGE) { iframeBefore.contentDocument.documentElement.classList.add('is-edge'); }
    });
    iframe.src = iframeBefore.src = 'page-c1.html' + (classes.length ? '?' + classes.join('&') : '');
  }

  function addTest(caseKey, addMargin, iframeMargin) {
    var barCase = BAR_CASES[caseKey], label = caseKey + (addMargin ? ' +margin' : '');
    it(label, function(done) {
      addTarget(label, addMargin ? barCase.concat('margin') : barCase, function(iframe) {
        var overlay = PlainOverlay.show(iframe),
          iframeBody = iframe.contentDocument.body,
          iframeMarginLen = {},
          styleIFrame = window.getComputedStyle(iframeBody, '');

        // To get it after `beforeAll`.
        if (typeof iframeMargin === 'function') { iframeMargin = iframeMargin(); }
        DIR_KEYS.forEach(function(dirKey) {
          iframeMarginLen[dirKey.l] = (iframeMargin[dirKey.l] ? barSize : 0) + (addMargin ? BODY_MARGIN : 0);
        });

        // Check elements
        expect(insProps[overlay._id].elmTargetBody).toBe(iframeBody);

        expect(parseFloat(styleIFrame['margin' + DIR_KEYS[0].u])).toBe(iframeMarginLen[DIR_KEYS[0].l]);
        expect(parseFloat(styleIFrame['margin' + DIR_KEYS[1].u])).toBe(iframeMarginLen[DIR_KEYS[1].l]);
        expect(parseFloat(styleIFrame['margin' + DIR_KEYS[2].u])).toBe(iframeMarginLen[DIR_KEYS[2].l]);
        expect(parseFloat(styleIFrame['margin' + DIR_KEYS[3].u])).toBe(iframeMarginLen[DIR_KEYS[3].l]);

        done();
      });
    });
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/bars/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      insProps = window.insProps;
      IS_TRIDENT = window.IS_TRIDENT;
      IS_GECKO = window.IS_GECKO;
      IS_EDGE = window.IS_EDGE;
      table = document.getElementById('targets');

      if (IS_TRIDENT) { pageDocument.documentElement.classList.add('is-trident'); }
      if (IS_EDGE) { pageDocument.documentElement.classList.add('is-edge'); }

      var elmSize = document.getElementById('get-size');
      barSize = -elmSize.clientWidth;
      elmSize.style.overflow = 'hidden';
      barSize += elmSize.clientWidth;
      pageBody.removeChild(elmSize);
      pageDone = done;

      beforeDone();
    }, 'disableDocBars()');
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainOverlay.limit).toBe(!!self.top.LIMIT);
  });

  [false, true].forEach(function(addMargin) {
    var normal = {right: true, bottom: true};
    addTest('none:none', addMargin, {});
    addTest('right:none', addMargin, {right: true});
    addTest('left:none', addMargin,
      function() { return IS_TRIDENT || IS_EDGE ? {left: true} : {right: true}; });
    addTest('none:bottom', addMargin, {bottom: true});
    addTest('right:bottom', addMargin, normal);
    addTest('left:bottom', addMargin,
      function() { return IS_TRIDENT || IS_EDGE ? {left: true, bottom: true} : normal; });
    addTest('none:top', addMargin,
      function() {
        return IS_TRIDENT || IS_EDGE ? {top: true} :
          IS_GECKO ? {} : {bottom: true}; // Gecko bug, it does not make bottom-bar.
      });
    addTest('right:top', addMargin,
      function() {
        return IS_TRIDENT || IS_EDGE ? {right: true, top: true} :
          IS_GECKO ? {right: true} : normal; // Gecko bug, it does not make bottom-bar.
      });
    addTest('left:top', addMargin,
      function() {
        return IS_TRIDENT || IS_EDGE ? {left: true, top: true} :
          IS_GECKO ? {right: true} : normal; // Gecko bug, it does not make bottom-bar.
      });
  });

});
