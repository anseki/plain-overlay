
describe('avoidSelect()', function() {
  'use strict';

  var window, document,
    PlainOverlay, pageDone,
    IS_TRIDENT, IS_EDGE,
    overlayElm, overlayDoc,
    pBefore, pTarget, pAfter, face1, face2;

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
      selection.removeAllRanges();
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
    loadPage('spec/select.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      PlainOverlay = window.PlainOverlay;
      // insProps = window.insProps;
      IS_TRIDENT = window.IS_TRIDENT;
      IS_EDGE = window.IS_EDGE;

      pBefore = document.getElementById('p-before');
      pTarget = document.getElementById('p-target');
      pAfter = document.getElementById('p-after');
      face1 = document.getElementById('face1');
      face2 = document.getElementById('face2');
      overlayElm = new PlainOverlay(document.getElementById('target1'), {face: face1, duration: 10});
      overlayDoc = new PlainOverlay({face: face2, duration: 10});
      // for script in the page
      window.overlayElm = overlayElm;
      window.overlayDoc = overlayDoc;

      pageDone = done;

      beforeDone();
    }, 'avoidSelect()');
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainOverlay.limit).toBe(!!self.top.LIMIT);
  });

  it('Target: element, Selection: before 1', function(done) {
    var selection;
    overlayDoc.hide();
    overlayElm.show();

    setTimeout(function() {
      setSelection(pBefore, 0, pBefore, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('AB');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(1);
        expect(selection.toString().replace(/\s/g, '')).toBe('AB');

        done();
      }, 10);
    }, 50);
  });

  it('Target: element, Selection: before 2', function(done) {
    var selection;
    overlayDoc.hide();
    overlayElm.show();

    setTimeout(function() {
      setSelection(pBefore, 1, pBefore, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('BC');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(1);
        expect(selection.toString().replace(/\s/g, '')).toBe('BC');

        done();
      }, 10);
    }, 50);
  });

  it('Target: element, Selection: before - target', function(done) {
    var selection;
    overlayDoc.hide();
    overlayElm.show();

    setTimeout(function() {
      setSelection(pBefore, 2, pTarget, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('CD');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: element, Selection: target 1', function(done) {
    var selection;
    overlayDoc.hide();
    overlayElm.show();

    setTimeout(function() {
      setSelection(pTarget, 0, pTarget, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('DE');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: element, Selection: target 2', function(done) {
    var selection;
    overlayDoc.hide();
    overlayElm.show();

    setTimeout(function() {
      setSelection(pTarget, 1, pTarget, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('EF');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: element, Selection: target - after', function(done) {
    var selection;
    overlayDoc.hide();
    overlayElm.show();

    setTimeout(function() {
      setSelection(pTarget, 2, pAfter, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('FG');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: element, Selection: after 1', function(done) {
    var selection;
    overlayDoc.hide();
    overlayElm.show();

    setTimeout(function() {
      setSelection(pAfter, 0, pAfter, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('GH');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(1);
        expect(selection.toString().replace(/\s/g, '')).toBe('GH');

        done();
      }, 10);
    }, 50);
  });

  it('Target: element, Selection: after 2', function(done) {
    var selection;
    overlayDoc.hide();
    overlayElm.show();

    setTimeout(function() {
      setSelection(pAfter, 1, pAfter, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('HI');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(1);
        expect(selection.toString().replace(/\s/g, '')).toBe('HI');

        done();
      }, 10);
    }, 50);
  });

  it('Target: element, Selection: after - face', function(done) {
    var selection;
    overlayDoc.hide();
    overlayElm.show();

    setTimeout(function() {
      setSelection(pAfter, 2, face1, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      if (IS_TRIDENT || IS_EDGE) { // Contains hidden text (face1 was moved after `MNO`)
        expect(selection.toString().replace(/\s/g, '')).toBe('IMNOJ');
      } else {
        expect(selection.toString().replace(/\s/g, '')).toBe('IJ');
      }

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(1);
        if (IS_TRIDENT || IS_EDGE) { // Contains hidden text (face1 was moved after `MNO`)
          expect(selection.toString().replace(/\s/g, '')).toBe('IMNOJ');
        } else {
          expect(selection.toString().replace(/\s/g, '')).toBe('IJ');
        }

        done();
      }, 10);
    }, 50);
  });

  it('Target: element, Selection: face 1', function(done) {
    var selection;
    overlayDoc.hide();
    overlayElm.show();

    setTimeout(function() {
      setSelection(face1, 0, face1, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('JK');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(1);
        expect(selection.toString().replace(/\s/g, '')).toBe('JK');

        done();
      }, 10);
    }, 50);
  });

  it('Target: element, Selection: face 2', function(done) {
    var selection;
    overlayDoc.hide();
    overlayElm.show();

    setTimeout(function() {
      setSelection(face1, 1, face1, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('KL');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(1);
        expect(selection.toString().replace(/\s/g, '')).toBe('KL');

        done();
      }, 10);
    }, 50);
  });

  it('Target: document, Selection: before 1', function(done) {
    var selection;
    overlayElm.hide();
    overlayDoc.show();

    setTimeout(function() {
      setSelection(pBefore, 0, pBefore, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('AB');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: document, Selection: before 2', function(done) {
    var selection;
    overlayElm.hide();
    overlayDoc.show();

    setTimeout(function() {
      setSelection(pBefore, 1, pBefore, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('BC');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: document, Selection: before - target', function(done) {
    var selection;
    overlayElm.hide();
    overlayDoc.show();

    setTimeout(function() {
      setSelection(pBefore, 2, pTarget, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('CD');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: document, Selection: target 1', function(done) {
    var selection;
    overlayElm.hide();
    overlayDoc.show();

    setTimeout(function() {
      setSelection(pTarget, 0, pTarget, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('DE');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: document, Selection: target 2', function(done) {
    var selection;
    overlayElm.hide();
    overlayDoc.show();

    setTimeout(function() {
      setSelection(pTarget, 1, pTarget, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('EF');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: document, Selection: target - after', function(done) {
    var selection;
    overlayElm.hide();
    overlayDoc.show();

    setTimeout(function() {
      setSelection(pTarget, 2, pAfter, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('FG');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: document, Selection: after 1', function(done) {
    var selection;
    overlayElm.hide();
    overlayDoc.show();

    setTimeout(function() {
      setSelection(pAfter, 0, pAfter, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('GH');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: document, Selection: after 2', function(done) {
    var selection;
    overlayElm.hide();
    overlayDoc.show();

    setTimeout(function() {
      setSelection(pAfter, 1, pAfter, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('HI');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: document, Selection: after - face', function(done) {
    var selection;
    overlayElm.hide();
    overlayDoc.show();

    setTimeout(function() {
      setSelection(pAfter, 2, face2, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      if (IS_TRIDENT || IS_EDGE) { // Contains hidden text
        expect(selection.toString().replace(/\s/g, '')).toBe('IJKLM');
      } else {
        expect(selection.toString().replace(/\s/g, '')).toBe('IM');
      }

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(0);
        expect(selection.toString()).toBe('');

        done();
      }, 10);
    }, 50);
  });

  it('Target: document, Selection: face 1', function(done) {
    var selection;
    overlayElm.hide();
    overlayDoc.show();

    setTimeout(function() {
      setSelection(face2, 0, face2, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('MN');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(1);
        expect(selection.toString().replace(/\s/g, '')).toBe('MN');

        done();
      }, 10);
    }, 50);
  });

  it('Target: document, Selection: face 2', function(done) {
    var selection;
    overlayElm.hide();
    overlayDoc.show();

    setTimeout(function() {
      setSelection(face2, 1, face2, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('NO');

      fireKeyup();
      setTimeout(function() {
        selection = ('getSelection' in window ? window : document).getSelection();
        expect(selection.rangeCount).toBe(1);
        expect(selection.toString().replace(/\s/g, '')).toBe('NO');

        done();
      }, 10);
    }, 50);
  });

});
