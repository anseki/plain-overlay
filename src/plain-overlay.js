/*
 * PlainOverlay
 * https://github.com/anseki/plain-overlay
 *
 * Copyright (c) 2016 anseki
 * Licensed under the MIT license.
 */

import CSSPrefix from 'cssprefix';
import CSS_TEXT from './default.css';
import FACE from './face.html';

const
  APP_ID = 'plainoverlay', // COPY: default.scss
  STYLE_ELEMENT_ID = `${APP_ID}-style`,
  STYLE_CLASS = APP_ID,
  STYLE_CLASS_DOC = `${APP_ID}-doc`,
  STYLE_CLASS_SHOW = `${APP_ID}-show`,
  STYLE_CLASS_HIDE = `${APP_ID}-hide`,
  STYLE_CLASS_BODY = `${APP_ID}-body`,

  STATE_HIDDEN = 0, STATE_SHOWING = 1, STATE_SHOWN = 2, STATE_HIDING = 3,
  DURATION = 2500, // COPY: default.scss
  TOLERANCE = 0.5,

  IS_TRIDENT = !!document.uniqueID,
  IS_BLINK = !!(window.chrome && window.chrome.webstore),
  IS_GECKO = 'MozAppearance' in document.documentElement.style,
  IS_EDGE = '-ms-scroll-limit' in document.documentElement.style &&
    '-ms-ime-align' in document.documentElement.style && !window.navigator.msPointerEnabled,
  IS_WEBKIT = !window.chrome && 'WebkitAppearance' in document.documentElement.style,

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
window.IS_BLINK = IS_BLINK;
window.IS_GECKO = IS_GECKO;
window.IS_EDGE = IS_EDGE;
window.IS_WEBKIT = IS_WEBKIT;
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
 * @returns {(BBox|null)} - A bounding-box or null when failed.
 */
function getBBox(element, window) {
  var rect = element.getBoundingClientRect(),
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

  function scrollElement(element, isDoc, scrollLeft, scrollTop) {
    try {
      scrollLeft(element, isDoc, props.window, scrollLeft);
      scrollTop(element, isDoc, props.window, scrollTop);
    } catch (error) { /* Something might have been changed, and that can be ignored. */ }
  }

  if (element) {
    return props.savedElementsScroll.some(elementScroll => {
      if (elementScroll.element === element) {
        scrollElement(elementScroll.element, elementScroll.isDoc,
          elementScroll.scrollLeft, elementScroll.scrollTop);
        return true;
      }
      return false;
    });
  } else {
    props.savedElementsScroll.forEach(elementScroll => {
      scrollElement(elementScroll.element, elementScroll.isDoc,
        elementScroll.scrollLeft, elementScroll.scrollTop);
    });
    return true;
  }
}

function restoreAccKeys(props) {
  props.savedElementsProps.forEach(savedProps => {
    try {
      if (savedProps.tabIndex === false) {
        savedProps.element.removeAttribute('tabindex');
      } else if (savedProps.tabIndex != null) {
        savedProps.element.tabIndex = savedProps.tabIndex;
      }
    } catch (error) { /* Something might have been changed, and that can be ignored. */ }

    try {
      if (savedProps.accessKey) {
        savedProps.element.accessKey = savedProps.accessKey;
      }
    } catch (error) { /* Something might have been changed, and that can be ignored. */ }
  });
}
window.restoreAccKeys = restoreAccKeys; // [DEBUG/]

function avoidFocus(props, element) {
  if (props.isDoc && element !== element.ownerDocument.body &&
        !(props.elmOverlay.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_CONTAINED_BY) ||
      !props.isDoc && (element === props.elmTargetBody ||
        props.elmTargetBody.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_CONTAINED_BY)) {
    element.blur();
    return true;
  }
  return false;
}

function avoidSelect(props) {
  const selection = ('getSelection' in window ? props.window : props.document).getSelection();
  if (selection.rangeCount && (props.isDoc || selection.containsNode(props.elmTargetBody, true))) {
    selection.removeAllRanges();
    props.document.body.focus();
    return true;
  }
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
  const elmTargetBody = props.elmTargetBody,
    targetBodyRect = elmTargetBody.getBoundingClientRect();

  // Get size of each scrollbar.
  let clientWH = getDocClientWH(props),
    barV = -clientWH.width, barH = -clientWH.height; // elmTarget.clientWidth/clientHeight
  setStyle(props.elmTarget, {overflow: 'hidden'}, props.savedStyleTarget);
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
    restoreScroll(props, props.elmTarget);
    return true;
  } else {
    restoreStyle(props.elmTarget, props.savedStyleTarget, ['overflow']);
    return false;
  }
}
window.disableDocBars = disableDocBars; // [DEBUG/]

