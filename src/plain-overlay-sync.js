/*
  DON'T MANUALLY EDIT THIS FILE; run `npm run dev-limit` OR `npm run dev-sync` instead.
*/

/*
 * PlainOverlay
 * https://anseki.github.io/plain-overlay/
 *
 * Copyright (c) 2017 anseki
 * Licensed under the MIT license.
 */

import CSSPrefix from 'cssprefix';
import AnimEvent from 'anim-event';
import mClassList from 'm-class-list';
import CSS_TEXT from './default.scss';
// [FACE]
import FACE_DEFS from './face.html?tag=defs';
import FACE_01 from './face.html?tag=face_01';
// [/FACE]
mClassList.ignoreNative = true;

const
  APP_ID = 'plainoverlay',
  STYLE_ELEMENT_ID = `${APP_ID}-style`,
  STYLE_CLASS = APP_ID,
  STYLE_CLASS_DOC = `${APP_ID}-doc`,
  STYLE_CLASS_SHOW = `${APP_ID}-show`,
  STYLE_CLASS_HIDE = `${APP_ID}-hide`,
  STYLE_CLASS_FORCE = `${APP_ID}-force`,
  STYLE_CLASS_BODY = `${APP_ID}-body`,
  FACE_DEFS_ELEMENT_ID = `${APP_ID}-builtin-face-defs`,

  STATE_HIDDEN = 0, STATE_SHOWING = 1, STATE_SHOWN = 2, STATE_HIDING = 3,
  // DURATION = 2500, // COPY: default.scss
  DURATION = 200, // COPY: default.scss
  TOLERANCE = 0.5,

  IS_TRIDENT = !!document.uniqueID,
  IS_EDGE = '-ms-scroll-limit' in document.documentElement.style &&
    '-ms-ime-align' in document.documentElement.style && !window.navigator.msPointerEnabled,
  IS_WEBKIT = !window.chrome && 'WebkitAppearance' in document.documentElement.style, // [DEBUG/]
  IS_BLINK = !!(window.chrome && window.chrome.webstore), // [DEBUG/]
  IS_GECKO = 'MozAppearance' in document.documentElement.style, // [DEBUG/]

  isObject = (() => {
    const toString = {}.toString, fnToString = {}.hasOwnProperty.toString,
      objFnString = fnToString.call(Object);
    return obj => {
      let proto, constr;
      return obj && toString.call(obj) === '[object Object]' &&
        (!(proto = Object.getPrototypeOf(obj)) ||
          (constr = proto.hasOwnProperty('constructor') && proto.constructor) &&
          typeof constr === 'function' && fnToString.call(constr) === objFnString);
    };
  })(),
  isFinite = Number.isFinite || (value => typeof value === 'number' && window.isFinite(value)),

  /**
   * An object that has properties of instance.
   * @typedef {Object} props
   * @property {Element} elmTarget - Target element.
   * @property {Element} elmTargetBody - Target body element.
   * @property {Element} elmOverlay - Overlay element.
   * @property {Element} elmOverlayBody - Overlay body element.
   * @property {boolean} isDoc - `true` if target is document.
   * @property {Window} window - Window that conatins target element.
   * @property {HTMLDocument} document - Document that conatins target element.
   * @property {number} state - Current state.
   * @property {Object} options - Options.
   */

  /** @type {Object.<_id: number, props>} */
  insProps = {};

let insId = 0;

// [DEBUG]
window.insProps = insProps;
window.IS_TRIDENT = IS_TRIDENT;
window.IS_EDGE = IS_EDGE;
window.IS_WEBKIT = IS_WEBKIT;
window.IS_BLINK = IS_BLINK;
window.IS_GECKO = IS_GECKO;
// [/DEBUG]

// [DEBUG]
const traceLog = [];
const STATE_TEXT = {};
STATE_TEXT[STATE_HIDDEN] = 'STATE_HIDDEN';
STATE_TEXT[STATE_SHOWING] = 'STATE_SHOWING';
STATE_TEXT[STATE_SHOWN] = 'STATE_SHOWN';
STATE_TEXT[STATE_HIDING] = 'STATE_HIDING';
// [/DEBUG]

function forceReflow(target) {
  // Trident and Blink bug (reflow like `offsetWidth` can't update)
  setTimeout(() => {
    const parent = target.parentNode, next = target.nextSibling;
    // It has to be removed first for Blink.
    parent.insertBefore(parent.removeChild(target), next);
  }, 0);
}
window.forceReflow = forceReflow; // [DEBUG/]

/**
 * Set style properties while saving current properties.
 * @param {Element} element - Target element.
 * @param {Object} styleProps - New style properties.
 * @param {(Object|null)} savedStyleProps - Current style properties holder.
 * @param {Array} [propNames] - Names of target properties.
 * @returns {Element} Target element itself.
 */
function setStyle(element, styleProps, savedStyleProps, propNames) {
  const style = element.style;
  (propNames || Object.keys(styleProps)).forEach(prop => {
    if (styleProps[prop] != null) {
      if (savedStyleProps && savedStyleProps[prop] == null) {
        savedStyleProps[prop] = style[prop];
      }
      style[prop] = styleProps[prop];
      styleProps[prop] = null;
    }
  });
  return element;
}

/**
 * Restore saved style properties.
 * @param {Element} element - Target element.
 * @param {Object} savedStyleProps - Saved style properties.
 * @param {Array} [propNames] - Names of properties that is restored.
 * @returns {Element} Target element itself.
 */
function restoreStyle(element, savedStyleProps, propNames) {
  return setStyle(element, savedStyleProps, null, propNames);
}

/**
 * An object that simulates `DOMRect` to indicate a bounding-box.
 * @typedef {Object} BBox
 * @property {(number|null)} left - document coordinate
 * @property {(number|null)} top - document coordinate
 * @property {(number|null)} right - document coordinate
 * @property {(number|null)} bottom - document coordinate
 * @property {(number|null)} width
 * @property {(number|null)} height
 */

/**
 * Get an element's bounding-box that contains coordinates relative to the element's document or window.
 * @param {Element} element - Target element.
 * @param {Window} [window] - Whether it's relative to the element's window, or document.
 * @returns {(BBox|null)} A bounding-box or null when failed.
 */
