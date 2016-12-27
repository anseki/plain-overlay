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
  STYLE_CLASS_BODY = `${APP_ID}-body`,
  STYLE_CLASS_SHOW = `${APP_ID}-show`,
  STYLE_CLASS_HIDE = `${APP_ID}-hide`,
  STYLE_CLASS_ANCHOR = `${APP_ID}-anchor`,

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
   * @property {Element} elmAnchor - Element to get position.
   * @property {boolean} isDoc - `true` if target is document.
   * @property {boolean} canScroll - `true` if target can be scrollable element.
   * @property {Window} window - Window that conatins target element.
   * @property {HTMLDocument} document - Document that conatins target element.
   * @property {number} state - Current state.
   * @property {Object} options - Options.
   */

  /** @type {Object.<_id: number, props>} */
  insProps = {};

let insId = 0, propNameTransitionDuration;

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
 * @param {Object} [savedStyleProps] - Current style properties holder.
 * @returns {Element} Target element itself.
 */
function setStyle(element, styleProps, savedStyleProps) {
  const style = element.style;
  Object.keys(styleProps).forEach(prop => {
    if (styleProps[prop] != null) {
      if (savedStyleProps && savedStyleProps[prop] == null) {
        savedStyleProps[prop] = style[prop];
      }
      style[prop] = styleProps[prop];
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
  return setStyle(element,
    propNames ? propNames.reduce((styleProps, prop) => {
      styleProps[prop] = savedStyleProps[prop];
      return styleProps;
    }, {}) : savedStyleProps);
}

function scrollLeft(props, value) {
  if (props.isDoc) {
    const target = props.window;
    if (value != null) { target.scrollTo(value, target.pageYOffset); }
    return target.pageXOffset;
  } else {
    const target = props.elmTarget;
    if (value != null) { target.scrollLeft = value; }
    return target.scrollLeft;
  }
}
window.scrollLeft = scrollLeft; // [DEBUG/]

function scrollTop(props, value) {
  if (props.isDoc) {
    const target = props.window;
    if (value != null) { target.scrollTo(target.pageXOffset, value); }
    return target.pageYOffset;
  } else {
    const target = props.elmTarget;
    if (value != null) { target.scrollTop = value; }
    return target.scrollTop;
  }
}
window.scrollTop = scrollTop; // [DEBUG/]

function resizeTarget(props, width, height) {
  const elmTargetBody = props.elmTargetBody;

  let bBox = elmTargetBody.getBoundingClientRect();
  if (Math.abs(bBox.width - width) < TOLERANCE &&
      Math.abs(bBox.height - height) < TOLERANCE) { return; }

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

  setStyle(elmTargetBody, {
    // The value might be negative number when size is too small.
    width: values.width > 0 ? `${values.width}px` : 0,
    height: values.height > 0 ? `${values.height}px` : 0
  }, props.savedPropsTargetBody);

  // In some browsers, getComputedStyle might return computed values that is not px instead of used values.
  const fixStyle = {};
  bBox = elmTargetBody.getBoundingClientRect();
  if (Math.abs(bBox.width - width) >= TOLERANCE) {
    // [DEBUG]
    console.warn(`[resizeTarget] Incorrect width: ${bBox.width}` +
      ` (expected: ${width} passed: ${values.width})`);
    // [/DEBUG]
    fixStyle.width = `${values.width - (bBox.width - width)}px`;
  }
  if (bBox.height !== height) {
    // [DEBUG]
    console.warn(`[resizeTarget] Incorrect height: ${bBox.height}` +
      ` (expected: ${height} passed: ${values.height})`);
    // [/DEBUG]
    fixStyle.height = `${values.height - (bBox.height - height)}px`;
  }
  setStyle(elmTargetBody, fixStyle, props.savedPropsTargetBody);
}
window.resizeTarget = resizeTarget; // [DEBUG/]

// Trident and Edge bug, width and height are interchanged.
function getTargetClientWH(props) {
  const elmTarget = props.elmTarget,
    width = elmTarget.clientWidth, height = elmTarget.clientHeight;
  if (props.isDoc && (IS_TRIDENT || IS_EDGE)) {
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
window.getTargetClientWH = getTargetClientWH; // [DEBUG/]

/**
 * Get bounding box for `props.overlayBodyBBox`.
 * @param {props} props - `props` of instance.
 * @returns {Function} A function to restore elmTargetBody that was changed for getting position.
 */
function initOverlayBodyBBox(props) {
  const overlayBodyBBox = props.overlayBodyBBox = getTargetClientWH(props);
  if (props.isDoc) {
    overlayBodyBBox.left = overlayBodyBBox.top = 0;
    return () => {};

  } else {
    // `elmTarget.getBoundingClientRect` may be able to get these,
    // but use elmAnchor because it is used for getting position of scrollbars.
    const elmTargetBody = props.elmTargetBody,
      position = props.window.getComputedStyle(elmTargetBody, '').position,
      savedProps = {};
    // Position the elmAnchor relative to the elmTargetBody.
    if (position !== 'relative' && position !== 'absolute' && position !== 'fixed') {
      setStyle(elmTargetBody, {position: 'relative'}, savedProps);
    }
    const bBox = props.elmAnchor.getBoundingClientRect();
    overlayBodyBBox.left = bBox.left + props.window.pageXOffset;
    overlayBodyBBox.top = bBox.top + props.window.pageYOffset;
    return () => { restoreStyle(elmTargetBody, savedProps); };
  }
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

function disableScroll(props) {
  const elmTarget = props.elmTarget, elmTargetBody = props.elmTargetBody,
    elmAnchor = props.elmAnchor;

  // Save before `overflow: 'hidden'` because it might change these.
  props.scrollLeft = scrollLeft(props);
  props.scrollTop = scrollTop(props);

  // Init props.overlayBodyBBox.
  const restoreForBBox = initOverlayBodyBBox(props),
    overlayBodyBBox = props.overlayBodyBBox;

  // Get size of each scrollbar.
  let barV = -overlayBodyBBox.width, barH = -overlayBodyBBox.height; // elmTarget.clientWidth/clientHeight
  // Set regardless of whether it's scrollable or not.
  setStyle(elmTarget, {overflow: 'hidden'}, props.savedPropsTarget);
  const clientWH = getTargetClientWH(props);
  barV += clientWH.width;
  barH += clientWH.height;

  if (barV || barH) {
    const targetBodyCmpStyle = props.window.getComputedStyle(elmTargetBody, ''),
      bBox = elmTargetBody.getBoundingClientRect(),
      targetSize = {width: bBox.width, height: bBox.height};
    let propV, propH;

    if (props.isDoc) {
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
      targetSize.width -= barV;
      targetSize.height -= barH;

    } else {
      // Blink bug, position is not updated.
      elmAnchor.style.left = '10px'; // Blink bug (reflow can't update)
      elmAnchor.offsetWidth; /* force reflow */ // eslint-disable-line no-unused-expressions
      elmAnchor.style.left = '';
      // To get the position, this is a value closest to a absolute position.
      // `clientLeft` is unreliable in some browsers (Trident, Edge and browsers in MacOS).
      const bBoxAfter = elmAnchor.getBoundingClientRect();
      if (barV) {
        // Since `getBoundingClientRect` might have fraction, expect that the size is more than 2px.
        propV = overlayBodyBBox.left - (bBoxAfter.left + props.window.pageXOffset) >= 2 ?
          'paddingLeft' : 'paddingRight';
      }
      if (barH) {
        propH = overlayBodyBBox.top - (bBoxAfter.top + props.window.pageYOffset) >= 2 ?
          'paddingTop' : 'paddingBottom';
      }
    }

    const addStyle = {};
    if (barV) { addStyle[propV] = `${parseFloat(targetBodyCmpStyle[propV]) + barV}px`; }
    if (barH) { addStyle[propH] = `${parseFloat(targetBodyCmpStyle[propH]) + barH}px`; }
    setStyle(elmTargetBody, addStyle, props.savedPropsTargetBody);
    resizeTarget(props, targetSize.width, targetSize.height);

    scrollLeft(props, props.scrollLeft);
    scrollTop(props, props.scrollTop);
  }
  restoreForBBox();
}
window.disableScroll = disableScroll; // [DEBUG/]

function position(props) {
  const elmOverlay = props.elmOverlay, elmOverlayBody = props.elmOverlayBody,
    overlayStyle = elmOverlay.style, overlayBodyStyle = elmOverlayBody.style,
    overlayCmpStyle = props.window.getComputedStyle(elmOverlay, ''),
    overlayBodyBBox = props.overlayBodyBBox,
    bBox = elmOverlayBody.getBoundingClientRect(),
    overlayBodyCurBBox = props.isDoc ? {left: bBox.left, top: bBox.top} :
      {left: bBox.left + props.window.pageXOffset,
        top: bBox.top + props.window.pageYOffset};
  overlayStyle.left = `${parseFloat(overlayCmpStyle.left) + (overlayBodyBBox.left - overlayBodyCurBBox.left)}px`;
  overlayStyle.top = `${parseFloat(overlayCmpStyle.top) + (overlayBodyBBox.top - overlayBodyCurBBox.top)}px`;
  overlayBodyStyle.width = `${overlayBodyBBox.width}px`;
  overlayBodyStyle.height = `${overlayBodyBBox.height}px`;
}
window.position = position; // [DEBUG/]

/**
 * @param {props} props - `props` of instance.
 * @returns {void}
 */
function show(props) {
  if (props.state === STATE_SHOWING || props.state === STATE_SHOWN) { return; }

  const targetCmpStyle = props.window.getComputedStyle(props.elmTarget, '');
  // `visible` of document might make scrollbars.
  props.canScroll = targetCmpStyle.overflow !== 'hidden' &&
    (targetCmpStyle.overflowX !== 'hidden' || targetCmpStyle.overflowY !== 'hidden');

  const elmOverlay = props.elmOverlay;
  if (props.state === STATE_HIDDEN) {
    if (props.canScroll) {
      disableScroll(props);
    } else {
    }
    elmOverlay.classList.remove(STYLE_CLASS_HIDE);
    position(props);
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
  props.elmOverlay.classList.remove(STYLE_CLASS_SHOW);
  props.state = STATE_HIDING;
}

function finishShowing(props) {
  props.state = STATE_SHOWN;
  // event
}

function finishHiding(props) {
  props.elmOverlay.classList.add(STYLE_CLASS_HIDE);
  restoreStyle(props.elmTarget, props.savedPropsTarget);
  restoreStyle(props.elmTargetBody, props.savedPropsTargetBody);
  props.savedPropsTarget = {};
  props.savedPropsTargetBody = {};
  props.state = STATE_HIDDEN;
  // event
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
    if (newOptions.face === '') {
      options.face = '';
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
    propNameTransitionDuration =
      propNameTransitionDuration || CSSPrefix.getProp('transitionDuration', elmOverlay);
    elmOverlay.style[propNameTransitionDuration] =
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
          let nodeName = target.nodeName.toLowerCase();
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
      savedPropsTarget: {},
      savedPropsTargetBody: {}
    };
    let elmDocument, elmOverlay;

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
    props.document = elmDocument = props.elmTarget.ownerDocument;
    props.window = elmDocument.defaultView;
    props.elmTargetBody = props.isDoc ? elmDocument.body : props.elmTarget;

    // Setup window
    if (!elmDocument.getElementById(STYLE_ELEMENT_ID)) {
      const head = elmDocument.getElementsByTagName('head')[0] || elmDocument.documentElement,
        sheet = head.insertBefore(elmDocument.createElement('style'), head.firstChild);
      sheet.type = 'text/css';
      sheet.id = STYLE_ELEMENT_ID;
      sheet.textContent = CSS_TEXT;
      if (IS_TRIDENT) { forceReflow(sheet); } // Trident bug
    }

    // overlay
    props.elmOverlay = elmOverlay = elmDocument.createElement('div');
    // Trident bug, multiple and space-separated tokens are ignored.
    // elmOverlay.classList.add(STYLE_CLASS, STYLE_CLASS_HIDE);
    elmOverlay.classList.add(STYLE_CLASS);
    elmOverlay.classList.add(STYLE_CLASS_HIDE);

    elmOverlay.addEventListener('transitionend', event => {
      if (event.target === elmOverlay && event.propertyName === 'opacity') {
        if (props.state === STATE_SHOWING) {
          finishShowing(props);
        } else if (props.state === STATE_HIDING) {
          finishHiding(props);
        }
      }
    }, false);
    // Avoid scroll on touch device
    elmOverlay.addEventListener('touchmove', event => { event.preventDefault(); }, true);

    // overlayBody
    (props.elmOverlayBody = elmOverlay.appendChild(elmDocument.createElement('div')))
      .className = STYLE_CLASS_BODY;

    props.elmTargetBody.appendChild(elmOverlay);
    // Anchor
    (props.elmAnchor = props.elmTargetBody.appendChild(elmDocument.createElement('div')))
      .classList.add(STYLE_CLASS_ANCHOR);
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





  static show(options) {
    return (new PlainOverlay(options)).show();
  }
}

export default PlainOverlay;