function position(props) {
  const elmTargetBody = props.elmTargetBody,
    targetBodyCmpStyle = props.window.getComputedStyle(elmTargetBody, ''),
    targetBodyBBox = getBBox(elmTargetBody, props.window),

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
    const prop = CSSPrefix.getProp(`border${corner.prop}Radius`, elmTargetBody),
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
}
window.position = position; // [DEBUG/]

function finishShowing(props) {
  props.state = STATE_SHOWN;
  // event
}

function finishHiding(props) {
  props.elmOverlay.classList.add(STYLE_CLASS_HIDE);

  restoreStyle(props.elmTarget, props.savedStyleTarget);
  restoreStyle(props.elmTargetBody, props.savedStyleTargetBody);
  props.savedStyleTarget = {};
  props.savedStyleTargetBody = {};

  restoreScroll(props);
  restoreAccKeys(props);
  props.savedElementsScroll = props.savedElementsProps = null;
  if (props.activeElement) {
    if (props.isDoc) {
      (element => {
        setTimeout(function() { element.focus(); }, 0); // props.state must be STATE_HIDDEN
      })(props.activeElement);
    }
    props.activeElement = null;
  }

  props.state = STATE_HIDDEN;
  // event
}

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function show(props) {
  if (props.state === STATE_SHOWING || props.state === STATE_SHOWN) { return; }

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
          scrollLeft: scrollLeft(element, isDoc, props.window),
          scrollTop: scrollTop(element, isDoc, props.window)
        });
      }
    });
    return elementsScroll;
  }

  function disableAccKeys(elements, fromDoc) {
    const savedElementsProps = [];
    elements.forEach((element, i) => {
      if (fromDoc && i === 0) { return; }

      const savedProps = {},
        tabIndex = element.tabIndex;
      if (tabIndex !== -1) {
        savedProps.element = element;
        savedProps.tabIndex = element.hasAttribute('tabindex') ? tabIndex : false;
        element.tabIndex = -1;
      }

      const accessKey = element.accessKey;
      if (accessKey) {
        savedProps.element = element;
        savedProps.accessKey = accessKey;
        element.accessKey = '';
      }

      if (savedProps.element) {
        savedElementsProps.push(savedProps);
      }
    });
    return savedElementsProps;
  }

  const elmOverlay = props.elmOverlay;
  if (props.state === STATE_HIDDEN) {
    const elmTargetBody = props.elmTargetBody,
      targetElements = [elmTargetBody];
    window.targetElements = targetElements; // [DEBUG/]

    elmOverlay.classList.remove(STYLE_CLASS_HIDE); // Before `getBoundingClientRect` (`position`).
    if (props.isDoc) {
      Array.prototype.slice.call(elmTargetBody.childNodes).forEach(childNode => {
        if (childNode.nodeType === Node.ELEMENT_NODE && childNode !== elmOverlay) {
          targetElements.push(childNode);
          Array.prototype.push.apply(targetElements, childNode.querySelectorAll('*'));
        }
      });
    } else {
      if (props.window.getComputedStyle(elmTargetBody, '').display === 'inline') {
        setStyle(elmTargetBody, {display: 'inline-block'}, props.savedStyleTargetBody);
      }
      position(props);
      Array.prototype.push.apply(targetElements, elmTargetBody.querySelectorAll('*'));
    }

    props.savedElementsScroll = getScroll(targetElements, props.isDoc);
    if (props.isDoc && props.savedElementsScroll[0].isDoc) { disableDocBars(props); }
    props.savedElementsProps = disableAccKeys(targetElements, props.isDoc);
    props.activeElement = props.document.activeElement;
    if (props.activeElement) { avoidFocus(props, props.activeElement); }
    avoidSelect(props);
    elmOverlay.offsetWidth; /* force reflow */ // eslint-disable-line no-unused-expressions
  }
  elmOverlay.classList.add(STYLE_CLASS_SHOW);
  props.state = STATE_SHOWING;
}

/**
 * @param {props} props - `props` of instance.
 * @param {boolean} [force] - Skip effect.
 * @returns {void}
 */
function hide(props, force) {
  if (props.state === STATE_HIDDEN) { return; }
  props.elmOverlay.classList.remove(STYLE_CLASS_SHOW);
  if (force) {
    props.state = STATE_HIDDEN; // To skip transitionend.
    finishHiding(props);
  } else {
    props.state = STATE_HIDING;
  }
}

/**
 * @param {props} props - `props` of instance.
 * @param {Object} newOptions - New options.
 * @returns {void}
 */
