describe('blockingDisabled', function() {
  'use strict';

  var window, document, utils,
    PlainOverlay, pageDone,
    divInDoc, textInDoc, pInDoc,
    divInElm, textInElm, pInElm,
    divInFace1, textInFace1, pInFace1,
    divInFace2, textInFace2, pInFace2,
    overlayElm, overlayDoc,

    SCROLL_DOC = 2,
    SCROLL_ELM = 4,
    SCROLL_FACE1 = 8,
    SCROLL_FACE2 = 16;

  function blurElement(element) {
    if (element.blur) {
      element.blur();
    } else {
      element.ownerDocument.body.focus();
    }
  }

  function reset() {
    var selection = ('getSelection' in window ? window : document).getSelection();
    if (selection.rangeCount > 0) {
      try {
        selection.removeAllRanges(); // Trident bug?, `Error:800a025e` comes sometime
      } catch (error) { /* ignore */ }
    }
    if (document.activeElement) { blurElement(document.activeElement); }
    document.body.focus();
    // Trident bug? It seems that `focus()` makes selection again.
    if (selection.rangeCount > 0) {
      try {
        selection.removeAllRanges(); // Trident bug?, `Error:800a025e` comes sometime
      } catch (error) { /* ignore */ }
    }

    divInDoc.scrollTop = 0;
    divInElm.scrollTop = 0;

    // scrollLeft/Top need shown display
    var elmOverlay1 = PlainOverlay.insProps[overlayElm._id].elmOverlay,
      display1 = elmOverlay1.style.display,
      elmOverlay2 = PlainOverlay.insProps[overlayDoc._id].elmOverlay,
      display2 = elmOverlay2.style.display;
    elmOverlay1.style.display = elmOverlay2.style.display = 'block';
    divInFace1.scrollTop = 0;
    divInFace2.scrollTop = 0;
    elmOverlay1.style.display = display1;
    elmOverlay2.style.display = display2;
  }

  function setSelection(startElement, startIndex, endElement, endIndex) {
    var selection = ('getSelection' in window ? window : document).getSelection(),
      range;

    function parseNode(node, nodes, index) {
      if (!nodes) {
        nodes = [];
        index = 0;
      }
      var children = node.childNodes;
      for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType === Node.ELEMENT_NODE) {
          parseNode(children[i], nodes, index);
        } else if (children[i].nodeType === Node.TEXT_NODE) {
          var len = children[i].textContent.length;
          nodes.push({node: children[i], start: index, end: index + len - 1});
          index += len;
        }
      }
      return nodes;
    }

    function getPos(index, nodes) {
      var iList = 0;
      while (true) {
        if (index <= nodes[iList].end) {
          return {node: nodes[iList].node, offset: index - nodes[iList].start};
        }
        if (iList >= nodes.length - 1) { throw new Error('setSelection'); }
        iList++;
      }
    }

    if (selection.extend) { // Non-IE
      var posStart = getPos(startIndex, parseNode(startElement)),
        posEnd = getPos(endIndex, parseNode(endElement));
      posEnd.offset++;
      range = document.createRange();
      range.setStart(posStart.node, posStart.offset);
      range.setEnd(posEnd.node, posEnd.offset);
      selection.removeAllRanges();
      selection.addRange(range);

    } else { // IE
      range = document.body.createTextRange();
      range.moveToElementText(startElement);
      range.moveStart('character', startIndex);
      var range2 = document.body.createTextRange(); // moveEnd() can't move to another node
      range2.moveToElementText(endElement);
      range2.moveStart('character', endIndex + 1);
      range.setEndPoint('EndToStart', range2);
      try {
        selection.removeAllRanges(); // Trident bug?, `Error:800a025e` comes sometime
      } catch (error) { /* ignore */ }
      range.select();
      selection = ('getSelection' in window ? window : document).getSelection(); // Get again
    }
    return selection;
  }

  function fireKeyup() {
    var evt;
    try {
      evt = new KeyboardEvent('keyup', {shiftKey: true}); // shiftKey is dummy
    } catch (error) {
      evt = document.createEvent('KeyboardEvent');
      evt.initKeyboardEvent('keyup', true, false, window, 'Shift', 0x01, 'Shift', false, null);
    }
    window.dispatchEvent(evt);
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/blockingDisabled.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      PlainOverlay = window.PlainOverlay;

      divInDoc = document.getElementById('divInDoc');
      textInDoc = document.getElementById('textInDoc');
      pInDoc = document.getElementById('pInDoc');
      divInElm = document.getElementById('divInElm');
      textInElm = document.getElementById('textInElm');
      pInElm = document.getElementById('pInElm');
      divInFace1 = document.getElementById('divInFace1');
      textInFace1 = document.getElementById('textInFace1');
      pInFace1 = document.getElementById('pInFace1');
      divInFace2 = document.getElementById('divInFace2');
      textInFace2 = document.getElementById('textInFace2');
      pInFace2 = document.getElementById('pInFace2');
      overlayElm = new PlainOverlay(document.getElementById('elm'),
        {face: document.getElementById('face1'), duration: 20});
      overlayDoc = new PlainOverlay(window,
        {face: document.getElementById('face2'), duration: 20});

      pageDone = done;
      beforeDone();
    }, 'blockingDisabled');
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainOverlay.limit).toBe(!!self.top.LIMIT);
  });

  describe('blockingDisabled: false', function() {

    it('Target: *, STATE_HIDDEN', function(done) {
      utils.makeState([overlayElm, overlayDoc],
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          var selection;
          reset();
          utils.intervalExec([
            // ====================================
            20, function() {
              // scroll
              expect(divInDoc.scrollTop).toBe(0);
              expect(divInElm.scrollTop).toBe(0);
              divInDoc.scrollTop = SCROLL_DOC;
              divInElm.scrollTop = SCROLL_ELM;
            },
            // ====================================
            20, function() {
              expect(divInDoc.scrollTop).toBe(SCROLL_DOC);
              expect(divInElm.scrollTop).toBe(SCROLL_ELM);

              // focus
              expect(document.activeElement).not.toBe(textInDoc);
              textInDoc.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInDoc);
              textInElm.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInElm);

              // select
              setSelection(pInDoc, 1, pInDoc, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('0rem ipsum');
            },
            // ====================================
            0, function() {
              // To check after some events in Trident with setSelection
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('0rem ipsum');

              setSelection(pInElm, 1, pInElm, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('1rem ipsum');
            },
            // ====================================
            0, function() {
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('1rem ipsum');
            },
            // ====================================
            0, done
          ]);
        }
      );
    });

    it('Target: element, STATE_SHOWN', function(done) {
      var timer1;
      utils.makeState([overlayElm, overlayDoc],
        [PlainOverlay.STATE_SHOWN, PlainOverlay.STATE_HIDDEN],
        function() {
          overlayElm.hide(true);
          overlayDoc.hide(true);
          timer1 = setTimeout(function() {
            reset();
            overlayElm.show(true);
          }, 10);
          return true;
        },
        function() {
          var selection;
          clearTimeout(timer1);
          utils.intervalExec([
            // ====================================
            20, function() {
              // scroll
              expect(divInDoc.scrollTop).toBe(0);
              expect(divInElm.scrollTop).toBe(0);
              expect(divInFace1.scrollTop).toBe(0);

              divInDoc.scrollTop = SCROLL_DOC;
              divInElm.scrollTop = SCROLL_ELM;
              divInFace1.scrollTop = SCROLL_FACE1;
            },
            // ====================================
            20, function() {
              expect(divInDoc.scrollTop).toBe(SCROLL_DOC);
              expect(divInElm.scrollTop).toBe(0); // Avoided
              expect(divInFace1.scrollTop).toBe(SCROLL_FACE1);

              // focus
              expect(document.activeElement).not.toBe(textInDoc);
              textInDoc.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInDoc);
              textInElm.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).not.toBe(textInElm); // Avoided
              textInFace1.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInFace1);

              // select
              setSelection(pInDoc, 1, pInDoc, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('0rem ipsum');
            },
            // ====================================
            0, function() {
              // To check after some events in Trident with setSelection
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('0rem ipsum');

              setSelection(pInElm, 1, pInElm, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('1rem ipsum');
            },
            // ====================================
            0, function() {
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(0); // Avoided
              expect(selection.toString()).toBe('');

              setSelection(pInFace1, 1, pInFace1, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('2rem ipsum');
            },
            // ====================================
            0, function() {
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('2rem ipsum');
            },
            // ====================================
            0, done
          ]);
        }
      );
    });

    it('Target: document, STATE_SHOWN', function(done) {
      var timer1;
      utils.makeState([overlayElm, overlayDoc],
        [PlainOverlay.STATE_HIDDEN, PlainOverlay.STATE_SHOWN],
        function() {
          overlayElm.hide(true);
          overlayDoc.hide(true);
          timer1 = setTimeout(function() {
            reset();
            overlayDoc.show(true);
          }, 10);
          return true;
        },
        function() {
          clearTimeout(timer1);
          var selection;
          utils.intervalExec([
            // ====================================
            20, function() {
              // scroll
              expect(divInDoc.scrollTop).toBe(0);
              expect(divInElm.scrollTop).toBe(0);
              expect(divInFace2.scrollTop).toBe(0);

              divInDoc.scrollTop = SCROLL_DOC;
              divInElm.scrollTop = SCROLL_ELM;
              divInFace2.scrollTop = SCROLL_FACE2;
            },
            // ====================================
            20, function() {
              expect(divInDoc.scrollTop).toBe(0); // Avoided
              expect(divInElm.scrollTop).toBe(0); // Avoided
              expect(divInFace2.scrollTop).toBe(SCROLL_FACE2);

              // focus
              expect(document.activeElement).not.toBe(textInDoc);
              textInDoc.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).not.toBe(textInDoc); // Avoided
              textInElm.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).not.toBe(textInElm); // Avoided
              textInFace2.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInFace2);

              // select
              setSelection(pInDoc, 1, pInDoc, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('0rem ipsum');
            },
            // ====================================
            0, function() {
              // To check after some events in Trident with setSelection
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(0); // Avoided
              expect(selection.toString()).toBe('');

              setSelection(pInElm, 1, pInElm, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('1rem ipsum');
            },
            // ====================================
            0, function() {
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(0); // Avoided
              expect(selection.toString()).toBe('');

              setSelection(pInFace2, 1, pInFace2, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('3rem ipsum');
            },
            // ====================================
            0, function() {
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('3rem ipsum');
            },
            // ====================================
            0, done
          ]);
        }
      );
    });

  });

  describe('blockingDisabled: true', function() {

    it('Target: *, STATE_HIDDEN', function(done) {
      overlayElm.blockingDisabled = overlayDoc.blockingDisabled = true;

      utils.makeState([overlayElm, overlayDoc],
        PlainOverlay.STATE_HIDDEN,
        function(overlay) { overlay.hide(true); },
        function() {
          var selection;
          reset();
          utils.intervalExec([
            // ====================================
            20, function() {
              // scroll
              expect(divInDoc.scrollTop).toBe(0);
              expect(divInElm.scrollTop).toBe(0);

              divInDoc.scrollTop = SCROLL_DOC;
              divInElm.scrollTop = SCROLL_ELM;
            },
            // ====================================
            20, function() {
              expect(divInDoc.scrollTop).toBe(SCROLL_DOC);
              expect(divInElm.scrollTop).toBe(SCROLL_ELM);

              // focus
              expect(document.activeElement).not.toBe(textInDoc);
              textInDoc.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInDoc);
              textInElm.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInElm);

              // select
              setSelection(pInDoc, 1, pInDoc, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('0rem ipsum');
            },
            // ====================================
            0, function() {
              // To check after some events in Trident with setSelection
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('0rem ipsum');

              setSelection(pInElm, 1, pInElm, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('1rem ipsum');
            },
            // ====================================
            0, function() {
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('1rem ipsum');
            },
            // ====================================
            0, done
          ]);
        }
      );
    });

    it('Target: element, STATE_SHOWN', function(done) {
      var timer1;
      utils.makeState([overlayElm, overlayDoc],
        [PlainOverlay.STATE_SHOWN, PlainOverlay.STATE_HIDDEN],
        function() {
          overlayElm.hide(true);
          overlayDoc.hide(true);
          timer1 = setTimeout(function() {
            reset();
            overlayElm.show(true);
          }, 10);
          return true;
        },
        function() {
          var selection;
          clearTimeout(timer1);
          utils.intervalExec([
            // ====================================
            20, function() {
              // scroll
              expect(divInDoc.scrollTop).toBe(0);
              expect(divInElm.scrollTop).toBe(0);
              expect(divInFace1.scrollTop).toBe(0);

              divInDoc.scrollTop = SCROLL_DOC;
              divInElm.scrollTop = SCROLL_ELM;
              divInFace1.scrollTop = SCROLL_FACE1;
            },
            // ====================================
            20, function() {
              expect(divInDoc.scrollTop).toBe(SCROLL_DOC);
              expect(divInElm.scrollTop).toBe(SCROLL_ELM); // Not avoided
              expect(divInFace1.scrollTop).toBe(SCROLL_FACE1);

              // focus
              expect(document.activeElement).not.toBe(textInDoc);
              textInDoc.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInDoc);
              textInElm.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInElm); // Not avoided
              textInFace1.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInFace1);

              // select
              setSelection(pInDoc, 1, pInDoc, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('0rem ipsum');
            },
            // ====================================
            0, function() {
              // To check after some events in Trident with setSelection
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('0rem ipsum');

              setSelection(pInElm, 1, pInElm, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('1rem ipsum');
            },
            // ====================================
            0, function() {
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1); // Not avoided
              expect(selection.toString()).toBe('1rem ipsum');

              setSelection(pInFace1, 1, pInFace1, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('2rem ipsum');
            },
            // ====================================
            0, function() {
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('2rem ipsum');
            },
            // ====================================
            0, done
          ]);
        }
      );
    });

    it('Target: document, STATE_SHOWN', function(done) {
      var timer1;
      utils.makeState([overlayElm, overlayDoc],
        [PlainOverlay.STATE_HIDDEN, PlainOverlay.STATE_SHOWN],
        function() {
          overlayElm.hide(true);
          overlayDoc.hide(true);
          timer1 = setTimeout(function() {
            reset();
            overlayDoc.show(true);
          }, 10);
          return true;
        },
        function() {
          var selection;
          clearTimeout(timer1);
          utils.intervalExec([
            // ====================================
            20, function() {
              // scroll
              expect(divInDoc.scrollTop).toBe(0);
              expect(divInElm.scrollTop).toBe(0);
              expect(divInFace2.scrollTop).toBe(0);

              divInDoc.scrollTop = SCROLL_DOC;
              divInElm.scrollTop = SCROLL_ELM;
              divInFace2.scrollTop = SCROLL_FACE2;
            },
            // ====================================
            20, function() {
              expect(divInDoc.scrollTop).toBe(SCROLL_DOC); // Not avoided
              expect(divInElm.scrollTop).toBe(SCROLL_ELM); // Not avoided
              expect(divInFace2.scrollTop).toBe(SCROLL_FACE2);

              // focus
              expect(document.activeElement).not.toBe(textInDoc);
              textInDoc.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInDoc); // Not avoided
              textInElm.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInElm); // Not avoided
              textInFace2.focus();
            },
            // ====================================
            function() {
              expect(document.activeElement).toBe(textInFace2);

              // select
              setSelection(pInDoc, 1, pInDoc, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('0rem ipsum');
            },
            // ====================================
            0, function() {
              // To check after some events in Trident with setSelection
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1); // Not avoided
              expect(selection.toString()).toBe('0rem ipsum');

              setSelection(pInElm, 1, pInElm, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('1rem ipsum');
            },
            // ====================================
            0, function() {
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1); // Not avoided
              expect(selection.toString()).toBe('1rem ipsum');

              setSelection(pInFace2, 1, pInFace2, 10);
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('3rem ipsum');
            },
            // ====================================
            0, function() {
              fireKeyup();
            },
            // ====================================
            0, function() {
              selection = ('getSelection' in window ? window : document).getSelection();
              expect(selection.rangeCount).toBe(1);
              expect(selection.toString()).toBe('3rem ipsum');
            },
            // ====================================
            0, done
          ]);
        }
      );
    });

  });

});
