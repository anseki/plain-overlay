describe('selContainsNode(), nodeContainsSel()', function() {
  'use strict';

  var NODES = [],
    window, document, selContainsNode, nodeContainsSel, p1, span1, pageDone,
    IS_TRIDENT, IS_BLINK, IS_GECKO;

  function getPos(index) {
    var iList = 0;
    while (true) {
      if (index <= NODES[iList].end) {
        return {node: NODES[iList].node, offset: index - NODES[iList].start};
      }
      if (iList >= NODES.length - 1) { throw new Error('setSelection'); }
      iList++;
    }
  }

  function setSelection(start, end) {
    var selection = ('getSelection' in window ? window : document).getSelection(),
      range, posStart, posEnd;

    if (selection.extend) { // Non-IE
      range = document.createRange();
      posStart = getPos(start);
      posEnd = getPos(end);
      if (start <= end) {
        posEnd.offset++;
      } else {
        posStart.offset++;
      }
      range.setStart(posStart.node, posStart.offset);
      range.setEnd(posStart.node, posStart.offset);
      selection.removeAllRanges();
      selection.addRange(range);
      selection.extend(posEnd.node, posEnd.offset);

    } else { // IE
      range = document.body.createTextRange();
      range.moveToElementText(p1);
      posStart = start;
      posEnd = end;
      if (start <= end) {
        posEnd++;
      } else {
        posStart++;
      }
      range.moveStart('character', posStart);
      var range2 = document.body.createTextRange(); // moveEnd() can't move lefter than start
      range2.moveToElementText(p1);
      range2.moveStart('character', posEnd);
      range.setEndPoint('EndToStart', range2);
      selection.removeAllRanges();
      range.select();
      selection = ('getSelection' in window ? window : document).getSelection(); // Get again
    }
    return selection;
  }

  function addSelection(start, end) {
    if (!IS_GECKO) { throw new Error('It doesn\'t support multiple ranges selection'); }

    var selection = ('getSelection' in window ? window : document).getSelection(),
      range, posStart, posEnd;

    range = document.createRange();
    posStart = getPos(start);
    posEnd = getPos(end);
    if (start <= end) {
      posEnd.offset++;
    } else {
      posStart.offset++;
    }
    range.setStart(posStart.node, posStart.offset);
    range.setEnd(posEnd.node, posEnd.offset);
    selection.addRange(range);
    return selection;
  }

  beforeAll(function(beforeDone) {
    loadPage('spec/sel_contain.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      selContainsNode = window.selContainsNode;
      nodeContainsSel = window.nodeContainsSel;
      IS_TRIDENT = window.PlainOverlay.IS_TRIDENT;
      IS_BLINK = window.PlainOverlay.IS_BLINK;
      IS_GECKO = window.PlainOverlay.IS_GECKO;

      p1 = document.getElementById('p1');
      span1 = document.getElementById('span1');

      // Parse node tree
      var index = 0;
      function parseNode(node) {
        var children = node.childNodes;
        for (var i = 0; i < children.length; i++) {
          if (children[i].nodeType === Node.ELEMENT_NODE) {
            parseNode(children[i]);
          } else if (children[i].nodeType === Node.TEXT_NODE) {
            var len = children[i].textContent.length;
            NODES.push({node: children[i], start: index, end: index + len - 1});
            index += len;
          }
        }
      }
      parseNode(p1);

      pageDone = done;

      beforeDone();
    }, 'selContainsNode(), nodeContainsSel()');
  });

  afterAll(function() {
    pageDone();
  });

  it('Check Edition (to be LIMIT: ' + !!self.top.LIMIT + ')', function() {
    expect(!!window.PlainOverlay.limit).toBe(!!self.top.LIMIT);
  });

  it('Check parsed NODES', function(done) {
    expect(NODES.length).toBe(3);
    expect(NODES[0].node.textContent).toBe('ABC');
    expect(NODES[1].node.textContent).toBe('DEFG');
    expect(NODES[2].node.textContent).toBe('HIJ');
    done();
  });

  it('Select `AB`', function(done) {
    var indexStart = 0,
      indexEnd = 1,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[0].node);
    expect(selection.anchorOffset).toBe(0);
    expect(selection.focusNode).toBe(NODES[0].node);
    expect(selection.focusOffset).toBe(2);
    expect(selection.toString()).toBe('AB');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(false);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(false);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[0].node);
      expect(selection.anchorOffset).toBe(2);
      expect(selection.focusNode).toBe(NODES[0].node);
      expect(selection.focusOffset).toBe(0);
    }
    expect(selection.toString()).toBe('AB');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(false);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(false);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    if (IS_GECKO) { // Multiple ranges
      // Add `C`
      addSelection(2, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('AB');
      expect(selection.getRangeAt(1).toString()).toBe('C');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(false);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(false);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `E`
      setSelection(indexStart, indexEnd);
      addSelection(4, 4);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('AB');
      expect(selection.getRangeAt(1).toString()).toBe('E');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `J`
      setSelection(indexStart, indexEnd);
      addSelection(9, 9);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('AB');
      expect(selection.getRangeAt(1).toString()).toBe('J');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(false);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(false);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `CDEFGH`
      setSelection(indexStart, indexEnd);
      addSelection(2, 7);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('AB');
      expect(selection.getRangeAt(1).toString()).toBe('CDEFGH');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(true);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(true);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);
    }

    done();
  });

  it('Select `BC`', function(done) {
    var indexStart = 1,
      indexEnd = 2,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[0].node);
    expect(selection.anchorOffset).toBe(1);
    expect(selection.focusNode).toBe(NODES[0].node);
    expect(selection.focusOffset).toBe(3);
    expect(selection.toString()).toBe('BC');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(false);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(false);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[0].node);
      expect(selection.anchorOffset).toBe(3);
      expect(selection.focusNode).toBe(NODES[0].node);
      expect(selection.focusOffset).toBe(1);
    }
    expect(selection.toString()).toBe('BC');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(false);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(false);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    done();
  });

  it('Select `CD`', function(done) {
    var indexStart = 2,
      indexEnd = 3,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[0].node);
    expect(selection.anchorOffset).toBe(2);
    expect(selection.focusNode).toBe(NODES[1].node);
    expect(selection.focusOffset).toBe(1);
    expect(selection.toString()).toBe('CD');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[1].node);
      expect(selection.anchorOffset).toBe(1);
      expect(selection.focusNode).toBe(NODES[0].node);
      expect(selection.focusOffset).toBe(2);
    }
    expect(selection.toString()).toBe('CD');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    if (IS_GECKO) { // Multiple ranges
      // Add `A`
      addSelection(0, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('A');
      expect(selection.getRangeAt(1).toString()).toBe('CD');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `F`
      setSelection(indexStart, indexEnd);
      addSelection(5, 5);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('CD');
      expect(selection.getRangeAt(1).toString()).toBe('F');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `J`
      setSelection(indexStart, indexEnd);
      addSelection(9, 9);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('CD');
      expect(selection.getRangeAt(1).toString()).toBe('J');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);
    }

    done();
  });

  it('Select `DE`', function(done) {
    var indexStart = 3,
      indexEnd = 4,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (IS_TRIDENT) { // Trident changes points
      expect(selection.anchorNode).toBe(NODES[0].node);
      expect(selection.anchorOffset).toBe(3);
    } else {
      expect(selection.anchorNode).toBe(NODES[1].node);
      expect(selection.anchorOffset).toBe(0);
    }
    expect(selection.focusNode).toBe(NODES[1].node);
    expect(selection.focusOffset).toBe(2);
    expect(selection.toString()).toBe('DE');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(!IS_TRIDENT); // Trident changed

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[1].node);
      expect(selection.anchorOffset).toBe(2);
      expect(selection.focusNode).toBe(NODES[1].node);
      expect(selection.focusOffset).toBe(0);
    }
    expect(selection.toString()).toBe('DE');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(!IS_TRIDENT); // Trident changed

    if (IS_GECKO) { // Multiple ranges
      // Add `A`
      addSelection(0, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('A');
      expect(selection.getRangeAt(1).toString()).toBe('DE');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `G`
      setSelection(indexStart, indexEnd);
      addSelection(6, 6);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('DE');
      expect(selection.getRangeAt(1).toString()).toBe('G');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(true);

      // Add `J`
      setSelection(indexStart, indexEnd);
      addSelection(9, 9);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('DE');
      expect(selection.getRangeAt(1).toString()).toBe('J');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);
    }

    done();
  });

  it('Select `EF`', function(done) {
    var indexStart = 4,
      indexEnd = 5,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[1].node);
    expect(selection.anchorOffset).toBe(1);
    expect(selection.focusNode).toBe(NODES[1].node);
    expect(selection.focusOffset).toBe(3);
    expect(selection.toString()).toBe('EF');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(true);

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[1].node);
      expect(selection.anchorOffset).toBe(3);
      expect(selection.focusNode).toBe(NODES[1].node);
      expect(selection.focusOffset).toBe(1);
    }
    expect(selection.toString()).toBe('EF');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(true);

    done();
  });

  it('Select `FG`', function(done) {
    var indexStart = 5,
      indexEnd = 6,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[1].node);
    expect(selection.anchorOffset).toBe(2);
    expect(selection.focusNode).toBe(NODES[1].node);
    expect(selection.focusOffset).toBe(4);
    expect(selection.toString()).toBe('FG');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(true);

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[1].node);
      expect(selection.anchorOffset).toBe(4);
      expect(selection.focusNode).toBe(NODES[1].node);
      expect(selection.focusOffset).toBe(2);
    }
    expect(selection.toString()).toBe('FG');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(true);

    done();
  });

  it('Select `GH`', function(done) {
    var indexStart = 6,
      indexEnd = 7,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[1].node);
    expect(selection.anchorOffset).toBe(3);
    expect(selection.focusNode).toBe(NODES[2].node);
    expect(selection.focusOffset).toBe(1);
    expect(selection.toString()).toBe('GH');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[2].node);
      expect(selection.anchorOffset).toBe(1);
      expect(selection.focusNode).toBe(NODES[1].node);
      expect(selection.focusOffset).toBe(3);
    }
    expect(selection.toString()).toBe('GH');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    if (IS_GECKO) { // Multiple ranges
      // Add `A`
      addSelection(0, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('A');
      expect(selection.getRangeAt(1).toString()).toBe('GH');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `E`
      setSelection(indexStart, indexEnd);
      addSelection(4, 4);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('E');
      expect(selection.getRangeAt(1).toString()).toBe('GH');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `J`
      setSelection(indexStart, indexEnd);
      addSelection(9, 9);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('GH');
      expect(selection.getRangeAt(1).toString()).toBe('J');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);
    }

    done();
  });

  it('Select `HI`', function(done) {
    var indexStart = 7,
      indexEnd = 8,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (IS_TRIDENT) { // Trident changes points
      expect(selection.anchorNode).toBe(NODES[1].node);
      expect(selection.anchorOffset).toBe(4);
    } else {
      expect(selection.anchorNode).toBe(NODES[2].node);
      expect(selection.anchorOffset).toBe(0);
    }
    expect(selection.focusNode).toBe(NODES[2].node);
    expect(selection.focusOffset).toBe(2);
    expect(selection.toString()).toBe('HI');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(false);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(IS_TRIDENT); // Trident changed
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[2].node);
      expect(selection.anchorOffset).toBe(2);
      expect(selection.focusNode).toBe(NODES[2].node);
      expect(selection.focusOffset).toBe(0);
    }
    expect(selection.toString()).toBe('HI');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(false);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(IS_TRIDENT); // Trident changed
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    if (IS_GECKO) { // Multiple ranges
      // Add `A`
      addSelection(0, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('A');
      expect(selection.getRangeAt(1).toString()).toBe('HI');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(false);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(false);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `E`
      setSelection(indexStart, indexEnd);
      addSelection(4, 4);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('E');
      expect(selection.getRangeAt(1).toString()).toBe('HI');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `J`
      setSelection(indexStart, indexEnd);
      addSelection(9, 9);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('HI');
      expect(selection.getRangeAt(1).toString()).toBe('J');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(false);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(false);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);
    }

    done();
  });

  it('Select `IJ`', function(done) {
    var indexStart = 8,
      indexEnd = 9,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[2].node);
    expect(selection.anchorOffset).toBe(1);
    expect(selection.focusNode).toBe(NODES[2].node);
    expect(selection.focusOffset).toBe(3);
    expect(selection.toString()).toBe('IJ');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(false);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(false);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[2].node);
      expect(selection.anchorOffset).toBe(3);
      expect(selection.focusNode).toBe(NODES[2].node);
      expect(selection.focusOffset).toBe(1);
    }
    expect(selection.toString()).toBe('IJ');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(false);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(false);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    done();
  });

  it('Select `DEFG`', function(done) {
    var indexStart = 3,
      indexEnd = 6,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (IS_TRIDENT) { // Trident changes points
      expect(selection.anchorNode).toBe(NODES[0].node);
      expect(selection.anchorOffset).toBe(3);
    } else {
      expect(selection.anchorNode).toBe(NODES[1].node);
      expect(selection.anchorOffset).toBe(0);
    }
    expect(selection.focusNode).toBe(NODES[1].node);
    expect(selection.focusOffset).toBe(4);
    expect(selection.toString()).toBe('DEFG');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(!IS_TRIDENT); // Trident changed

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[1].node);
      expect(selection.anchorOffset).toBe(4);
      expect(selection.focusNode).toBe(NODES[1].node);
      expect(selection.focusOffset).toBe(0);
    }
    expect(selection.toString()).toBe('DEFG');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(!IS_TRIDENT); // Trident changed

    if (IS_GECKO) { // Multiple ranges
      // Add `A`
      addSelection(0, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('A');
      expect(selection.getRangeAt(1).toString()).toBe('DEFG');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `J`
      setSelection(indexStart, indexEnd);
      addSelection(9, 9);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('DEFG');
      expect(selection.getRangeAt(1).toString()).toBe('J');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(false);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(false);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);
    }

    done();
  });

  it('Select `CDEFG`', function(done) {
    var indexStart = 2,
      indexEnd = 6,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[0].node);
    expect(selection.anchorOffset).toBe(2);
    expect(selection.focusNode).toBe(NODES[1].node);
    expect(selection.focusOffset).toBe(4);
    expect(selection.toString()).toBe('CDEFG');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[1].node);
      expect(selection.anchorOffset).toBe(4);
      expect(selection.focusNode).toBe(NODES[0].node);
      expect(selection.focusOffset).toBe(2);
    }
    expect(selection.toString()).toBe('CDEFG');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    done();
  });

  it('Select `DEFGH`', function(done) {
    var indexStart = 3,
      indexEnd = 7,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (IS_TRIDENT) { // Trident changes points
      expect(selection.anchorNode).toBe(NODES[0].node);
      expect(selection.anchorOffset).toBe(3);
    } else {
      expect(selection.anchorNode).toBe(NODES[1].node);
      expect(selection.anchorOffset).toBe(0);
    }
    expect(selection.focusNode).toBe(NODES[2].node);
    expect(selection.focusOffset).toBe(1);
    expect(selection.toString()).toBe('DEFGH');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(IS_TRIDENT); // Trident changed
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[2].node);
      expect(selection.anchorOffset).toBe(1);
      expect(selection.focusNode).toBe(NODES[1].node);
      expect(selection.focusOffset).toBe(0);
    }
    expect(selection.toString()).toBe('DEFGH');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(IS_TRIDENT); // Trident changed
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    done();
  });

  it('Select `CDEFGH`', function(done) {
    var indexStart = 2,
      indexEnd = 7,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[0].node);
    expect(selection.anchorOffset).toBe(2);
    expect(selection.focusNode).toBe(NODES[2].node);
    expect(selection.focusOffset).toBe(1);
    expect(selection.toString()).toBe('CDEFGH');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(true);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(true);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    // Reversed direction
    setSelection(indexEnd, indexStart);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    expect(selection.rangeCount).toBe(1);
    if (!IS_TRIDENT) { // Trident doesn't support reversed
      expect(selection.anchorNode).toBe(NODES[2].node);
      expect(selection.anchorOffset).toBe(1);
      expect(selection.focusNode).toBe(NODES[0].node);
      expect(selection.focusOffset).toBe(2);
    }
    expect(selection.toString()).toBe('CDEFGH');

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(true);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(true);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    if (IS_GECKO) { // Multiple ranges
      // Add `A`
      addSelection(0, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('A');
      expect(selection.getRangeAt(1).toString()).toBe('CDEFGH');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(true);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(true);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);

      // Add `J`
      setSelection(indexStart, indexEnd);
      addSelection(9, 9);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(2);
      expect(selection.getRangeAt(0).toString()).toBe('CDEFGH');
      expect(selection.getRangeAt(1).toString()).toBe('J');

      // containsNode
      if (selection.containsNode) {
        expect(selection.containsNode(span1, true)).toBe(true);
        expect(selection.containsNode(span1, false)).toBe(true);
      }
      // selContainsNode
      expect(selContainsNode(selection, span1, true)).toBe(true);
      expect(selContainsNode(selection, span1, false)).toBe(true);
      // nodeContainsSel
      expect(nodeContainsSel(span1, selection)).toBe(false);
    }

    done();
  });

  it('Select `` the right of `B`', function(done) {
    var indexStart = 2,
      indexEnd = indexStart,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    selection.collapseToStart();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[0].node);
    expect(selection.anchorOffset).toBe(2);
    expect(selection.focusNode).toBe(NODES[0].node);
    expect(selection.focusOffset).toBe(2);
    expect(selection.toString()).toBe('');
    expect(selection.isCollapsed).toBe(true);

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(false);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(false);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    done();
  });

  it('Select `` the right of `C`', function(done) {
    var indexStart = 2,
      indexEnd = indexStart,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    selection.collapseToEnd();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[0].node);
    expect(selection.anchorOffset).toBe(3);
    expect(selection.focusNode).toBe(NODES[0].node);
    expect(selection.focusOffset).toBe(3);
    expect(selection.toString()).toBe('');
    expect(selection.isCollapsed).toBe(true);

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(false);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(false);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    done();
  });

  it('Select `` the left of `D`', function(done) {
    if (IS_TRIDENT) { done(); return; } // Trident changes points -> right of `C`

    var indexStart = 3,
      indexEnd = indexStart,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    selection.collapseToStart();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[1].node);
    expect(selection.anchorOffset).toBe(0);
    expect(selection.focusNode).toBe(NODES[1].node);
    expect(selection.focusOffset).toBe(0);
    expect(selection.toString()).toBe('');
    expect(selection.isCollapsed).toBe(true);

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(!IS_BLINK); // Blink bug
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(true);

    done();
  });

  it('Select `` the right of `E`', function(done) {
    var indexStart = 5,
      indexEnd = indexStart,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    selection.collapseToStart();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[1].node);
    expect(selection.anchorOffset).toBe(2);
    expect(selection.focusNode).toBe(NODES[1].node);
    expect(selection.focusOffset).toBe(2);
    expect(selection.toString()).toBe('');
    expect(selection.isCollapsed).toBe(true);

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(true);

    done();
  });

  it('Select `` the right of `G`', function(done) {
    var indexStart = 6,
      indexEnd = indexStart,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    selection.collapseToEnd();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[1].node);
    expect(selection.anchorOffset).toBe(4);
    expect(selection.focusNode).toBe(NODES[1].node);
    expect(selection.focusOffset).toBe(4);
    expect(selection.toString()).toBe('');
    expect(selection.isCollapsed).toBe(true);

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(true);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(true);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(true);

    done();
  });

  it('Select `` the left of `H`', function(done) {
    if (IS_TRIDENT) { done(); return; } // Trident changes points -> right of `G`

    var indexStart = 7,
      indexEnd = indexStart,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    selection.collapseToStart();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[2].node);
    expect(selection.anchorOffset).toBe(0);
    expect(selection.focusNode).toBe(NODES[2].node);
    expect(selection.focusOffset).toBe(0);
    expect(selection.toString()).toBe('');
    expect(selection.isCollapsed).toBe(true);

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(IS_BLINK); // Blink bug
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(false);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    done();
  });

  it('Select `` the right of `H`', function(done) {
    var indexStart = 7,
      indexEnd = indexStart,
      selection;

    setSelection(indexStart, indexEnd);
    // Check selection
    selection = ('getSelection' in window ? window : document).getSelection();
    selection.collapseToEnd();
    expect(selection.rangeCount).toBe(1);
    expect(selection.anchorNode).toBe(NODES[2].node);
    expect(selection.anchorOffset).toBe(1);
    expect(selection.focusNode).toBe(NODES[2].node);
    expect(selection.focusOffset).toBe(1);
    expect(selection.toString()).toBe('');
    expect(selection.isCollapsed).toBe(true);

    // containsNode
    if (selection.containsNode) {
      expect(selection.containsNode(span1, true)).toBe(false);
      expect(selection.containsNode(span1, false)).toBe(false);
    }
    // selContainsNode
    expect(selContainsNode(selection, span1, true)).toBe(false);
    expect(selContainsNode(selection, span1, false)).toBe(false);
    // nodeContainsSel
    expect(nodeContainsSel(span1, selection)).toBe(false);

    done();
  });

});
