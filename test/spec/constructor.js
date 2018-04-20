describe('constructor', function() {
  'use strict';

  var window, document, body, docElement, element, frmWindow, frmDocument, frmBody, frmDocElement, frmElement,
    PlainOverlay, insProps, pageDone;

  beforeAll(function(beforeDone) {
    loadPage('spec/common/page.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      body = pageBody;
      docElement = document.documentElement;
      element = document.getElementById('elm-plain');
      frmWindow = document.getElementById('iframe1').contentWindow;
      frmDocument = frmWindow.document;
      frmBody = frmDocument.body;
      frmDocElement = frmDocument.documentElement;
      frmElement = frmDocument.getElementById('elm-plain');
      PlainOverlay = window.PlainOverlay;
      insProps = PlainOverlay.insProps;
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

  it('(element, {})', function() {
    var overlay = new PlainOverlay(element, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(element);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(null, {})', function() {
    var overlay = new PlainOverlay(null, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(window, {})', function() {
    var overlay = new PlainOverlay(window, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(document, {})', function() {
    var overlay = new PlainOverlay(document, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(html, {})', function() {
    var overlay = new PlainOverlay(docElement, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(body, {})', function() {
    var overlay = new PlainOverlay(body, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(svg, {})', function() {
    var svg = body.appendChild(document.createElement('svg')),
      overlay = new PlainOverlay(svg, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(svg);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(iframe, {})', function() {
    var overlay = new PlainOverlay(document.getElementById('iframe1'), {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmDocElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

  it('(1, {})', function() {
    expect(function() {
      var overlay = new PlainOverlay(1, {});
      console.log(overlay); // dummy
    }).toThrowError('This target is not accepted.');
  });

  // ============================

  it('(null, 1)', function() {
    expect(function() {
      var overlay = new PlainOverlay(null, 1);
      console.log(overlay); // dummy
    }).toThrowError('Invalid options.');
  });

  it('(fragment, {})', function() {
    var fragment = document.createDocumentFragment();
    expect(fragment.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);

    expect(function() {
      var overlay = new PlainOverlay(fragment, {});
      console.log(overlay); // dummy
    }).toThrowError('This element is not accepted.');
  });

  // ============================

  it('(elementInFrame, {})', function() {
    var overlay = new PlainOverlay(frmElement, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

  it('(frameWindow, {})', function() {
    var overlay = new PlainOverlay(frmWindow, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmDocElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

  it('(frameDocument, {})', function() {
    var overlay = new PlainOverlay(frmDocument, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmDocElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

  it('(frameHtml, {})', function() {
    var overlay = new PlainOverlay(frmDocElement, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmDocElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

  it('(frameBody, {})', function() {
    var overlay = new PlainOverlay(frmBody, {}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmDocElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

  // ============================

  it('()', function() {
    var overlay = new PlainOverlay(),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  // single argument

  it('(element)', function() {
    var overlay = new PlainOverlay(element),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(element);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(null)', function() {
    var overlay = new PlainOverlay(null),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(window)', function() {
    var overlay = new PlainOverlay(window),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(document)', function() {
    var overlay = new PlainOverlay(document),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(html)', function() {
    var overlay = new PlainOverlay(docElement),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(body)', function() {
    var overlay = new PlainOverlay(body),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(iframe)', function() {
    var overlay = new PlainOverlay(document.getElementById('iframe1')),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmDocElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

  it('(1)', function() {
    expect(function() {
      var overlay = new PlainOverlay(1);
      console.log(overlay); // dummy
    }).toThrowError('Invalid argument.');
  });

  // ============================

  it('({})', function() {
    var overlay = new PlainOverlay({}),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(docElement);
    expect(props.window).toBe(window);
    expect(props.document).toBe(document);
  });

  it('(fragment)', function() {
    var fragment = document.createDocumentFragment();
    expect(fragment.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);

    expect(function() {
      var overlay = new PlainOverlay(fragment);
      console.log(overlay); // dummy
    }).toThrowError('This element is not accepted.');
  });

  // ============================

  it('(elementInFrame)', function() {
    var overlay = new PlainOverlay(frmElement),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

  it('(frameWindow)', function() {
    var overlay = new PlainOverlay(frmWindow),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmDocElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

  it('(frameDocument)', function() {
    var overlay = new PlainOverlay(frmDocument),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmDocElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

  it('(frameHtml)', function() {
    var overlay = new PlainOverlay(frmDocElement),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmDocElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

  it('(frameBody)', function() {
    var overlay = new PlainOverlay(frmBody),
      props = insProps[overlay._id];

    expect(props.elmTarget).toBe(frmDocElement);
    expect(props.window).toBe(frmWindow);
    expect(props.document).toBe(frmDocument);
  });

});
