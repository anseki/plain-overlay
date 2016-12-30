/* eslint-env node, es6 */

'use strict';

const webpack = require('webpack'),
  path = require('path'),
  buildMode = require('yargs').argv.mode === 'build',
  PKG = require('./package'),

  BABEL_TARGET_PACKAGES = [
    'cssprefix',
    'anim-event'
  ].map(packageName => path.resolve(__dirname, `node_modules/${packageName}`) + path.sep);

module.exports = {
  entry: './src/plain-overlay.js',
  output: {
    path: buildMode ? __dirname : path.join(__dirname, 'test'),
    filename: buildMode ? 'plain-overlay.min.js' : 'plain-overlay.js',
    library: 'PlainOverlay',
    libraryTarget: 'var'
  },
  resolve: {packageMains: ['jsnext:main', 'webpack', 'browser', 'web', 'browserify', ['jam', 'main'], 'main']},
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: absPath =>
          !BABEL_TARGET_PACKAGES.find(target => absPath.indexOf(target) === 0) &&
          absPath.split(path.sep).includes('node_modules'),
        loader: 'babel',
        query: {
          presets: ['es2015'],
          plugins: ['add-module-exports']
        }
      },
      {
        test: path.resolve(__dirname, 'src/face.html'),
        loaders: ['htmlclean', 'skeleton?config=svg']
      },
      {
        test: /\.css$/,
        loaders: ['skeleton?toCode=true', 'clean-css']
      }
    ]
  },

  svg: {
    procedure: function(content) {
      return (content + '').replace(/^[\s\S]*?@EXPORT@\s*(?:\*\/\s*|\s*\-\->)?([\s\S]*?)\s*(?:\/\*\s*|\/\/\s*|<\!\-\-\s*)?@\/EXPORT@[\s\S]*$/, '$1');
    }
  },

  devtool: buildMode ? null : 'source-map',
  plugins: buildMode ? [
    new webpack.optimize.UglifyJsPlugin(),
    new webpack.BannerPlugin(
      `/*! ${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage} */`,
      {raw: true})
  ] : null
};
