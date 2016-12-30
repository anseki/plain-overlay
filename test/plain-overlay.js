var PlainOverlay =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	
	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /*
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * PlainOverlay
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * https://github.com/anseki/plain-overlay
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      *
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Copyright (c) 2016 anseki
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      * Licensed under the MIT license.
	                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      */
	
	var _cssprefix = __webpack_require__(1);
	
	var _cssprefix2 = _interopRequireDefault(_cssprefix);
	
	var _default = __webpack_require__(2);
	
	var _default2 = _interopRequireDefault(_default);
	
	var _face = __webpack_require__(3);
	
	var _face2 = _interopRequireDefault(_face);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }
	
	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }
	
	var APP_ID = 'plainoverlay',
	    // COPY: default.scss
	STYLE_ELEMENT_ID = APP_ID + '-style',
	    STYLE_CLASS = APP_ID,
	    STYLE_CLASS_DOC = APP_ID + '-doc',
	    STYLE_CLASS_SHOW = APP_ID + '-show',
	    STYLE_CLASS_HIDE = APP_ID + '-hide',
	    STYLE_CLASS_BODY = APP_ID + '-body',
	    STATE_HIDDEN = 0,
	    STATE_SHOWING = 1,
	    STATE_SHOWN = 2,
	    STATE_HIDING = 3,
	    DURATION = 2500,
	    // COPY: default.scss
	TOLERANCE = 0.5,
	    IS_TRIDENT = !!document.uniqueID,
	    IS_BLINK = !!(window.chrome && window.chrome.webstore),
	    IS_GECKO = 'MozAppearance' in document.documentElement.style,
	    IS_EDGE = '-ms-scroll-limit' in document.documentElement.style && '-ms-ime-align' in document.documentElement.style && !window.navigator.msPointerEnabled,
	    IS_WEBKIT = !window.chrome && 'WebkitAppearance' in document.documentElement.style,
	    isObject = function () {
	  var toString = {}.toString,
	      fnToString = {}.hasOwnProperty.toString,
	      objFnString = fnToString.call(Object);
	  return function (obj) {
	    var proto = void 0,
	        constr = void 0;
	    return obj && toString.call(obj) === '[object Object]' && (!(proto = Object.getPrototypeOf(obj)) || (constr = proto.hasOwnProperty('constructor') && proto.constructor) && typeof constr === 'function' && fnToString.call(constr) === objFnString);
	  };
	}(),
	    isFinite = Number.isFinite || function (value) {
	  return typeof value === 'number' && window.isFinite(value);
	},
	
	
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
	
	var insId = 0,
	    propNameTransitionDuration = void 0;
	
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
	  setTimeout(function () {
	    var parent = target.parentNode,
	        next = target.nextSibling;
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
	  var style = element.style;
	  (propNames || Object.keys(styleProps)).forEach(function (prop) {
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
	 * @property {(number|null)} left - ScreenCTM
	 * @property {(number|null)} top - ScreenCTM
	 * @property {(number|null)} right - ScreenCTM
	 * @property {(number|null)} bottom - ScreenCTM
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
	      bBox = { left: rect.left, top: rect.top,
	    right: rect.right, bottom: rect.bottom, width: rect.width, height: rect.height };
	  if (window) {
	    bBox.left += window.pageXOffset;
	    bBox.right += window.pageXOffset;
	    bBox.top += window.pageYOffset;
	    bBox.bottom += window.pageYOffset;
	  }
	  return bBox;
	}
	window.getBBox = getBBox; // [DEBUG/]
	
	function scrollLeft(props, value) {
	  if (props.isDoc) {
	    var target = props.window;
	    if (value != null) {
	      target.scrollTo(value, target.pageYOffset);
	    }
	    return target.pageXOffset;
	  } else {
	    var _target = props.elmTarget;
	    if (value != null) {
	      _target.scrollLeft = value;
	    }
	    return _target.scrollLeft;
	  }
	}
	window.scrollLeft = scrollLeft; // [DEBUG/]
	
	function scrollTop(props, value) {
	  if (props.isDoc) {
	    var target = props.window;
	    if (value != null) {
	      target.scrollTo(target.pageXOffset, value);
	    }
	    return target.pageYOffset;
	  } else {
	    var _target2 = props.elmTarget;
	    if (value != null) {
	      _target2.scrollTop = value;
	    }
	    return _target2.scrollTop;
	  }
	}
	window.scrollTop = scrollTop; // [DEBUG/]
	
	function resizeTarget(props, width, height) {
	  var elmTargetBody = props.elmTargetBody;
	
	  var rect = elmTargetBody.getBoundingClientRect();
	  if (Math.abs(rect.width - width) < TOLERANCE && Math.abs(rect.height - height) < TOLERANCE) {
	    return;
	  }
	
	  var targetBodyCmpStyle = props.window.getComputedStyle(elmTargetBody, ''),
	      boxSizing = targetBodyCmpStyle.boxSizing,
	      includeProps = boxSizing === 'border-box' ? [] : boxSizing === 'padding-box' ? ['border'] : ['border', 'padding'],
	      // content-box
	
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
	      values = ['width', 'height'].reduce(function (values, dir) {
	    includeProps.forEach(function (part) {
	      PROP_NAMES[part][dir].forEach(function (propName) {
	        values[dir] -= parseFloat(targetBodyCmpStyle[propName]);
	      });
	    });
	    return values;
	  }, { width: width, height: height });
	
	  // Since the `width` and `height` might change each other, fix both.
	  setStyle(elmTargetBody, {
	    // The value might be negative number when size is too small.
	    width: values.width > 0 ? values.width + 'px' : 0,
	    height: values.height > 0 ? values.height + 'px' : 0
	  }, props.savedPropsTargetBody);
	
	  // In some browsers, getComputedStyle might return computed values that is not px instead of used values.
	  var fixStyle = {};
	  rect = elmTargetBody.getBoundingClientRect();
	  if (Math.abs(rect.width - width) >= TOLERANCE) {
	    // [DEBUG]
	    console.warn('[resizeTarget] Incorrect width: ' + rect.width + (' (expected: ' + width + ' passed: ' + values.width + ')'));
	    // [/DEBUG]
	    fixStyle.width = values.width - (rect.width - width) + 'px';
	  }
	  if (rect.height !== height) {
	    // [DEBUG]
	    console.warn('[resizeTarget] Incorrect height: ' + rect.height + (' (expected: ' + height + ' passed: ' + values.height + ')'));
	    // [/DEBUG]
	    fixStyle.height = values.height - (rect.height - height) + 'px';
	  }
	  setStyle(elmTargetBody, fixStyle, props.savedPropsTargetBody);
	}
	window.resizeTarget = resizeTarget; // [DEBUG/]
	
	// Trident and Edge bug, width and height are interchanged.
	function getDocClientWH(props) {
	  var elmTarget = props.elmTarget,
	      width = elmTarget.clientWidth,
	      height = elmTarget.clientHeight;
	  if (IS_TRIDENT || IS_EDGE) {
	    var targetBodyCmpStyle = props.window.getComputedStyle(props.elmTargetBody, ''),
	        wMode = targetBodyCmpStyle.writingMode || targetBodyCmpStyle['writing-mode'],
	        // Trident bug
	    direction = targetBodyCmpStyle.direction;
	    return wMode === 'tb-rl' || wMode === 'bt-rl' || wMode === 'tb-lr' || wMode === 'bt-lr' || IS_EDGE && (direction === 'ltr' && (wMode === 'vertical-rl' || wMode === 'vertical-lr') || direction === 'rtl' && (wMode === 'vertical-rl' || wMode === 'vertical-lr')) ? { width: height, height: width } : // interchange
	    { width: width, height: height };
	  } else {
	    return { width: width, height: height };
	  }
	}
	window.getDocClientWH = getDocClientWH; // [DEBUG/]
	
	function barLeft(wMode, direction) {
	  var svgSpec = wMode === 'rl-tb' || wMode === 'tb-rl' || wMode === 'bt-rl' || wMode === 'rl-bt';
	  return IS_TRIDENT && svgSpec || IS_EDGE && (svgSpec || direction === 'rtl' && (wMode === 'horizontal-tb' || wMode === 'vertical-rl') || direction === 'ltr' && wMode === 'vertical-rl');
	}
	window.barLeft = barLeft; // [DEBUG/]
	
	function barTop(wMode, direction) {
	  var svgSpec = wMode === 'bt-rl' || wMode === 'bt-lr' || wMode === 'lr-bt' || wMode === 'rl-bt';
	  return IS_TRIDENT && svgSpec || IS_EDGE && (svgSpec || direction === 'rtl' && (wMode === 'vertical-lr' || wMode === 'vertical-rl'));
	}
	window.barTop = barTop; // [DEBUG/]
	
	function disableDocBars(props) {
	  var elmTargetBody = props.elmTargetBody,
	      targetBodyRect = elmTargetBody.getBoundingClientRect();
	  // Save before `overflow: 'hidden'` because it might change these.
	  props.scrollLeft = scrollLeft(props);
	  props.scrollTop = scrollTop(props);
	
	  // Get size of each scrollbar.
	  var clientWH = getDocClientWH(props),
	      barV = -clientWH.width,
	      barH = -clientWH.height; // elmTarget.clientWidth/clientHeight
	  setStyle(props.elmTarget, { overflow: 'hidden' }, props.savedPropsTarget);
	  clientWH = getDocClientWH(props);
	  barV += clientWH.width;
	  barH += clientWH.height;
	
	  if (barV || barH) {
	    var targetBodyCmpStyle = props.window.getComputedStyle(elmTargetBody, '');
	    var propV = void 0,
	        propH = void 0;
	    // There is no way to get absolute position of document.
	    // We need distance between the document and its window, or a method like `element.screenX`
	    // that gets absolute position of an element.
	    // For the moment, Trident and Edge make a scrollbar at the left/top side when RTL document
	    // or CJK vertical document is rendered.
	    if (IS_TRIDENT || IS_EDGE) {
	      var wMode = targetBodyCmpStyle.writingMode || targetBodyCmpStyle['writing-mode'],
	          // Trident bug
	      direction = targetBodyCmpStyle.direction;
	      if (barV) {
	        propV = barLeft(wMode, direction) ? 'marginLeft' : 'marginRight';
	      }
	      if (barH) {
	        propH = barTop(wMode, direction) ? 'marginTop' : 'marginBottom';
	      }
	    } else {
	      if (barV) {
	        propV = 'marginRight';
	      }
	      if (barH) {
	        propH = 'marginBottom';
	      }
	    }
	
	    var addStyle = {};
	    if (barV) {
	      addStyle[propV] = parseFloat(targetBodyCmpStyle[propV]) + barV + 'px';
	    }
	    if (barH) {
	      addStyle[propH] = parseFloat(targetBodyCmpStyle[propH]) + barH + 'px';
	    }
	    setStyle(elmTargetBody, addStyle, props.savedPropsTargetBody);
	    resizeTarget(props, targetBodyRect.width, targetBodyRect.height);
	
	    scrollLeft(props, props.scrollLeft);
	    scrollTop(props, props.scrollTop);
	    return true;
	  } else {
	    restoreStyle(props.elmTarget, props.savedPropsTarget, ['overflow']);
	    return false;
	  }
	}
	window.disableDocBars = disableDocBars; // [DEBUG/]
	
	function position(props) {
	  var elmTargetBody = props.elmTargetBody,
	      targetBodyCmpStyle = props.window.getComputedStyle(elmTargetBody, ''),
	      targetBodyBBox = getBBox(elmTargetBody, props.window),
	      elmOverlay = props.elmOverlay,
	      overlayCmpStyle = props.window.getComputedStyle(elmOverlay, ''),
	      overlayBBox = getBBox(elmOverlay, props.window),
	      borders = ['Top', 'Right', 'Bottom', 'Left'].reduce(function (borders, prop) {
	    borders[prop.toLowerCase()] = parseFloat(targetBodyCmpStyle['border' + prop + 'Width']);
	    return borders;
	  }, {}),
	
	
	  // Get distance between document and origin of `elmOverlay`.
	  offset = { left: overlayBBox.left - parseFloat(overlayCmpStyle.left),
	    top: overlayBBox.top - parseFloat(overlayCmpStyle.top) },
	      style = {
	    left: targetBodyBBox.left - offset.left + borders.left + 'px',
	    top: targetBodyBBox.top - offset.top + borders.top + 'px',
	    width: targetBodyBBox.width - borders.left - borders.right + 'px',
	    height: targetBodyBBox.height - borders.top - borders.bottom + 'px'
	  },
	      reValue = /^([\d\.]+)(px|%)$/;
	
	  // border-radius
	  [{ prop: 'TopLeft', hBorder: 'left', vBorder: 'top' }, { prop: 'TopRight', hBorder: 'right', vBorder: 'top' }, { prop: 'BottomRight', hBorder: 'right', vBorder: 'bottom' }, { prop: 'BottomLeft', hBorder: 'left', vBorder: 'bottom' }].forEach(function (corner) {
	    var prop = _cssprefix2.default.getProp('border' + corner.prop + 'Radius', elmTargetBody),
	        values = targetBodyCmpStyle[prop].split(' ');
	    var h = values[0],
	        v = values[1] || values[0],
	        matches = reValue.exec(h);
	    h = !matches ? 0 : matches[2] === 'px' ? +matches[1] : matches[1] * targetBodyBBox.width / 100;
	    matches = reValue.exec(v);
	    v = !matches ? 0 : matches[2] === 'px' ? +matches[1] : matches[1] * targetBodyBBox.height / 100;
	
	    h -= borders[corner.hBorder];
	    v -= borders[corner.vBorder];
	    if (h > 0 && v > 0) {
	      style[prop] = h + 'px ' + v + 'px';
	    }
	  });
	
	  setStyle(elmOverlay, style);
	}
	window.position = position; // [DEBUG/]
	
	function disableScroll(props) {}
	
	function disableKey(elements) {
	  var savedAttrs = [];
	  elements.forEach(function (element) {
	    var savedAttr = {},
	        tabIndex = element.tabIndex;
	    if (tabIndex !== -1) {
	      savedAttr.element = element;
	      savedAttr.tabIndex = element.hasAttribute('tabindex') ? tabIndex : false;
	      element.tabIndex = -1;
	    }
	    var accessKey = element.accessKey;
	    if (accessKey) {
	      savedAttr.element = element;
	      savedAttr.accessKey = accessKey;
	      element.accessKey = '';
	    }
	    if (savedAttr.element) {
	      savedAttrs.push(savedAttr);
	    }
	  });
	  return savedAttrs;
	}
	window.disableKey = disableKey; // [DEBUG/]
	
	function restoreKey(savedAttrs) {
	  savedAttrs.forEach(function (savedAttr) {
	    if (savedAttr.tabIndex === false) {
	      savedAttr.element.removeAttribute('tabindex');
	    } else if (savedAttr.tabIndex != null) {
	      savedAttr.element.tabIndex = savedAttr.tabIndex;
	    }
	    if (savedAttr.accessKey) {
	      savedAttr.element.accessKey = savedAttr.accessKey;
	    }
	  });
	}
	window.restoreKey = restoreKey; // [DEBUG/]
	
	/**
	 * @param {props} props - `props` of instance.
	 * @returns {void}
	 */
	function _show(props) {
	  if (props.state === STATE_SHOWING || props.state === STATE_SHOWN) {
	    return;
	  }
	
	  var targetCmpStyle = props.window.getComputedStyle(props.elmTarget, '');
	  props.canScroll = targetCmpStyle.overflow === 'scroll' || targetCmpStyle.overflow === 'auto' || targetCmpStyle.overflowX === 'scroll' || targetCmpStyle.overflowX === 'auto' || targetCmpStyle.overflowY === 'scroll' || targetCmpStyle.overflowY === 'auto' ||
	  // document with `visible` might make scrollbars.
	  props.isDoc && (targetCmpStyle.overflow === 'visible' || targetCmpStyle.overflowX === 'visible' || targetCmpStyle.overflowY === 'visible');
	
	  var elmOverlay = props.elmOverlay;
	  if (props.state === STATE_HIDDEN) {
	    if (props.isDoc) {
	      if (props.canScroll && disableDocBars(props)) {
	        disableScroll(props);
	      }
	      elmOverlay.classList.remove(STYLE_CLASS_HIDE);
	    } else {
	      if (props.window.getComputedStyle(props.elmTargetBody, '').display === 'inline') {
	        setStyle(props.elmTargetBody, { display: 'inline-block' }, props.savedPropsTargetBody);
	      }
	      if (props.canScroll) {
	        disableScroll(props);
	      }
	      elmOverlay.classList.remove(STYLE_CLASS_HIDE);
	      position(props);
	    }
	
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
	function _hide(props, force) {
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
	function _setOptions(props, newOptions) {
	  var options = props.options,
	      elmTarget = props.elmTarget,
	      elmTargetBody = props.elmTargetBody,
	      elmOverlay = props.elmOverlay,
	      elmOverlayBody = props.elmOverlayBody;
	
	  // face
	  if ((newOptions.face == null ? void 0 : newOptions.face) !== options.face) {
	    // Clear
	    while (elmOverlayBody.firstChild) {
	      elmOverlayBody.removeChild(elmOverlayBody.firstChild);
	    }
	    if (newOptions.face === false) {
	      options.face = false;
	    } else if (newOptions.face && newOptions.face.nodeType === Node.ELEMENT_NODE) {
	      options.face = newOptions.face;
	      elmOverlayBody.appendChild(newOptions.face);
	    } else {
	      options.face = void 0;
	      elmOverlayBody.innerHTML = _face2.default;
	    }
	  }
	
	  // duration
	  if (isFinite(newOptions.duration) && newOptions.duration !== options.duration) {
	    options.duration = newOptions.duration;
	    propNameTransitionDuration = propNameTransitionDuration || _cssprefix2.default.getProp('transitionDuration', elmOverlay);
	    elmOverlay.style[propNameTransitionDuration] = newOptions.duration === DURATION ? '' : newOptions.duration + 'ms';
	  }
	
	  if (isObject(newOptions.style)) {
	    setStyle(props.elmOverlay, newOptions.style);
	  }
	}
	
	var PlainOverlay = function () {
	  /**
	   * Create a `PlainOverlay` instance.
	   * @param {Element} [target] - Target element.
	   * @param {Object} [options] - Options.
	   */
	  function PlainOverlay(target, options) {
	    _classCallCheck(this, PlainOverlay);
	
	    /**
	     * @param {Object} [target] - Element or something that is checked.
	     * @returns {(Element|null)} - Valid element or null.
	     */
	    function getTarget(target) {
	      var validElement = void 0;
	      if (!target) {
	        validElement = document.documentElement; // documentElement of current document
	      } else if (target.nodeType) {
	        if (target.nodeType === Node.DOCUMENT_NODE) {
	          validElement = target.documentElement; // documentElement of target document
	        } else if (target.nodeType === Node.ELEMENT_NODE) {
	          var nodeName = target.nodeName.toLowerCase();
	          validElement = nodeName === 'body' ? target.ownerDocument.documentElement : // documentElement of target body
	          nodeName === 'iframe' || nodeName === 'frame' ? target.contentDocument.documentElement : // documentElement of target frame
	          nodeName === 'script' || nodeName === 'style' || nodeName === 'svg' ? null : // deny
	          target;
	        }
	        if (!validElement) {
	          throw new Error('This element is not accepted.');
	        }
	      } else if (target === target.window) {
	        validElement = target.document.documentElement; // documentElement of target window
	      }
	      return validElement;
	    }
	
	    var props = {
	      options: { // Initial options (not default)
	        face: '',
	        duration: DURATION
	      },
	      state: STATE_HIDDEN,
	      savedPropsTarget: {},
	      savedPropsTargetBody: {}
	    };
	
	    Object.defineProperty(this, '_id', { value: ++insId });
	    props._id = this._id;
	    insProps[this._id] = props;
	
	    if (arguments.length === 1) {
	      if (!(props.elmTarget = getTarget(target))) {
	        if (!isObject(target)) {
	          throw new Error('Invalid argument.');
	        }
	        props.elmTarget = document.documentElement; // documentElement of current document
	        options = target;
	      }
	    } else {
	      if (!(props.elmTarget = getTarget(target))) {
	        throw new Error('This target is not accepted.');
	      }
	      if (options && !isObject(options)) {
	        throw new Error('Invalid options.');
	      }
	    }
	    props.isDoc = props.elmTarget.nodeName.toLowerCase() === 'html';
	    var elmDocument = props.document = props.elmTarget.ownerDocument;
	    props.window = elmDocument.defaultView;
	    props.elmTargetBody = props.isDoc ? elmDocument.body : props.elmTarget;
	
	    // Setup window
	    if (!elmDocument.getElementById(STYLE_ELEMENT_ID)) {
	      var head = elmDocument.getElementsByTagName('head')[0] || elmDocument.documentElement,
	          sheet = head.insertBefore(elmDocument.createElement('style'), head.firstChild);
	      sheet.type = 'text/css';
	      sheet.id = STYLE_ELEMENT_ID;
	      sheet.textContent = _default2.default;
	      if (IS_TRIDENT) {
	        forceReflow(sheet);
	      } // Trident bug
	    }
	
	    // elmOverlay
	    var elmOverlay = props.elmOverlay = elmDocument.createElement('div');
	    // Trident bug, multiple and space-separated tokens are ignored.
	    // elmOverlay.classList.add(STYLE_CLASS, STYLE_CLASS_HIDE);
	    elmOverlay.classList.add(STYLE_CLASS);
	    elmOverlay.classList.add(STYLE_CLASS_HIDE);
	    if (props.isDoc) {
	      elmOverlay.classList.add(STYLE_CLASS_DOC);
	    }
	
	    elmOverlay.addEventListener('transitionend', function (event) {
	      if (event.target === elmOverlay && event.propertyName === 'opacity') {
	        if (props.state === STATE_SHOWING) {
	          finishShowing(props);
	        } else if (props.state === STATE_HIDING) {
	          finishHiding(props);
	        }
	      }
	    }, false);
	    // Avoid scroll on touch device
	    elmOverlay.addEventListener('touchmove', function (event) {
	      event.preventDefault();
	    }, true);
	
	    // elmOverlayBody
	    (props.elmOverlayBody = elmOverlay.appendChild(elmDocument.createElement('div'))).className = STYLE_CLASS_BODY;
	
	    elmDocument.body.appendChild(elmOverlay);
	    _setOptions(props, options || {});
	  }
	
	  /**
	   * @param {Object} options - New options.
	   * @returns {PlainOverlay} Current instance itself.
	   */
	
	
	  _createClass(PlainOverlay, [{
	    key: 'setOptions',
	    value: function setOptions(options) {
	      if (isObject(options)) {
	        _setOptions(insProps[this._id], options);
	      }
	      return this;
	    }
	
	    /**
	     * Show the overlay.
	     * @param {Object} [options] - New options.
	     * @returns {PlainOverlay} Current instance itself.
	     */
	
	  }, {
	    key: 'show',
	    value: function show(options) {
	      this.setOptions(options);
	      _show(insProps[this._id]);
	      return this;
	    }
	
	    /**
	     * Hide the overlay.
	     * @param {boolean} [force] - Hide it immediately without effect.
	     * @returns {PlainOverlay} Current instance itself.
	     */
	
	  }, {
	    key: 'hide',
	    value: function hide(force) {
	      _hide(insProps[this._id], force);
	      return this;
	    }
	  }, {
	    key: 'face',
	    get: function get() {
	      return insProps[this._id].options.face;
	    },
	    set: function set(value) {
	      _setOptions(insProps[this._id], { face: value });
	    }
	  }, {
	    key: 'duration',
	    get: function get() {
	      return insProps[this._id].options.duration;
	    },
	    set: function set(value) {
	      _setOptions(insProps[this._id], { duration: value });
	    }
	  }, {
	    key: 'state',
	    get: function get() {
	      return insProps[this._id].state;
	    }
	  }], [{
	    key: 'show',
	    value: function show(options) {
	      return new PlainOverlay(options).show();
	    }
	  }]);
	
	  return PlainOverlay;
	}();
	
	exports.default = PlainOverlay;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
	  value: true
	});
	/*
	 * CSSPrefix
	 * https://github.com/anseki/css-prefix
	 *
	 * Copyright (c) 2016 anseki
	 * Licensed under the MIT license.
	 */
	
	// *** Currently, this code except `export` is not ES2015. ***
	
	var CSSPrefix,
	    PREFIXES = ['webkit', 'ms', 'moz', 'o'],
	    PREFIXES_PROP = [],
	    PREFIXES_VALUE = [],
	    rePrefixesProp,
	    rePrefixesValue,
	    props = {},
	    values = {}; // cache
	
	function ucf(text) {
	  return text.substr(0, 1).toUpperCase() + text.substr(1);
	}
	
	PREFIXES.forEach(function (prefix) {
	  PREFIXES_PROP.push(prefix);
	  PREFIXES_PROP.push(ucf(prefix));
	  PREFIXES_VALUE.push('-' + prefix + '-');
	});
	
	rePrefixesProp = new RegExp('^(?:' + PREFIXES.join('|') + ')(.)', 'i');
	function normalizeProp(prop) {
	  var reUc = /[A-Z]/;
	  // 'ms' and 'Ms' are found by rePrefixesProp. 'i' option
	  return (prop = prop.replace(/-([\da-z])/gi, function (str, p1) {
	    // camelCase
	    return p1.toUpperCase();
	  }).replace(rePrefixesProp, function (str, p1) {
	    return reUc.test(p1) ? p1.toLowerCase() : str;
	  })).toLowerCase() === 'float' ? 'cssFloat' : prop; // for old CSSOM
	}
	
	rePrefixesValue = new RegExp('^(?:' + PREFIXES_VALUE.join('|') + ')', 'i');
	function normalizeValue(value) {
	  return value.replace(rePrefixesValue, '');
	}
	
	function getProp(prop, elm) {
	  var style, ucfProp;
	  prop = normalizeProp(prop);
	  if (props[prop] == null) {
	    style = elm.style;
	
	    if (style[prop] != null) {
	      // original
	      props[prop] = prop;
	    } else {
	      // try with prefixes
	      ucfProp = ucf(prop);
	      if (!PREFIXES_PROP.some(function (prefix) {
	        var prefixed = prefix + ucfProp;
	        if (style[prefixed] != null) {
	          props[prop] = prefixed;
	          return true;
	        }
	        return false;
	      })) {
	        props[prop] = '';
	      }
	    }
	  }
	  return props[prop];
	}
	
	function setValue(elm, prop, value) {
	  var res,
	      style = elm.style,
	      valueArray = Array.isArray(value) ? value : [value];
	
	  function trySet(prop, value) {
	    style[prop] = value;
	    return style[prop] === value;
	  }
	
	  if (!(prop = getProp(prop, elm))) {
	    return '';
	  } // Invalid Property
	  values[prop] = values[prop] || {};
	  if (!valueArray.some(function (value) {
	    value = normalizeValue(value);
	    if (values[prop][value] == null) {
	
	      if (trySet(prop, value)) {
	        // original
	        res = values[prop][value] = value;
	        return true;
	      } else if (PREFIXES_VALUE.some(function (prefix) {
	        // try with prefixes
	        var prefixed = prefix + value;
	        if (trySet(prop, prefixed)) {
	          res = values[prop][value] = prefixed;
	          return true;
	        }
	        return false;
	      })) {
	        return true;
	      } else {
	        values[prop][value] = '';
	        return false; // continue to next value
	      }
	    } else if (values[prop][value]) {
	      style[prop] = res = values[prop][value];
	      return true;
	    }
	    return false;
	  })) {
	    res = '';
	  }
	  return res;
	}
	
	CSSPrefix = {
	  getProp: getProp,
	  setValue: setValue
	};
	
	exports.default = CSSPrefix;
	module.exports = exports['default'];

/***/ },
/* 2 */
/***/ function(module, exports) {

	module.exports = ".plainoverlay{-webkit-tap-highlight-color:transparent;transform:translateZ(0);box-shadow:0 0 1px transparent;-moz-transition-property:opacity;-o-transition-property:opacity;-webkit-transition-property:opacity;transition-property:opacity;-moz-transition-duration:2.5s;-o-transition-duration:2.5s;-webkit-transition-duration:2.5s;transition-duration:2.5s;-moz-transition-timing-function:linear;-o-transition-timing-function:linear;-webkit-transition-timing-function:linear;transition-timing-function:linear;opacity:0;position:absolute;left:0;top:0;overflow:hidden;background-color:rgba(136,136,136,.6);cursor:wait;z-index:9000}.plainoverlay.plainoverlay-doc{position:fixed;left:-200px;top:-200px;overflow:visible;padding:200px}.plainoverlay-body{width:100%;height:100%}.plainoverlay.plainoverlay-doc .plainoverlay-body{width:100vw;height:100vh}.plainoverlay-show{opacity:1}.plainoverlay-hide{display:none}.plainoverlay-builtin-face{width:100%;height:100%}.plainoverlay-builtin-face-rect{fill:none;stroke:rgba(80,255,86,.6);stroke-width:2px}";

/***/ },
/* 3 */
/***/ function(module, exports) {

	module.exports = "<svg version=\"1.1\" viewBox=\"0 0 24 24\" class=\"plainoverlay-builtin-face\"><rect x=\"1\" y=\"1\" width=\"22\" height=\"22\" class=\"plainoverlay-builtin-face-rect\"/></svg>";

/***/ }
/******/ ]);
//# sourceMappingURL=plain-overlay.js.map