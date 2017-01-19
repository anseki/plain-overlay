/* eslint-env node, es6 */

'use strict';

const webpack = require('webpack'),
  path = require('path'),
  BUILD = process.env.NODE_ENV === 'production',
  PKG = require('./package'),

  BABEL_TARGET_PACKAGES = [
    'cssprefix',
    'anim-event'
  ].map(packageName => path.resolve(__dirname, `node_modules/${packageName}`) + path.sep),

  BABEL_PARAMS = {
    presets: ['es2015'],
    plugins: ['add-module-exports']
  };

module.exports = {
  entry: './src/plain-overlay.js',
  output: {
    path: BUILD ? __dirname : path.join(__dirname, 'test'),
    filename: BUILD ? 'plain-overlay.min.js' : 'plain-overlay.js',
    library: 'PlainOverlay',
    libraryTarget: 'var'
  },
  resolve: {mainFields: ['jsnext:main', 'browser', 'module', 'main']},
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: absPath => !BABEL_TARGET_PACKAGES.find(target => absPath.indexOf(target) === 0) &&
          absPath.split(path.sep).includes('node_modules'),
        use: BUILD ? [
          {
            loader: 'babel-loader',
            options: BABEL_PARAMS
          },
          {
            loader: 'skeleton-loader',
            options: {
              procedure: content => (content + '')
                .replace(/[^\n]*\[DEBUG\/\][^\n]*\n?/g, '')
                .replace(/\/\*\s*\[DEBUG\]\s*\*\/[\s\S]*?\/\*\s*\[\/DEBUG\]\s*\*\//g, '')
                .replace(/[^\n]*\[DEBUG\][\s\S]*?\[\/DEBUG\][^\n]*\n?/g, '')
            }
          }
        ] : [
          {
            loader: 'babel-loader',
            options: BABEL_PARAMS
          }
        ]
      },
      {
        test: path.resolve(__dirname, 'src/face.html'),
        use: [
          'htmlclean-loader',
          {
            loader: 'skeleton-loader',
            options: {
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
            }
          }
        ]
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: 'skeleton-loader',
            options: {toCode: true}
          },
          'clean-css-loader'
        ]
      }
    ]
  },
  devtool: BUILD ? false : 'source-map',
  plugins: BUILD ? [
    new webpack.optimize.UglifyJsPlugin({compress: {warnings: true}}),
    new webpack.BannerPlugin({raw: true,
      banner: `/*! ${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage} */`})
  ] : []
};
