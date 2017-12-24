/* eslint-env node, es6 */

'use strict';

const
  BASE_NAME = 'plain-overlay',
  OBJECT_NAME = 'PlainOverlay',

  webpack = require('webpack'),
  path = require('path'),
  PKG = require('./package'),

  // Get paths for compass and copy to ENV for `webpack.config.rules.js`
  RULES = ((SASS_PATHS) => { process.env.SASS_PATHS = SASS_PATHS.join('\n'); })([
    (() => {
      const lib = require.resolve('compass-mixins');
      if (!/[/\\]compass-mixins[/\\]/.test(lib)) { throw new Error('Not found `compass-mixins`'); }
      return path.dirname(lib);
    })(),
    path.resolve(__dirname, '../../_common')
  ]) ||
    require('./webpack.config.rules.js').concat([ // Join `webpack.config.rules.js` files
      'cssprefix',
      'anim-event',
      'm-class-list',
      'timed-transition'
    ].reduce((rules, packageName) =>
      rules.concat(require(`./node_modules/${packageName}/webpack.config.rules.js`)), [])),

  BUILD = process.env.NODE_ENV === 'production',
  LIMIT = process.env.EDITION === 'limit',
  SYNC = process.env.SYNC === 'yes', // Enable "sync-mode support"

  ENTRY_PATH = path.resolve(__dirname, 'src', `${BASE_NAME}.js`),
  BUILD_PATH = BUILD ? __dirname : path.resolve(__dirname, 'test'),
  BUILD_FILE = `${BASE_NAME}${LIMIT ? '-limit' : ''}${SYNC ? '-sync' : ''}${BUILD ? '.min' : ''}.js`;

module.exports = {
  entry: ENTRY_PATH,
  output: {
    path: BUILD_PATH,
    filename: BUILD_FILE,
    library: OBJECT_NAME,
    libraryTarget: 'var'
  },
  resolve: {mainFields: ['jsnext:main', 'browser', 'module', 'main']},
  module: {rules: RULES},
  devtool: BUILD ? false : 'source-map',
  plugins: BUILD ? [
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: true}}),
    new webpack.BannerPlugin(
      `${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage}`)
  ] : []
};
