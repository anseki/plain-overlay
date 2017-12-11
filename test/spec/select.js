
describe('avoidSelect()', function() {
  'use strict';

  var window, document, utils,
    PlainOverlay, traceLog, pageDone,
    IS_TRIDENT,
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
    loadPage('spec/select.html', function(pageWindow, pageDocument, pageBody, done) {
      window = pageWindow;
      document = pageDocument;
      utils = window.utils;
      PlainOverlay = window.PlainOverlay;
      traceLog = PlainOverlay.traceLog;
      IS_TRIDENT = window.IS_TRIDENT;

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

  describe('Target: element', function() {
    beforeAll(function(beforeDone) {
      var timer1;
      utils.makeState([overlayElm, overlayDoc],
        [PlainOverlay.STATE_SHOWN, PlainOverlay.STATE_HIDDEN],
        function() {
          overlayElm.hide(true);
          overlayDoc.hide(true);
          timer1 = setTimeout(function() {
            overlayElm.show(true);
          }, 10);
          return true;
        },
        function() {
          clearTimeout(timer1);
          beforeDone();
        }
      );
    });

    it('Selection: before 1', function(done) {
      var selection;
      setSelection(pBefore, 0, pBefore, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('AB');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(1);
          expect(selection.toString().replace(/\s/g, '')).toBe('AB');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'start:P#p-before(0),end:P#p-before(2),isCollapsed:false',
            'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ]);

          done();
        }, 10);
      }, 10);
    });

    it('Selection: before 2', function(done) {
      var selection;
      setSelection(pBefore, 1, pBefore, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('BC');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(1);
          expect(selection.toString().replace(/\s/g, '')).toBe('BC');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'start:P#p-before(1),end:P#p-before(3),isCollapsed:false',
            'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ]);

          done();
        }, 10);
      }, 10);
    });

    it('Selection: before - target', function(done) {
      var selection;
      setSelection(pBefore, 2, pTarget, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('CD');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'start:P#p-before(2),end:P#p-target(1),isCollapsed:false',
            'DONE', '_id:' + overlayElm._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayElm._id, '</text-select-event>'
          ]);

          done();
        }, 10);
      }, 10);
    });

    it('Selection: target 1', function(done) {
      var selection;
      setSelection(pTarget, 0, pTarget, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('DE');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'start:P#p-target(0),end:P#p-target(2),isCollapsed:false',
            'DONE', '_id:' + overlayElm._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayElm._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'target:P#p-target',
            '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'target:P#p-target',
            '<avoidFocus>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'element:P#p-target',
            'DONE', '_id:' + overlayElm._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayElm._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'target:BODY',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: target 2', function(done) {
      var selection;
      setSelection(pTarget, 1, pTarget, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('EF');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'start:P#p-target(1),end:P#p-target(3),isCollapsed:false',
            'DONE', '_id:' + overlayElm._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayElm._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'target:P#p-target',
            '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'target:P#p-target',
            '<avoidFocus>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'element:P#p-target',
            'DONE', '_id:' + overlayElm._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayElm._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'target:BODY',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: target - after', function(done) {
      var selection;
      setSelection(pTarget, 2, pAfter, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('FG');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'start:P#p-target(2),end:P#p-after(1),isCollapsed:false',
            'DONE', '_id:' + overlayElm._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayElm._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'target:P#p-target',
            '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'target:P#p-target',
            '<avoidFocus>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'element:P#p-target',
            'DONE', '_id:' + overlayElm._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayElm._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            'target:BODY',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: after 1', function(done) {
      var selection;
      setSelection(pAfter, 0, pAfter, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('GH');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(1);
          expect(selection.toString().replace(/\s/g, '')).toBe('GH');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'start:P#p-after(0),end:P#p-after(2),isCollapsed:false',
            'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ]);

          done();
        }, 10);
      }, 10);
    });

    it('Selection: after 2', function(done) {
      var selection;
      setSelection(pAfter, 1, pAfter, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('HI');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(1);
          expect(selection.toString().replace(/\s/g, '')).toBe('HI');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'start:P#p-after(1),end:P#p-after(3),isCollapsed:false',
            'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ]);

          done();
        }, 10);
      }, 10);
    });

    it('Selection: after - face', function(done) {
      var selection;
      setSelection(pAfter, 2, face1, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      if (IS_TRIDENT) { // Contains hidden text (face1 was moved after `MNO`)
        expect(selection.toString().replace(/\s/g, '')).toBe('IMNOJ');
      } else {
        expect(selection.toString().replace(/\s/g, '')).toBe('IJ');
      }

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(1);
          if (IS_TRIDENT) { // Contains hidden text (face1 was moved after `MNO`)
            expect(selection.toString().replace(/\s/g, '')).toBe('IMNOJ');
          } else {
            expect(selection.toString().replace(/\s/g, '')).toBe('IJ');
          }

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'start:P#p-after(2),end:P#face1(1),isCollapsed:false',
            'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ]);

          done();
        }, 10);
      }, 10);
    });

    it('Selection: face 1', function(done) {
      var selection;
      setSelection(face1, 0, face1, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('JK');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(1);
          expect(selection.toString().replace(/\s/g, '')).toBe('JK');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'start:P#face1(0),end:P#face1(2),isCollapsed:false',
            'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ]);

          done();
        }, 10);
      }, 10);
    });

    it('Selection: face 2', function(done) {
      var selection;
      setSelection(face1, 1, face1, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('KL');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(1);
          expect(selection.toString().replace(/\s/g, '')).toBe('KL');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayElm._id, 'state:STATE_SHOWN',
            'start:P#face1(1),end:P#face1(3),isCollapsed:false',
            'NoSelection', '_id:' + overlayElm._id, '</avoidSelect>',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_HIDDEN',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ]);

          done();
        }, 10);
      }, 10);
    });
  });

  describe('Target: document', function() {
    beforeAll(function(beforeDone) {
      var timer1;
      utils.makeState([overlayElm, overlayDoc],
        [PlainOverlay.STATE_HIDDEN, PlainOverlay.STATE_SHOWN],
        function() {
          overlayElm.hide(true);
          overlayDoc.hide(true);
          timer1 = setTimeout(function() {
            overlayDoc.show(true);
          }, 10);
          return true;
        },
        function() {
          clearTimeout(timer1);
          beforeDone();
        }
      );
    });

    it('Selection: before 1', function(done) {
      var selection;
      setSelection(pBefore, 0, pBefore, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('AB');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'start:P#p-before(0),end:P#p-before(2),isCollapsed:false',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:P#p-before',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:P#p-before',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:BODY',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:BODY',
            'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: before 2', function(done) {
      var selection;
      setSelection(pBefore, 1, pBefore, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('BC');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'start:P#p-before(1),end:P#p-before(3),isCollapsed:false',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:P#p-before',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:P#p-before',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:BODY',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:BODY',
            'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: before - target', function(done) {
      var selection;
      setSelection(pBefore, 2, pTarget, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('CD');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'start:P#p-before(2),end:P#p-target(1),isCollapsed:false',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:P#p-before',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:P#p-before',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:BODY',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:BODY',
            'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: target 1', function(done) {
      var selection;
      setSelection(pTarget, 0, pTarget, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('DE');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'start:P#p-target(0),end:P#p-target(2),isCollapsed:false',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:P#p-target',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:P#p-target',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:BODY',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:BODY',
            'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: target 2', function(done) {
      var selection;
      setSelection(pTarget, 1, pTarget, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('EF');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'start:P#p-target(1),end:P#p-target(3),isCollapsed:false',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:P#p-target',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:P#p-target',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:BODY',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:BODY',
            'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: target - after', function(done) {
      var selection;
      setSelection(pTarget, 2, pAfter, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('FG');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'start:P#p-target(2),end:P#p-after(1),isCollapsed:false',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:P#p-target',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:P#p-target',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:BODY',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:BODY',
            'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: after 1', function(done) {
      var selection;
      setSelection(pAfter, 0, pAfter, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('GH');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'start:P#p-after(0),end:P#p-after(2),isCollapsed:false',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:P#p-after',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:P#p-after',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:BODY',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:BODY',
            'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: after 2', function(done) {
      var selection;
      setSelection(pAfter, 1, pAfter, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('HI');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'start:P#p-after(1),end:P#p-after(3),isCollapsed:false',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:P#p-after',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:P#p-after',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:BODY',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:BODY',
            'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: after - face', function(done) {
      var selection;
      setSelection(pAfter, 2, face2, 0);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      if (IS_TRIDENT) { // Contains hidden text
        expect(selection.toString().replace(/\s/g, '')).toBe('IJKLM');
      } else {
        expect(selection.toString().replace(/\s/g, '')).toBe('IM');
      }

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(0);
          expect(selection.toString()).toBe('');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'start:P#p-after(2),end:P#face2(1),isCollapsed:false',
            'DONE', '_id:' + overlayDoc._id, '</avoidSelect>',
            'AVOIDED',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ].concat(IS_TRIDENT ? [ // `focus` event is fired by `fireKeyup`?
            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:P#p-after',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:P#p-after',
            'DONE', '_id:' + overlayDoc._id, '</avoidFocus>', // BLURRED
            'AVOIDED', '_id:' + overlayDoc._id, '</focusListener>',

            '<focusListener>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'target:BODY',
            '<avoidFocus>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'element:BODY',
            'NotInTarget', '_id:' + overlayDoc._id, '</avoidFocus>',
            '_id:' + overlayDoc._id, '</focusListener>'
          ] : []));

          done();
        }, 10);
      }, 10);
    });

    it('Selection: face 1', function(done) {
      var selection;
      setSelection(face2, 0, face2, 1);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('MN');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(1);
          expect(selection.toString().replace(/\s/g, '')).toBe('MN');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'start:P#face2(0),end:P#face2(2),isCollapsed:false',
            'NoSelection', '_id:' + overlayDoc._id, '</avoidSelect>',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ]);

          done();
        }, 10);
      }, 10);
    });

    it('Selection: face 2', function(done) {
      var selection;
      setSelection(face2, 1, face2, 2);
      selection = ('getSelection' in window ? window : document).getSelection();
      expect(selection.rangeCount).toBe(1);
      expect(selection.toString().replace(/\s/g, '')).toBe('NO');

      setTimeout(function() { // To check after some events in Trident with setSelection
        traceLog.length = 0;
        fireKeyup();
        setTimeout(function() {
          selection = ('getSelection' in window ? window : document).getSelection();
          expect(selection.rangeCount).toBe(1);
          expect(selection.toString().replace(/\s/g, '')).toBe('NO');

          expect(traceLog).toEqual([
            '<text-select-event>', '_id:' + overlayElm._id, 'state:STATE_HIDDEN',
            '_id:' + overlayElm._id, '</text-select-event>',

            '<text-select-event>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            '<avoidSelect>', '_id:' + overlayDoc._id, 'state:STATE_SHOWN',
            'start:P#face2(1),end:P#face2(3),isCollapsed:false',
            'NoSelection', '_id:' + overlayDoc._id, '</avoidSelect>',
            '_id:' + overlayDoc._id, '</text-select-event>'
          ]);

          done();
        }, 10);
      }, 10);
    });

  });
});
