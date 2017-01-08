/* eslint-env node, es6 */

/*
  Generate standalone SVG
*/

'use strict';

const
  fs = require('fs'),
  htmlclean = require('htmlclean'),
  CleanCSS = require('clean-css'),

  SOURCE_SVG_PATH = 'src/face.html',
  SOURCE_CSS_PATH = 'src/default.css',
  OUTPUT_SVG_PATH = 'src/face_01.svg';

function getExport(content, key) {
  const re = new RegExp(`^[\\s\\S]*?@EXPORT${key ? `\\[${key}\\]` : ''}@\\s*(?:\\*\\/\\s*|\\s*\\-\\->)?([\\s\\S]*?)\\s*(?:\\/\\*\\s*|\\/\\/\\s*|<\\!\\-\\-\\s*)?@\\/EXPORT@[\\s\\S]*$`);
  return (content + '').replace(re, '$1');
}

const sourceSvg = fs.readFileSync(SOURCE_SVG_PATH, {encoding: 'utf8'});

let defs = getExport(sourceSvg, 'defs').replace(/^[^]*?<svg[^]*?>([^]*?)<\/svg>[^]*$/, '$1'),
  main = getExport(sourceSvg, 'face_01').replace(/^[^]*?<svg[^]*?>([^]*?)<\/svg>[^]*$/, '$1'),
  css = getExport(fs.readFileSync(SOURCE_CSS_PATH, {encoding: 'utf8'}), 'face_01')
    .replace(/\n[^\n]+(\{[^\}]*?plainoverlay-builtin-face_01-spin[^\}]*)\}/, `use $1
  -webkit-transform-origin: center;
  transform-origin: center;
}`);

// min CSS
css = (new CleanCSS({keepSpecialComments: 0})).minify(css).styles;

let svg = `<?xml version="1.0" standalone="no"?>
<svg xmlns="http://www.w3.org/2000/svg"
    xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1"
    viewBox="0 0 32 32">

  <style><![CDATA[
${css}
]]></style>

  ${defs}

  ${main}

</svg>`;

// min SVG
svg = htmlclean(svg);

fs.writeFileSync(OUTPUT_SVG_PATH, svg);
console.log(`OUTPUT: ${OUTPUT_SVG_PATH}`);