function getBBox(element, window) {
  const rect = element.getBoundingClientRect(),
    bBox = {left: rect.left, top: rect.top,
      right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height};
  if (window) {
    bBox.left += window.pageXOffset;
    bBox.right += window.pageXOffset;
    bBox.top += window.pageYOffset;
    bBox.bottom += window.pageYOffset;
  }
  return bBox;
}
window.getBBox = getBBox; // [DEBUG/]

function scrollLeft(element, isDoc, window, value) {
  if (isDoc) {
    const target = window;
    if (value != null) { target.scrollTo(value, target.pageYOffset); }
    return target.pageXOffset;
  } else {
    const target = element;
    if (value != null) { target.scrollLeft = value; }
    return target.scrollLeft;
  }
}
window.scrollLeft = scrollLeft; // [DEBUG/]

function scrollTop(element, isDoc, window, value) {
  if (isDoc) {
    const target = window;
    if (value != null) { target.scrollTo(target.pageXOffset, value); }
    return target.pageYOffset;
  } else {
    const target = element;
    if (value != null) { target.scrollTop = value; }
    return target.scrollTop;
  }
}
window.scrollTop = scrollTop; // [DEBUG/]

function resizeTarget(props, width, height) {
  const elmTargetBody = props.elmTargetBody;

  let rect = elmTargetBody.getBoundingClientRect();
  if (Math.abs(rect.width - width) < TOLERANCE &&
      Math.abs(rect.height - height) < TOLERANCE) { return; }

  const targetBodyCmpStyle = props.window.getComputedStyle(elmTargetBody, ''),
    boxSizing = targetBodyCmpStyle.boxSizing,
    includeProps = boxSizing === 'border-box' ? [] :
      boxSizing === 'padding-box' ? ['border'] : ['border', 'padding'], // content-box

    PROP_NAMES = {
      border: {
        width: ['borderLeftWidth', 'borderRightWidth'],
        height: ['borderTopWidth', 'borderBottomWidth']
      },
      padding: {
        width: ['paddingLeft', 'paddingRight'],
        height: ['paddingTop', 'paddingBottom']
      }
    },

    values = ['width', 'height'].reduce((values, dir) => {
      includeProps.forEach(part => {
        PROP_NAMES[part][dir].forEach(propName => {
          values[dir] -= parseFloat(targetBodyCmpStyle[propName]);
        });
      });
      return values;
    }, {width: width, height: height});

  // Since the `width` and `height` might change each other, fix both.
  setStyle(elmTargetBody, {
    // The value might be negative number when size is too small.
    width: values.width > 0 ? `${values.width}px` : 0,
    height: values.height > 0 ? `${values.height}px` : 0
  }, props.savedStyleTargetBody);

  // In some browsers, getComputedStyle might return computed values that is not px instead of used values.
  const fixStyle = {};
  rect = elmTargetBody.getBoundingClientRect();
  if (Math.abs(rect.width - width) >= TOLERANCE) {
    // [DEBUG]
    console.warn(`[resizeTarget] Incorrect width: ${rect.width}` +
      ` (expected: ${width} passed: ${values.width})`);
    // [/DEBUG]
    fixStyle.width = `${values.width - (rect.width - width)}px`;
  }
  if (rect.height !== height) {
    // [DEBUG]
    console.warn(`[resizeTarget] Incorrect height: ${rect.height}` +
      ` (expected: ${height} passed: ${values.height})`);
    // [/DEBUG]
    fixStyle.height = `${values.height - (rect.height - height)}px`;
  }
  setStyle(elmTargetBody, fixStyle, props.savedStyleTargetBody);
}
window.resizeTarget = resizeTarget; // [DEBUG/]

// Trident and Edge bug, width and height are interchanged.
function getDocClientWH(props) {
  const elmTarget = props.elmTarget,
    width = elmTarget.clientWidth, height = elmTarget.clientHeight;
  if (IS_TRIDENT || IS_EDGE) {
    const targetBodyCmpStyle = props.window.getComputedStyle(props.elmTargetBody, ''),
      wMode = targetBodyCmpStyle.writingMode || targetBodyCmpStyle['writing-mode'], // Trident bug
      direction = targetBodyCmpStyle.direction;
    return wMode === 'tb-rl' || wMode === 'bt-rl' || wMode === 'tb-lr' || wMode === 'bt-lr' ||
        IS_EDGE && (
          direction === 'ltr' && (wMode === 'vertical-rl' || wMode === 'vertical-lr') ||
          direction === 'rtl' && (wMode === 'vertical-rl' || wMode === 'vertical-lr')) ?
      {width: height, height: width} : // interchange
      {width: width, height: height};
  } else {
    return {width: width, height: height};
  }
}
window.getDocClientWH = getDocClientWH; // [DEBUG/]

