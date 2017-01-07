/* eslint-env node, es6 */

'use strict';

const webpack = require('webpack'),
  path = require('path'),
  buildMode = require('yargs').argv.mode === 'build',
  PKG = require('./package'),

  BABEL_TARGET_PACKAGES = [
    'cssprefix',
    'anim-event',
    'anim-sequence'
  ].map(packageName => path.resolve(__dirname, `node_modules/${packageName}`) + path.sep),

  BABEL_PARAMS = JSON.stringify({
    presets: ['es2015'],
    plugins: ['add-module-exports']
  });

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
        loaders: buildMode ? [`babel?${BABEL_PARAMS}`, 'skeleton?config=js'] : [`babel?${BABEL_PARAMS}`]
      },
      {
        test: path.resolve(__dirname, 'src/face.html'),
        loaders: ['htmlclean', 'skeleton?config=face']
      },
      {
        test: /\.css$/,
        loaders: ['skeleton?toCode=true', 'clean-css']
      }
    ]
  },

  js: {
    procedure: function(content) {
      return (content + '')
        .replace(/[^\n]*\[DEBUG\/\][^\n]*\n?/g, '')
        .replace(/\/\*\s*\[DEBUG\]\s*\*\/[\s\S]*?\/\*\s*\[\/DEBUG\]\s*\*\//g, '')
        .replace(/[^\n]*\[DEBUG\][\s\S]*?\[\/DEBUG\][^\n]*\n?/g, '');
    }
  },

  face: {
    procedure: function(content) {
      const params = (this.resourceQuery || '').replace(/^\?/, '').split('&')
        .reduce((params, param) => {
          const matches = /^(.+?)=(.*)$/.exec(param);
          if (matches) { params[matches[1]] = matches[2]; }
          return params;
        }, {}),
        re = new RegExp(`^[\\s\\S]*?@EXPORT${params.part ? `\\[${params.part}\\]` : ''}@\\s*(?:\\*\\/\\s*|\\s*\\-\\->)?([\\s\\S]*?)\\s*(?:\\/\\*\\s*|\\/\\/\\s*|<\\!\\-\\-\\s*)?@\\/EXPORT@[\\s\\S]*$`);
      return (content + '').replace(re, '$1');
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
