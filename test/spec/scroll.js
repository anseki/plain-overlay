
describe('scroll', function() {
  'use strict';

  var window, document,
    PlainOverlay, insProps, pageDone,
    IS_TRIDENT, IS_BLINK, IS_GECKO, IS_EDGE,
    disableScroll, table, barSize,

    BAR_CASES = {
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
      div, iframe, divTest, iframeTest;
    tr.appendChild(document.createElement('td')).textContent = label;

    divTest = tr.appendChild(document.createElement('td')).appendChild(document.createElement('div'));
    iframeTest = tr.appendChild(document.createElement('td')).appendChild(document.createElement('iframe'));
    div = tr.appendChild(document.createElement('td')).appendChild(document.createElement('div'));
    iframe = tr.appendChild(document.createElement('td')).appendChild(document.createElement('iframe'));

    div.innerHTML = divTest.innerHTML = '<div class="spacer"></div>';
    if (classes.length) { div.className = divTest.className = classes.join(' '); }
    iframe.addEventListener('load', function() {
      if (IS_TRIDENT) { iframe.contentDocument.documentElement.classList.add('is-trident'); }
      if (IS_EDGE) { iframe.contentDocument.documentElement.classList.add('is-edge'); }
      cb(div, iframe);
    });
    iframeTest.addEventListener('load', function() {
      if (IS_TRIDENT) { iframeTest.contentDocument.documentElement.classList.add('is-trident'); }
      if (IS_EDGE) { iframeTest.contentDocument.documentElement.classList.add('is-edge'); }
    });
    iframe.src = iframeTest.src = 'page-c1.html' + (classes.length ? '?' + classes.join('&') : '');
  }

  function addTest(caseKey, addMargin, divMargin, iframeMargin) {
    var barCase = BAR_CASES[caseKey], label = caseKey + (addMargin ? ' +margin' : '');
    it(label, function(done) {
      addTarget(label, addMargin ? barCase.concat('margin') : barCase, function(div, iframe) {
        var overlayDiv = new PlainOverlay(div),
          overlayIFrame = new PlainOverlay(iframe),
          iframeBody = iframe.contentDocument.body,
          divMarginLen = {}, iframeMarginLen = {}, styleDiv, styleIFrame;

        // To get it after `beforeAll`.
        if (typeof divMargin === 'function') { divMargin = divMargin(); }
        if (typeof iframeMargin === 'function') { iframeMargin = iframeMargin(); }

        DIR_KEYS.forEach(function(dirKey) {
          divMarginLen[dirKey.l] = (divMargin[dirKey.l] ? barSize : 0) + (addMargin ? BODY_MARGIN : 0);
          iframeMarginLen[dirKey.l] = (iframeMargin[dirKey.l] ? barSize : 0) + (addMargin ? BODY_MARGIN : 0);
        });

        disableScroll(insProps[overlayDiv._id]);
        disableScroll(insProps[overlayIFrame._id]);
        styleDiv = window.getComputedStyle(div, '');
        styleIFrame = window.getComputedStyle(iframeBody, '');

        // Check elements
        expect(insProps[overlayDiv._id].elmTargetBody).toBe(div);
        expect(insProps[overlayIFrame._id].elmTargetBody).toBe(iframeBody);

        DIR_KEYS.forEach(function(dirKey) {
          expect(parseFloat(styleDiv['padding' + dirKey.u])).toBe(divMarginLen[dirKey.l]);
          expect(parseFloat(styleIFrame['margin' + dirKey.u])).toBe(iframeMarginLen[dirKey.l]);
        });

        done();
      });
    });
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/scroll/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      insProps = window.insProps;
      disableScroll = window.disableScroll;
      IS_TRIDENT = window.IS_TRIDENT;
      IS_BLINK = window.IS_BLINK;
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
    }, 'scroll');
  });

  afterAll(function() {
    pageDone();
  });

  [false, true].forEach(function(addMargin) {
    var normal = {right: true, bottom: true};
    addTest('none:none', addMargin, {}, {});
    addTest('right:none', addMargin, {right: true}, {right: true});
    addTest('left:none', addMargin, {left: true},
      function() { return IS_TRIDENT || IS_EDGE ? {left: true} : {right: true}; });
    addTest('none:bottom', addMargin, {bottom: true}, {bottom: true});
    addTest('right:bottom', addMargin, normal, normal);
    addTest('left:bottom', addMargin, {left: true, bottom: true},
      function() { return IS_TRIDENT || IS_EDGE ? {left: true, bottom: true} : normal; });
    addTest('none:top', addMargin,
      function() { return IS_TRIDENT || IS_EDGE ? {top: true} : {bottom: true}; },
      function() { return IS_TRIDENT || IS_EDGE ? {top: true} : {bottom: true}; });
    addTest('right:top', addMargin,
      function() {
        return IS_TRIDENT || IS_EDGE ? {right: true, top: true} :
          IS_GECKO ? {bottom: true} : // Gecko bug
          normal;
      },
      function() { return IS_TRIDENT || IS_EDGE ? {right: true, top: true} : normal; });
    addTest('left:top', addMargin,
      function() {
        return IS_TRIDENT || IS_EDGE ? {left: true, top: true} :
          IS_BLINK ? normal :
          IS_GECKO ? {bottom: true} : // Gecko bug
          {left: true, bottom: true};
      },
      function() {
        return IS_TRIDENT || IS_EDGE ? {left: true, top: true} :
          IS_GECKO ? {right: true} : // Gecko bug
          normal;
      });
  });

});