function setOptions(props, newOptions) {
  const options = props.options,
    elmTarget = props.elmTarget, elmTargetBody = props.elmTargetBody,
    elmOverlay = props.elmOverlay, elmOverlayBody = props.elmOverlayBody;

  // face
  if ((newOptions.face == null ? void 0 : newOptions.face) !== options.face) {
    // Clear
    while (elmOverlayBody.firstChild) { elmOverlayBody.removeChild(elmOverlayBody.firstChild); }
    if (newOptions.face === false) {
      options.face = false;
    } else if (newOptions.face && newOptions.face.nodeType === Node.ELEMENT_NODE) {
      options.face = newOptions.face;
      elmOverlayBody.appendChild(newOptions.face);
    } else {
      options.face = void 0;
      elmOverlayBody.innerHTML = FACE;
    }
  }

  // duration
  if (isFinite(newOptions.duration) && newOptions.duration !== options.duration) {
    options.duration = newOptions.duration;
    elmOverlay.style[CSSPrefix.getProp('transitionDuration', elmOverlay)] =
      newOptions.duration === DURATION ? '' : `${newOptions.duration}ms`;
  }

  if (isObject(newOptions.style)) {
    setStyle(props.elmOverlay, newOptions.style);
  }
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
     * @returns {(Element|null)} - Valid element or null.
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
            nodeName === 'script' || nodeName === 'style' || nodeName === 'svg' ? null : // deny
            target;
        }
        if (!validElement) { throw new Error('This element is not accepted.'); }
      } else if (target === target.window) {
        validElement = target.document.documentElement; // documentElement of target window
      }
      return validElement;
    }

    const props = {
      options: { // Initial options (not default)
        face: '',
        duration: DURATION
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
    } else {
      if (!(props.elmTarget = getTarget(target))) { throw new Error('This target is not accepted.'); }
      if (options && !isObject(options)) { throw new Error('Invalid options.'); }
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
      if (IS_TRIDENT) { forceReflow(sheet); } // Trident bug
    }

    // elmOverlay
    const elmOverlay = props.elmOverlay = elmDocument.createElement('div');
    // Trident bug, multiple and space-separated tokens are ignored.
    // elmOverlay.classList.add(STYLE_CLASS, STYLE_CLASS_HIDE);
    elmOverlay.classList.add(STYLE_CLASS);
    elmOverlay.classList.add(STYLE_CLASS_HIDE);
    if (props.isDoc) { elmOverlay.classList.add(STYLE_CLASS_DOC); }

    elmOverlay.addEventListener('transitionend', event => {
      if (event.target === elmOverlay && event.propertyName === 'opacity') {
        if (props.state === STATE_SHOWING) {
          finishShowing(props);
        } else if (props.state === STATE_HIDING) {
          finishHiding(props);
        }
      }
    }, false);

    (props.isDoc ? props.window : elmTargetBody).addEventListener('scroll', event => {
      if (props.state !== STATE_HIDDEN && restoreScroll(props, event.target)) {
        console.log('avoidScroll'); // [DEBUG/]
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    elmTargetBody.addEventListener('focus', event => {
      if (props.state !== STATE_HIDDEN && avoidFocus(props, event.target)) {
        console.log('avoidFocus'); // [DEBUG/]
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    }, true);

    (listener => { // simulation "text-select" event
      ['keyup', 'mouseup'].forEach(type => {
        elmTargetBody.addEventListener(type, listener, true);
      });
    })(event => {
      if (props.state !== STATE_HIDDEN && avoidSelect(props)) {
        console.log('avoidSelect'); // [DEBUG/]
        event.preventDefault();
        event.stopImmediatePropagation();
      }
    });

    // Avoid scroll on touch device
    elmOverlay.addEventListener('touchmove', event => {
      if (props.state !== STATE_HIDDEN) {
        event.preventDefault();
      }
    }, true);

    // elmOverlayBody
    (props.elmOverlayBody = elmOverlay.appendChild(elmDocument.createElement('div')))
      .className = STYLE_CLASS_BODY;

    elmDocument.body.appendChild(elmOverlay);
    setOptions(props, options || {});
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
   * @param {Object} [options] - New options.
   * @returns {PlainOverlay} Current instance itself.
   */
  show(options) {
    this.setOptions(options);
    show(insProps[this._id]);
    return this;
  }

  /**
   * Hide the overlay.
   * @param {boolean} [force] - Hide it immediately without effect.
   * @returns {PlainOverlay} Current instance itself.
   */
  hide(force) {
    hide(insProps[this._id], force);
    return this;
  }

  get face() {
    return insProps[this._id].options.face;
  }
  set face(value) {
    setOptions(insProps[this._id], {face: value});
  }

  get duration() {
    return insProps[this._id].options.duration;
  }
  set duration(value) {
    setOptions(insProps[this._id], {duration: value});
  }

  get state() {
    return insProps[this._id].state;
  }

  get style() {
    return insProps[this._id].elmOverlay.style;
  }

  static show(options) {
    return (new PlainOverlay(options)).show();
  }
}

PlainOverlay.STATE_HIDDEN = STATE_HIDDEN;
PlainOverlay.STATE_SHOWING = STATE_SHOWING;
PlainOverlay.STATE_SHOWN = STATE_SHOWN;
PlainOverlay.STATE_HIDING = STATE_HIDING;

export default PlainOverlay;
