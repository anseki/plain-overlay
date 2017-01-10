# PlainOverlay

The simple library for customizable overlay which covers all or part of a web page.

Features:

- Cover all or part of a web page with an overlay.
- Block scrolling anything under the overlay by a mouse or keys.
- Block focusing anything under the overlay by a mouse or Tab key or access-keys.
- No dependencies.
- Single file.
- Modern browsers are supported. If you want to support legacy browsers such as IE 9-, see [jQuery-plainOverlay](http://anseki.github.io/jquery-plainoverlay/).

One of the following can be specified as the target that is covered:

- A current window
- An element that has a bounding-box
- Another window (i.e. child window such as `<iframe>`)
- An element in another window

## Usage

Load only a file `plain-overlay.min.js` into your web page.

```html
<script src="plain-overlay.min.js"></script>
```

This is most simple case:

```js
PlainOverlay.show();
```

Now, new overlay is shown and all of the page are covered with it.  
You can specify an element as the target that is covered.

```js
PlainOverlay.show(element);
```

Use an instance method to hide the overlay.

```js
var overlay = PlainOverlay.show();
// Now, new overlay is shown.
// Do something ...
overlay.hide();
// Now, the overlay is hidden.
```

For options and more details, refer to the following.

## Constructor

```js
overlay = new PlainOverlay([target, ][options])
```

The `target` argument is an element that is covered with the overlay, or `window` (or `document` or `<body>`) that means all of the web page.  
Any element that has a bounding-box is accepted. It can be an element in another window (i.e. `<iframe>`).  
`<iframe>` is regarded as `window` of that `<iframe>`.  
The default of `target` argument is current `window`.

The `options` argument is an Object that can have properties as [options](#options).

For example:

```js
```

See also: [`PlainOverlay.show`](#plainoverlay-show)

## Methods

### `setOptions`

```js
self = overlay.setOptions(options)
```

Set one or more options.  
The `options` argument is an Object that can have properties as [options](#options).

### `show`

```js
self = overlay.show([options])
```

Show the overlay.  
If `options` argument is specified, call [`setOptions`](#setoptions) method and show the overlay. It works as same as:

```js
overlay.setOptions(options).show();
```

See also: [`PlainOverlay.show`](#plainoverlay-show)

### `hide`

```js
self = overlay.hide([force])
```

Hide the overlay.  
If `true` is specified for `force` argument, hide it immediately without an effect. (See [`duration`](#options-duration) option.)

### `scrollLeft`, `scrollTop`

```js
currentLeft = overlay.scrollLeft([newLeft[, scrollTarget]])
```

```js
currentTop = overlay.scrollTop([newTop[, scrollTarget]])
```

Scrolling a window or element is blocked while it is covered with the overlay. `scrollLeft` and `scrollTop` methods allow it scroll, and return current value.  
The value is a number of pixels that a content is scrolled to the left or upward.  
The default of `scrollTarget` is a `target` of the overlay.

## Options

### <a name="options-face"></a>`face`

*Type:* Element, boolean or `undefined`  
*Default:* `undefined` (Builtin Face)

Something that is shown on the overlay. This is usually a message or image that means "Please wait...".  
If `false` is specified, nothing is shown on the overlay.

For example:

```js
```

For example:

```js
```

### <a name="options-duration"></a>`duration`

*Type:* number  
*Default:* `200`

A number determining how long (milliseconds) the effect animation for showing and hiding the overlay will run.

### <a name="options-style"></a>`style`

*Type:* Object or `undefined`  
*Default:* `undefined`

An Object that can have CSS properties that are added to the overlay.

For example:

```js
```

### <a name="options-onshow-onhide-onbeforeshow-onbeforehide"></a>`onShow`, `onHide`, `onBeforeShow`, `onBeforeHide`

*Type:* function or `undefined`  
*Default:* `undefined`

Event listeners:

- `onBeforeShow` is called when the overlay is about to be shown. If `false` is returned, the showing is canceled.
- `onShow` is called when a showing effect of the overlay is finished.
- `onBeforeHide` is called when the overlay is about to be hidden. If `false` is returned, the hiding is canceled.
- `onHide` is called when a hiding effect of the overlay is finished.

In the function, `this` refers to the current PlainOverlay instance.

For example:

```js
```

## Properties

### `state`

*Type:* number  
*Read-only*

A number to indicate current state of the overlay.  
It is one of the following static constant values:

- `PlainOverlay.STATE_HIDDEN` (`0`): The overlay is hidden fully.
- `PlainOverlay.STATE_SHOWING` (`1`): A showing effect of the overlay is running.
- `PlainOverlay.STATE_SHOWN` (`2`): The overlay is shown fully.
- `PlainOverlay.STATE_HIDING` (`3`): A hiding effect of the overlay is running.

For example:

```js
```

### `style`

*Type:* CSSStyleDeclaration  
*Read-only*

A CSSStyleDeclaration object of the overlay to get or set the CSS properties.

For example:

```js
```

### `face`

Get or set [`face`](#options-face) option.

For example:

```js
```

### `duration`

Get or set [`duration`](#options-duration) option.

### `onShow`, `onHide`, `onBeforeShow`, `onBeforeHide`

Get or set [`onShow`, `onHide`, `onBeforeShow`, `onBeforeHide`](#options-onshow-onhide-onbeforeshow-onbeforehide) options.

## `PlainOverlay.show`

```js
overlay = PlainOverlay.show([target, ][options])
```

This static method is a shorthand for:

```js
(new PlainOverlay(target, options)).show()
```