function restoreScroll(props, element) {
  traceLog.push('<restoreScroll>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]

  function scrollElement(element, isDoc, left, top) {
    try {
      scrollLeft(element, isDoc, props.window, left);
      scrollTop(element, isDoc, props.window, top);
    } catch (error) { /* Something might have been changed, and that can be ignored. */ }
  }

  if (element) {
    return props.savedElementsScroll.some(elementScroll => {
      if (elementScroll.element === element) {
        scrollElement(elementScroll.element, elementScroll.isDoc, elementScroll.left, elementScroll.top);
        return true;
      }
      return false;
    })
    ? (traceLog.push('DONE:ELEMENT', `_id:${props._id}`, '</restoreScroll>'), true) : // [DEBUG/]
      (traceLog.push('NotInTarget', `_id:${props._id}`, '</restoreScroll>'), false) // [DEBUG/]
    ;
  } else {
    props.savedElementsScroll.forEach(elementScroll => {
      scrollElement(elementScroll.element, elementScroll.isDoc, elementScroll.left, elementScroll.top);
    });
    traceLog.push('DONE:ALL', `_id:${props._id}`, '</restoreScroll>'); // [DEBUG/]
    return true;
  }
}

function restoreAccKeys(props) {
  props.savedElementsAccKeys.forEach(elementAccKeys => {
    try {
      if (elementAccKeys.tabIndex === false) {
        elementAccKeys.element.removeAttribute('tabindex');
      } else if (elementAccKeys.tabIndex != null) {
        elementAccKeys.element.tabIndex = elementAccKeys.tabIndex;
      }
    } catch (error) { /* Something might have been changed, and that can be ignored. */ }

    try {
      if (elementAccKeys.accessKey) {
        elementAccKeys.element.accessKey = elementAccKeys.accessKey;
      }
    } catch (error) { /* Something might have been changed, and that can be ignored. */ }
  });
}
window.restoreAccKeys = restoreAccKeys; // [DEBUG/]

function avoidFocus(props, element) {
  traceLog.push('<avoidFocus>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  if (props.isDoc && element !== element.ownerDocument.body &&
        !(props.elmOverlay.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_CONTAINED_BY) ||
      !props.isDoc && (element === props.elmTargetBody ||
        props.elmTargetBody.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
    if (element.blur) { // Trident and Edge don't support SVG#blur
      element.blur();
    } else {
      element.ownerDocument.body.focus();
    }
    traceLog.push('DONE', `_id:${props._id}`, '</avoidFocus>'); // [DEBUG/]
    return true;
  }
  traceLog.push('NotInTarget', `_id:${props._id}`, '</avoidFocus>'); // [DEBUG/]
  return false;
}

// Selection.containsNode polyfill for Trident
function selContainsNode(selection, node, partialContainment) {
  const nodeRange = node.ownerDocument.createRange(),
    iLen = selection.rangeCount;
  nodeRange.selectNodeContents(node);
  for (let i = 0; i < iLen; i++) {
    const selRange = selection.getRangeAt(i);
    // Edge bug (Issue #7321753); getRangeAt returns empty (collapsed) range
    // NOTE: It can not recover when the selection has multiple ranges.
    if (!selRange.toString().length && selection.toString().length && iLen === 1) {
      console.log('Edge bug (Issue #7321753)'); // [DEBUG/]
      selRange.setStart(selection.anchorNode, selection.anchorOffset);
      selRange.setEnd(selection.focusNode, selection.focusOffset);
      // Edge doesn't throw when end is upper than start.
      if (selRange.toString() !== selection.toString()) {
        selRange.setStart(selection.focusNode, selection.focusOffset);
        selRange.setEnd(selection.anchorNode, selection.anchorOffset);
        if (selRange.toString() !== selection.toString()) {
          throw new Error('Edge bug (Issue #7321753); Couldn\'t recover');
        }
      }
    }
    if (partialContainment ?
        selRange.compareBoundaryPoints(Range.START_TO_END, nodeRange) >= 0 &&
        selRange.compareBoundaryPoints(Range.END_TO_START, nodeRange) <= 0 :
        selRange.compareBoundaryPoints(Range.START_TO_START, nodeRange) < 0 &&
        selRange.compareBoundaryPoints(Range.END_TO_END, nodeRange) > 0) {
      return true;
    }
  }
  return false;
}
window.selContainsNode = selContainsNode; // [DEBUG/]

/**
 * Indicates whether the selection is part of the node or not.
 * @param {Node} node - Target node.
 * @param {Selection} selection - The parsed selection.
 * @returns {boolean} `true` if all ranges of `selection` are part of `node`.
 */
function nodeContainsSel(node, selection) {
  const nodeRange = node.ownerDocument.createRange(),
    iLen = selection.rangeCount;
  nodeRange.selectNode(node);
  for (let i = 0; i < iLen; i++) {
    const selRange = selection.getRangeAt(i);
    if (selRange.compareBoundaryPoints(Range.START_TO_START, nodeRange) < 0 ||
        selRange.compareBoundaryPoints(Range.END_TO_END, nodeRange) > 0) {
      return false;
    }
  }
  return true;
}
window.nodeContainsSel = nodeContainsSel; // [DEBUG/]

function avoidSelect(props) {
  traceLog.push('<avoidSelect>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  const selection = ('getSelection' in window ? props.window : props.document).getSelection();
  if (selection.rangeCount && (props.isDoc ?
      !nodeContainsSel(props.elmOverlayBody, selection) :
      (selection.containsNode ?
        selection.containsNode(props.elmTargetBody, true) :
        selContainsNode(selection, props.elmTargetBody, true))
      )) {
    selection.removeAllRanges();
    props.document.body.focus();
    // Trident bug? It seems that `focus()` makes selection again.
    if (selection.rangeCount > 0) { selection.removeAllRanges(); }
    traceLog.push('DONE', `_id:${props._id}`, '</avoidSelect>'); // [DEBUG/]
    return true;
  }
  traceLog.push('NoSelection', `_id:${props._id}`, '</avoidSelect>'); // [DEBUG/]
  return false;
}

function barLeft(wMode, direction) {
  const svgSpec = wMode === 'rl-tb' || wMode === 'tb-rl' || wMode === 'bt-rl' || wMode === 'rl-bt';
  return IS_TRIDENT && svgSpec ||
    IS_EDGE && (svgSpec ||
      direction === 'rtl' && (wMode === 'horizontal-tb' || wMode === 'vertical-rl') ||
      direction === 'ltr' && wMode === 'vertical-rl');
}
window.barLeft = barLeft; // [DEBUG/]

function barTop(wMode, direction) {
  const svgSpec = wMode === 'bt-rl' || wMode === 'bt-lr' || wMode === 'lr-bt' || wMode === 'rl-bt';
  return IS_TRIDENT && svgSpec ||
    IS_EDGE && (svgSpec ||
      direction === 'rtl' && (wMode === 'vertical-lr' || wMode === 'vertical-rl'));
}
window.barTop = barTop; // [DEBUG/]

function disableDocBars(props) {
  const elmTarget = props.elmTarget, elmTargetBody = props.elmTargetBody,
    targetBodyRect = elmTargetBody.getBoundingClientRect();

  // Get size of each scrollbar.
  let clientWH = getDocClientWH(props),
    barV = -clientWH.width, barH = -clientWH.height; // elmTarget.clientWidth/clientHeight
  setStyle(elmTarget, {overflow: 'hidden'}, props.savedStyleTarget);
  clientWH = getDocClientWH(props);
  barV += clientWH.width;
  barH += clientWH.height;

  if (barV || barH) {
    const targetBodyCmpStyle = props.window.getComputedStyle(elmTargetBody, '');
    let propV, propH;
    // There is no way to get absolute position of document.
    // We need distance between the document and its window, or a method like `element.screenX`
    // that gets absolute position of an element.
    // For the moment, Trident and Edge make a scrollbar at the left/top side when RTL document
    // or CJK vertical document is rendered.
    if (IS_TRIDENT || IS_EDGE) {
      const wMode = targetBodyCmpStyle.writingMode || targetBodyCmpStyle['writing-mode'], // Trident bug
        direction = targetBodyCmpStyle.direction;
      if (barV) { propV = barLeft(wMode, direction) ? 'marginLeft' : 'marginRight'; }
      if (barH) { propH = barTop(wMode, direction) ? 'marginTop' : 'marginBottom'; }
    } else {
      if (barV) { propV = 'marginRight'; }
      if (barH) { propH = 'marginBottom'; }
    }

    const addStyle = {};
    if (barV) { addStyle[propV] = `${parseFloat(targetBodyCmpStyle[propV]) + barV}px`; }
    if (barH) { addStyle[propH] = `${parseFloat(targetBodyCmpStyle[propH]) + barH}px`; }
    setStyle(elmTargetBody, addStyle, props.savedStyleTargetBody);
    resizeTarget(props, targetBodyRect.width, targetBodyRect.height);

    // `overflow: 'hidden'` might change scroll.
    restoreScroll(props, elmTarget);
    return true;
  } else {
    restoreStyle(elmTarget, props.savedStyleTarget, ['overflow']);
    return false;
  }
}
window.disableDocBars = disableDocBars; // [DEBUG/]

function position(props, targetBodyBBox) {
  const elmTargetBody = props.elmTargetBody,
    targetBodyCmpStyle = props.window.getComputedStyle(elmTargetBody, ''),

    elmOverlay = props.elmOverlay,
    overlayCmpStyle = props.window.getComputedStyle(elmOverlay, ''),
    overlayBBox = getBBox(elmOverlay, props.window),

    borders = ['Top', 'Right', 'Bottom', 'Left'].reduce((borders, prop) => {
      borders[prop.toLowerCase()] = parseFloat(targetBodyCmpStyle[`border${prop}Width`]);
      return borders;
    }, {}),

    // Get distance between document and origin of `elmOverlay`.
    offset = {left: overlayBBox.left - parseFloat(overlayCmpStyle.left),
      top: overlayBBox.top - parseFloat(overlayCmpStyle.top)},

    style = {
      left: `${targetBodyBBox.left - offset.left + borders.left}px`,
      top: `${targetBodyBBox.top - offset.top + borders.top}px`,
      width: `${targetBodyBBox.width - borders.left - borders.right}px`,
      height: `${targetBodyBBox.height - borders.top - borders.bottom}px`
    },
    reValue = /^([\d\.]+)(px|%)$/;

  // border-radius
  [
    {prop: 'TopLeft', hBorder: 'left', vBorder: 'top'},
    {prop: 'TopRight', hBorder: 'right', vBorder: 'top'},
    {prop: 'BottomRight', hBorder: 'right', vBorder: 'bottom'},
    {prop: 'BottomLeft', hBorder: 'left', vBorder: 'bottom'}
  ].forEach(corner => {
    const prop = CSSPrefix.getName(`border${corner.prop}Radius`),
      values = targetBodyCmpStyle[prop].split(' ');
    let h = values[0], v = values[1] || values[0],
      matches = reValue.exec(h);
    h = !matches ? 0 :
      matches[2] === 'px' ? +matches[1] :
      matches[1] * targetBodyBBox.width / 100;
    matches = reValue.exec(v);
    v = !matches ? 0 :
      matches[2] === 'px' ? +matches[1] :
      matches[1] * targetBodyBBox.height / 100;

    h -= borders[corner.hBorder];
    v -= borders[corner.vBorder];
    if (h > 0 && v > 0) {
      style[prop] = `${h}px ${v}px`;
    }
  });

  setStyle(elmOverlay, style);
  props.targetBodyBBox = targetBodyBBox;
}
window.position = position; // [DEBUG/]

function getTargetElements(props) {
  const elmTargetBody = props.elmTargetBody,
    elmOverlay = props.elmOverlay,
    targetElements = [props.elmTarget];
  if (props.isDoc) {
    targetElements.push(elmTargetBody);
    Array.prototype.slice.call(elmTargetBody.childNodes).forEach(childNode => {
      if (childNode.nodeType === Node.ELEMENT_NODE &&
          childNode !== elmOverlay &&
          !mClassList(childNode).contains(STYLE_CLASS) &&
          childNode.id !== FACE_DEFS_ELEMENT_ID) {
        targetElements.push(childNode);
        Array.prototype.push.apply(targetElements, childNode.querySelectorAll('*'));
      }
    });
  } else {
    Array.prototype.push.apply(targetElements, elmTargetBody.querySelectorAll('*'));
  }
  return targetElements;
}

function finishShowing(props) {
  traceLog.push('<finishShowing>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  // blur
  props.filterElements = null;
  if (props.options.blur !== false) {
    const propName = CSSPrefix.getName('filter'),
      propValue = CSSPrefix.getValue('filter', `blur(${props.options.blur}px)`);
    if (propValue) { // undefined if no propName
      // Array of {element: element, savedStyle: {}}
      const filterElements = props.isDoc ?
        Array.prototype.slice.call(props.elmTargetBody.childNodes).filter(childNode =>
            childNode.nodeType === Node.ELEMENT_NODE &&
            childNode !== props.elmOverlay &&
            !mClassList(childNode).contains(STYLE_CLASS) &&
            childNode.id !== FACE_DEFS_ELEMENT_ID)
          .map(element => ({element: element, savedStyle: {}})) :
        [{element: props.elmTargetBody, savedStyle: {}}];

      filterElements.forEach(filterElement => {
        const style = {}; // new object for each element.
        style[propName] = propValue;
        setStyle(filterElement.element, style, filterElement.savedStyle);
      });
      props.filterElements = filterElements;
    }
  }

  props.state = STATE_SHOWN;
  traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  if (props.options.onShow) { props.options.onShow.call(props.ins); }
  traceLog.push(`_id:${props._id}`, '</finishShowing>'); // [DEBUG/]
}

function finishHiding(props
    , sync
    ) {
  // sync-mode (`sync` is `true`): Skip restoring active element and finish all immediately.
  traceLog.push('<finishHiding>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  traceLog.push(`sync:${!!sync}`); // [DEBUG/]
  mClassList(props.elmOverlay).add(STYLE_CLASS_HIDE);

  restoreStyle(props.elmTarget, props.savedStyleTarget);
  restoreStyle(props.elmTargetBody, props.savedStyleTargetBody);
  props.savedStyleTarget = {};
  props.savedStyleTargetBody = {};

  restoreAccKeys(props);
  props.savedElementsAccKeys = [];

  if (
      !sync &&
      props.isDoc && props.activeElement) {
    // props.state must be STATE_HIDDEN for avoiding focus.
    const stateSave = props.state;
    props.state = STATE_HIDDEN;
    traceLog.push(`[SAVE1]state:${STATE_TEXT[props.state]}`); // [DEBUG/]
    // the event is fired after function exited in some browsers (e.g. Trident).
    traceLog.push('focusListener:REMOVE'); // [DEBUG/]
    props.elmTargetBody.removeEventListener('focus', props.focusListener, true);
    props.activeElement.focus();
    // Don't change props.state for calling `hide(force)` before `restoreAndFinish` (async-mode)
    props.state = stateSave;
    traceLog.push(`[SAVE2]state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  }
  props.activeElement = null;

  // Since `focus()` might scroll, do this after `focus()` and reflow.
  function restoreAndFinish() {
    traceLog.push('<finishHiding.restoreAndFinish>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
    props.timerRestoreAndFinish = null;
    props.state = STATE_HIDDEN;
    traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
    traceLog.push('focusListener:ADD'); // [DEBUG/]
    props.elmTargetBody.addEventListener('focus', props.focusListener, true);
    restoreScroll(props);
    props.savedElementsScroll = null;

    if (props.options.onHide) { props.options.onHide.call(props.ins); }
    traceLog.push(`_id:${props._id}`, '</finishHiding.restoreAndFinish>'); // [DEBUG/]
  }

  if (props.timerRestoreAndFinish) {
    clearTimeout(props.timerRestoreAndFinish);
    props.timerRestoreAndFinish = null;
  }
  if (sync) {
    restoreAndFinish();
  } else {
    props.timerRestoreAndFinish = setTimeout(restoreAndFinish, 0);
  }
  traceLog.push(`_id:${props._id}`, '</finishHiding>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @returns {void}
 */
function show(props, force) {
  traceLog.push('<show>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  traceLog.push(`force:${!!force}`); // [DEBUG/]

  function getScroll(elements, fromDoc) {

    function elementCanScroll(element, isDoc) {
      const cmpStyle = props.window.getComputedStyle(element, ''),
        tagName = element.nodeName.toLowerCase();
      return (cmpStyle.overflow === 'scroll' || cmpStyle.overflow === 'auto' ||
          cmpStyle.overflowX === 'scroll' || cmpStyle.overflowX === 'auto' ||
          cmpStyle.overflowY === 'scroll' || cmpStyle.overflowY === 'auto') ||
        // document with `visible` might make scrollbars.
        isDoc && (cmpStyle.overflow === 'visible' ||
          cmpStyle.overflowX === 'visible' || cmpStyle.overflowY === 'visible') ||
        // `overflow` of these differs depending on browser.
        !isDoc && (tagName === 'textarea' || tagName === 'select');
    }

    const elementsScroll = [];
    elements.forEach((element, i) => {
      const isDoc = fromDoc && i === 0;
      if (elementCanScroll(element, isDoc)) {
        elementsScroll.push({
          element: element,
          isDoc: isDoc,
          left: scrollLeft(element, isDoc, props.window),
          top: scrollTop(element, isDoc, props.window)
        });
      }
    });
    return elementsScroll;
  }

  function disableAccKeys(elements, fromDoc) {
    const savedElementsAccKeys = [];
    elements.forEach((element, i) => {
      if (fromDoc && i === 0) { return; }

      const elementAccKeys = {},
        tabIndex = element.tabIndex;
      // In Trident and Edge, `tabIndex` of all elements are `0` or something even if the element is not focusable.
      if (tabIndex !== -1) {
        elementAccKeys.element = element;
        elementAccKeys.tabIndex = element.hasAttribute('tabindex') ? tabIndex : false;
        element.tabIndex = -1;
      }

      const accessKey = element.accessKey;
      if (accessKey) {
        elementAccKeys.element = element;
        elementAccKeys.accessKey = accessKey;
        element.accessKey = '';
      }

      if (elementAccKeys.element) {
        savedElementsAccKeys.push(elementAccKeys);
      }
    });
    return savedElementsAccKeys;
  }

  if (props.state === STATE_SHOWN ||
      props.state === STATE_SHOWING && !force ||
      props.state !== STATE_SHOWING &&
        props.options.onBeforeShow && props.options.onBeforeShow.call(props.ins) === false) {
    traceLog.push('CANCEL', '</show>'); // [DEBUG/]
    return;
  }

  const elmOverlay = props.elmOverlay,
    elmOverlayClassList = mClassList(elmOverlay);
  if (props.state === STATE_HIDDEN) {
    props.document.body.appendChild(elmOverlay); // Move to last (for same z-index)
    const targetElements = getTargetElements(props);
    window.targetElements = targetElements; // [DEBUG/]

    elmOverlayClassList.remove(STYLE_CLASS_HIDE); // Before `getBoundingClientRect` (`position`).
    if (!props.isDoc) {
      const elmTargetBody = props.elmTargetBody;
      if (props.window.getComputedStyle(elmTargetBody, '').display === 'inline') {
        setStyle(elmTargetBody, {display: 'inline-block'}, props.savedStyleTargetBody);
      }
      position(props, getBBox(elmTargetBody, props.window));
    }

    props.savedElementsScroll = getScroll(targetElements, props.isDoc);
    props.disabledDocBars = false;
    // savedElementsScroll is empty when document is disconnected.
    if (props.isDoc && props.savedElementsScroll.length && props.savedElementsScroll[0].isDoc) {
      props.disabledDocBars = disableDocBars(props);
    }
    props.savedElementsAccKeys = disableAccKeys(targetElements, props.isDoc);
    props.activeElement = props.document.activeElement;
    if (props.activeElement) { avoidFocus(props, props.activeElement); }
    avoidSelect(props);
    elmOverlay.offsetWidth; /* force reflow */ // eslint-disable-line no-unused-expressions

    if (props.options.onPosition) { props.options.onPosition.call(props.ins); }
  }

  elmOverlayClassList.toggle(STYLE_CLASS_FORCE, !!force);
  elmOverlayClassList.add(STYLE_CLASS_SHOW);
  props.state = STATE_SHOWING;
  traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  if (force) {
    finishShowing(props);
  }
  traceLog.push(`_id:${props._id}`, '</show>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @returns {void}
 */
function hide(props, force
    , sync
    ) {
  // sync-mode (both `force` and `sync` are `true`)
  traceLog.push('<hide>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  traceLog.push(`force:${!!force}`); // [DEBUG/]
  traceLog.push(`sync:${!!sync}`); // [DEBUG/]
  if (props.state === STATE_HIDDEN ||
      props.state === STATE_HIDING && !force ||
      props.state !== STATE_HIDING &&
        props.options.onBeforeHide && props.options.onBeforeHide.call(props.ins) === false) {
    traceLog.push('CANCEL', '</hide>'); // [DEBUG/]
    return;
  }

  // blur
  if (props.filterElements) {
    props.filterElements.forEach(
      filterElement => { restoreStyle(filterElement.element, filterElement.savedStyle); });
    props.filterElements = null;
  }

  const elmOverlayClassList = mClassList(props.elmOverlay);
  elmOverlayClassList.toggle(STYLE_CLASS_FORCE, !!force);
  elmOverlayClassList.remove(STYLE_CLASS_SHOW);
  props.state = STATE_HIDING;
  traceLog.push(`state:${STATE_TEXT[props.state]}`); // [DEBUG/]
  if (force) {
    finishHiding(props
      , sync
      );
  }
  traceLog.push(`_id:${props._id}`, '</hide>'); // [DEBUG/]
}

/**
 * @param {props} props - `props` of instance.
 * @param {Object} newOptions - New options.
 * @returns {void}
 */
function setOptions(props, newOptions) {
  const options = props.options;

  // face
  if (newOptions.hasOwnProperty('face') &&
      (newOptions.face == null ? void 0 : newOptions.face) !== options.face) {
    const elmOverlayBody = props.elmOverlayBody;
    // Clear
    while (elmOverlayBody.firstChild) { elmOverlayBody.removeChild(elmOverlayBody.firstChild); }
    if (newOptions.face === false) { // No face
      options.face = false;
    } else if (newOptions.face && newOptions.face.nodeType === Node.ELEMENT_NODE) { // Specific face
      options.face = newOptions.face;
      elmOverlayBody.appendChild(newOptions.face);
    } else if (newOptions.face == null) { // Builtin face
      // [FACE]
      const elmDocument = props.document;
      if (!elmDocument.getElementById(FACE_DEFS_ELEMENT_ID)) { // Add svg defs
        const defsSvg = (new props.window.DOMParser()).parseFromString(FACE_DEFS, 'image/svg+xml');
        elmDocument.body.appendChild(defsSvg.documentElement);
      }
      // [/FACE]
      options.face = void 0;
      elmOverlayBody.innerHTML = FACE_01; // [FACE/]
    }
  }

  // duration
  if (isFinite(newOptions.duration) && newOptions.duration !== options.duration) {
    options.duration = newOptions.duration;
    props.elmOverlay.style[CSSPrefix.getName('transitionDuration')] =
      newOptions.duration === DURATION ? '' : `${newOptions.duration}ms`;
  }

  // blur
  if (isFinite(newOptions.blur) || newOptions.blur === false) {
    options.blur = newOptions.blur;
  }

  // style
  if (isObject(newOptions.style)) {
    setStyle(props.elmOverlay, newOptions.style);
  }

  // Event listeners
  ['onShow', 'onHide', 'onBeforeShow', 'onBeforeHide', 'onPosition'].forEach(option => {
    if (typeof newOptions[option] === 'function') {
      options[option] = newOptions[option];
    } else if (newOptions.hasOwnProperty(option) && newOptions[option] == null) {
      options[option] = void 0;
    }
  });
}

function scroll(props, target, dirLeft, value) {
  let isDoc, curValue;

  if (target) {
    const targetElements = getTargetElements(props);
    if (targetElements.indexOf(target) === -1) { return curValue; } // return undefined
    isDoc = target.nodeName.toLowerCase() === 'html';
  } else {
    target = props.elmTarget;
    isDoc = props.isDoc;
  }

  const elementScroll = value != null && props.savedElementsScroll &&
    (props.savedElementsScroll.find ?
      props.savedElementsScroll.find(elementScroll => elementScroll.element === target) :
      (elementsScroll => {
        let found;
        elementsScroll.some(elementScroll => {
          if (elementScroll.element === target) {
            found = elementScroll;
            return true;
          }
          return false;
        });
        return found;
      })(props.savedElementsScroll));

  curValue = (dirLeft ? scrollLeft : scrollTop)(target, isDoc, props.window, value);
  if (elementScroll) { elementScroll[dirLeft ? 'left' : 'top'] = curValue; }
  return curValue;
}

class PlainOverlay {
  /**
   * Create a `PlainOverlay` instance.
   * @param {Element} [target] - Target element.
   * @param {Object} [options] - Options.
   */
  constructor(target, options) {

    /**
     * @param {Object} [target] - Element or something that is checked.
     * @returns {(Element|null)} Valid element or null.
     */
    function getTarget(target) {
      let validElement;
      if (!target) {
        validElement = document.documentElement; // documentElement of current document
      } else if (target.nodeType) {
        if (target.nodeType === Node.DOCUMENT_NODE) {
          validElement = target.documentElement; // documentElement of target document
        } else if (target.nodeType === Node.ELEMENT_NODE) {
          const nodeName = target.nodeName.toLowerCase();
          validElement =
            nodeName === 'body' ? target.ownerDocument.documentElement : // documentElement of target body
            nodeName === 'iframe' || nodeName === 'frame' ?
              target.contentDocument.documentElement : // documentElement of target frame
            target;
        }
        if (!validElement) { throw new Error('This element is not accepted.'); }
      } else if (target === target.window) {
        validElement = target.document.documentElement; // documentElement of target window
      }
      return validElement;
    }

    const props = {
      ins: this,
      options: { // Initial options (not default)
        face: false, // Initial state.
        duration: DURATION, // Initial state.
        blur: false // Initial state.
      },
      state: STATE_HIDDEN,
      savedStyleTarget: {},
      savedStyleTargetBody: {}
    };

    Object.defineProperty(this, '_id', {value: ++insId});
    props._id = this._id;
    insProps[this._id] = props;

    if (arguments.length === 1) {
      if (!(props.elmTarget = getTarget(target))) {
        if (!isObject(target)) { throw new Error('Invalid argument.'); }
        props.elmTarget = document.documentElement; // documentElement of current document
        options = target;
      }
    } else if (!(props.elmTarget = getTarget(target))) {
      throw new Error('This target is not accepted.');
    }
    if (!options) {
      options = {};
    } else if (!isObject(options)) {
      throw new Error('Invalid options.');
    }

    props.isDoc = props.elmTarget.nodeName.toLowerCase() === 'html';
    const elmDocument = props.document = props.elmTarget.ownerDocument;
    props.window = elmDocument.defaultView;
    const elmTargetBody = props.elmTargetBody = props.isDoc ? elmDocument.body : props.elmTarget;

    // Setup window
    if (!elmDocument.getElementById(STYLE_ELEMENT_ID)) {
      const head = elmDocument.getElementsByTagName('head')[0] || elmDocument.documentElement,
        sheet = head.insertBefore(elmDocument.createElement('style'), head.firstChild);
      sheet.type = 'text/css';
      sheet.id = STYLE_ELEMENT_ID;
      sheet.textContent = CSS_TEXT;
      if (IS_TRIDENT || IS_EDGE) { forceReflow(sheet); } // Trident bug
    }

    // elmOverlay
    const elmOverlay = props.elmOverlay = elmDocument.createElement('div'),
      elmOverlayClassList = mClassList(elmOverlay);
    elmOverlayClassList.add(STYLE_CLASS, STYLE_CLASS_HIDE);
    if (props.isDoc) { elmOverlayClassList.add(STYLE_CLASS_DOC); }
    elmOverlay.forceEventTarget = target; // [DEBUG/]

    (listener => {
      ['transitionend', 'webkitTransitionEnd', 'oTransitionEnd', 'otransitionend'].forEach(type => {
        elmOverlay.addEventListener(type, listener, true);
      });
    })(event => {
      if (event.target === elmOverlay && event.propertyName === 'opacity') {
        if (props.state === STATE_SHOWING) {
          finishShowing(props);
        } else if (props.state === STATE_HIDING) {
          finishHiding(props);
        }
      }
    });

    (props.isDoc ? props.window : elmTargetBody).addEventListener('scroll', event => {
      traceLog.push('<scroll-event>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
      const target = event.target;
      if (props.state !== STATE_HIDDEN &&
          restoreScroll(props,
            props.isDoc &&
                (target === props.window || target === props.document || target === props.elmTargetBody) ?
              props.elmTarget : target)) {
        traceLog.push('AVOIDED'); // [DEBUG/]
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      traceLog.push(`_id:${props._id}`, '</scroll-event>'); // [DEBUG/]
    }, true);

    // props.state can't control the listener
    // because the event is fired after flow function exited in some browsers (e.g. Trident).
    props.focusListener = event => {
      traceLog.push('<focusListener>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
      if (props.state !== STATE_HIDDEN && avoidFocus(props, event.target)) {
        traceLog.push('AVOIDED'); // [DEBUG/]
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      traceLog.push(`_id:${props._id}`, '</focusListener>'); // [DEBUG/]
    };
    elmTargetBody.addEventListener('focus', props.focusListener, true);

    (listener => { // simulation "text-select" event
      ['keyup', 'mouseup'].forEach(type => {
        // To listen to keydown in the target and keyup in outside, it is window, not `elmTargetBody`.
        props.window.addEventListener(type, listener, true);
      });
    })(event => {
      traceLog.push('<text-select-event>', `_id:${props._id}`, `state:${STATE_TEXT[props.state]}`); // [DEBUG/]
      if (props.state !== STATE_HIDDEN && avoidSelect(props)) {
        traceLog.push('AVOIDED'); // [DEBUG/]
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      traceLog.push(`_id:${props._id}`, '</text-select-event>'); // [DEBUG/]
    });

    // Gecko bug, multiple calling (parallel) by `requestAnimationFrame`.
    props.resizing = false;
    props.window.addEventListener('resize', AnimEvent.add(() => {
      if (props.resizing) {
        console.warn('`resize` event listener is already running.'); // [DEBUG/]
        return;
      }
      props.resizing = true;
      if (props.state !== STATE_HIDDEN) {
        if (props.isDoc) {
          if (props.savedElementsScroll.length && props.savedElementsScroll[0].isDoc) {
            if (props.disabledDocBars) { // Restore DocBars
              console.log('Restore DocBars'); // [DEBUG/]
              restoreStyle(props.elmTarget, props.savedStyleTarget, ['overflow']);
              restoreStyle(elmTargetBody, props.savedStyleTargetBody,
                ['marginLeft', 'marginRight', 'marginTop', 'marginBottom', 'width', 'height']);
            }
            console.log('disableDocBars'); // [DEBUG/]
            props.disabledDocBars = disableDocBars(props);
          }
        } else {
          const bBox = getBBox(elmTargetBody, props.window),
            lastBBox = props.targetBodyBBox;
          if (bBox.left !== lastBBox.left || bBox.top !== lastBBox.top ||
              bBox.width !== lastBBox.width || bBox.height !== lastBBox.height) {
            console.log('Update position'); // [DEBUG/]
            position(props, bBox);
          }
        }
        if (props.options.onPosition) { props.options.onPosition.call(props.ins); }
      }
      props.resizing = false;
    }), true);

    // Avoid scroll on touch device
    elmOverlay.addEventListener('touchmove', event => {
      if (props.state !== STATE_HIDDEN) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    // elmOverlayBody
    (props.elmOverlayBody = elmOverlay.appendChild(elmDocument.createElement('div')))
      .className = STYLE_CLASS_BODY;

    elmDocument.body.appendChild(elmOverlay);

    // Default options
    if (!options.hasOwnProperty('face')) { options.face = null; }

    setOptions(props, options);
  }

  /**
   * @param {Object} options - New options.
   * @returns {PlainOverlay} Current instance itself.
   */
  setOptions(options) {
    if (isObject(options)) {
      setOptions(insProps[this._id], options);
    }
    return this;
  }

  /**
   * Show the overlay.
   * @param {boolean} [force] - Show it immediately without effect.
   * @param {Object} [options] - New options.
   * @returns {PlainOverlay} Current instance itself.
   */
  show(force, options) {
    if (arguments.length < 2 && typeof force !== 'boolean') {
      options = force;
      force = false;
    }

    this.setOptions(options);
    show(insProps[this._id], force);
    return this;
  }

  /**
   * Hide the overlay.
   * @param {boolean} [force] - Hide it immediately without effect.
   * @returns {PlainOverlay} Current instance itself.
   */
  hide(force
      , sync
      ) {
    // sync-mode (both `force` and `sync` are `true`)
    hide(insProps[this._id], force
      , sync
      );
    return this;
  }

  scrollLeft(value, target) {
    return scroll(insProps[this._id], target, true, value);
  }

  scrollTop(value, target) {
    return scroll(insProps[this._id], target, false, value);
  }

  position() {
    const props = insProps[this._id];
    if (props.state !== STATE_HIDDEN) {
      if (!props.isDoc) { position(props, getBBox(props.elmTargetBody, props.window)); }
      if (props.options.onPosition) { props.options.onPosition.call(props.ins); }
    }
    return this;
  }

  get state() {
    return insProps[this._id].state;
  }

  get style() {
    return insProps[this._id].elmOverlay.style;
  }

  get face() { return insProps[this._id].options.face; }
  set face(value) { setOptions(insProps[this._id], {face: value}); }

  get duration() { return insProps[this._id].options.duration; }
  set duration(value) { setOptions(insProps[this._id], {duration: value}); }

  get blur() { return insProps[this._id].options.blur; }
  set blur(value) { setOptions(insProps[this._id], {blur: value}); }

  get onShow() { return insProps[this._id].options.onShow; }
  set onShow(value) { setOptions(insProps[this._id], {onShow: value}); }

  get onHide() { return insProps[this._id].options.onHide; }
  set onHide(value) { setOptions(insProps[this._id], {onHide: value}); }

  get onBeforeShow() { return insProps[this._id].options.onBeforeShow; }
  set onBeforeShow(value) { setOptions(insProps[this._id], {onBeforeShow: value}); }

  get onBeforeHide() { return insProps[this._id].options.onBeforeHide; }
  set onBeforeHide(value) { setOptions(insProps[this._id], {onBeforeHide: value}); }

  get onPosition() { return insProps[this._id].options.onPosition; }
  set onPosition(value) { setOptions(insProps[this._id], {onPosition: value}); }

  static show(target, options) {
    return (new PlainOverlay(target, options)).show();
  }

  static get STATE_HIDDEN() { return STATE_HIDDEN; }
  static get STATE_SHOWING() { return STATE_SHOWING; }
  static get STATE_SHOWN() { return STATE_SHOWN; }
  static get STATE_HIDING() { return STATE_HIDING; }
}

/* [FACE/]
PlainOverlay.limit = true;
[FACE/] */

// [DEBUG]
/*
  For test, fire `transitionend` event even if view is hidden.
*/
PlainOverlay.forceEvent = false;
{
  const FORCE_EVENT_TYPE = 'transitionend',
    PROPERTY_NAME = 'opacity',
    TRIGGER_CLASS = STYLE_CLASS_SHOW,
    FORCE_CLASS = STYLE_CLASS_FORCE;

  function getIdLog(element) {
    return `target.id:${element.forceEventTarget && element.forceEventTarget.id || 'UNKNOWN'}`;
  }

  function fireEvent(element) {
    traceLog.push('<fireEvent>', getIdLog(element));
    console.warn(`[forceEvent] Fired: ${FORCE_EVENT_TYPE}`);
    let event;
    if (element.timer) { clearTimeout(element.timer); } // This may be needed.
    element.timer = null;
    try {
      event = new TransitionEvent(FORCE_EVENT_TYPE, {propertyName: PROPERTY_NAME});
    } catch (error) {
      event = document.createEvent('TransitionEvent');
      event.initTransitionEvent(FORCE_EVENT_TYPE, false, false, PROPERTY_NAME, 0);
    }
    element.dispatchEvent(event);
    traceLog.push('</fireEvent>');
  }

  function initEvent(element, duration) {
    traceLog.push('<initEvent>', getIdLog(element), `duration:${duration}`);
    console.warn(`[forceEvent] Trigger class: ${TRIGGER_CLASS} / duration: ${duration}`);
    if (element.timer) {
      traceLog.push('ClearPrevEvent');
      console.warn('[forceEvent] ClearPrevEvent');
      clearTimeout(element.timer);
    }
    element.timer = setTimeout(() => { fireEvent(element); }, duration);
    traceLog.push('</initEvent>');
  }

  mClassList.hookApply((list, element) => {
    traceLog.push('<mClassList.hookApply>', `list:${list.join(',')}`, getIdLog(element));
    if (!PlainOverlay.forceEvent) {
      traceLog.push('PlainOverlay.forceEvent:false', 'CANCEL', '</mClassList.hookApply>');
      return;
    }

    if (list.indexOf(FORCE_CLASS) !== -1) {
      traceLog.push('FORCE_CLASS:true');
      if (element.timer) {
        traceLog.push('ClearPrevEvent');
        console.warn('[forceEvent] ClearPrevEvent');
        clearTimeout(element.timer);
        element.timer = null;
      }
      traceLog.push('CANCEL', '</mClassList.hookApply>');
      return;
    }

    const
      elmList = (element.getAttribute('class') || '').trim().split(/\s+/).filter(token => !!token),
      elementHasTrigger = elmList.indexOf(TRIGGER_CLASS) !== -1,
      listHasTrigger = list.indexOf(TRIGGER_CLASS) !== -1;

    if (elementHasTrigger === listHasTrigger) {
      traceLog.push('TriggerClassNotChanged', 'CANCEL', '</mClassList.hookApply>');
      return;
    }

    // Remove animation of all properties (Can't remove only `opacity` when it is `all`).
    element.style[CSSPrefix.getName('transitionProperty')] = 'none';
    const cmpStyle = element.ownerDocument.defaultView.getComputedStyle(element, '');
    let duration = cmpStyle[CSSPrefix.getName('transitionDuration')];
    duration = duration.replace(/^([\d\.]+)(m?s)$/, (s, num, ms) => num * (ms === 's' ? 1000 : 1)) * 1;
    initEvent(element, duration);
    traceLog.push('</mClassList.hookApply>');
  });
}
// [/DEBUG]

// [DEBUG]
PlainOverlay.traceLog = traceLog;
PlainOverlay.STATE_TEXT = STATE_TEXT;
// [/DEBUG]

export default PlainOverlay;
