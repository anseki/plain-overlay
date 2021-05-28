/* eslint-env node, es6 */

'use strict';

const
  BASE_NAME = 'plain-overlay',
  OBJECT_NAME = 'PlainOverlay',
  LIMIT_TAGS = ['FACE'],
  BUILD_MODE = process.env.NODE_ENV === 'production',
  LIMIT = process.env.EDITION === 'limit',
  SYNC = process.env.SYNC === 'yes', // Enable "sync-mode support"
  BUILD_BASE_NAME = `${BASE_NAME}${LIMIT ? '-limit' : ''}${SYNC ? '-sync' : ''}`,
  PREPROC_REMOVE_TAGS =
    (BUILD_MODE ? ['DEBUG'] : []).concat(LIMIT ? LIMIT_TAGS : [], SYNC ? 'DISABLE-SYNC' : []),

  webpack = require('webpack'),
  preProc = require('pre-proc'),
  pathUtil = require('path'),
  fs = require('fs'),
  PKG = require('./package'),

  SRC_DIR_PATH = pathUtil.resolve(__dirname, 'src'),
  BUILD_DIR_PATH = BUILD_MODE ? __dirname : pathUtil.resolve(__dirname, 'test'),
  ESM_DIR_PATH = __dirname,
  ENTRY_PATH = pathUtil.join(SRC_DIR_PATH, `${BASE_NAME}.js`),

  STATIC_ESM_FILES = [], // [{fileName, content}]
  STATIC_ESM_CONTENTS = [], // [{path, re, content}]
  PostCompile = require('post-compile-webpack-plugin');

function writeFile(filePath, content, messageClass) {
  const HL = '='.repeat(48);
  fs.writeFileSync(filePath,
    `/* ${HL}\n        DON'T MANUALLY EDIT THIS FILE\n${HL} */\n\n${content}`);
  console.log(`Output (${messageClass}): ${filePath}`);
}

module.exports = {
  // optimization: {minimize: false},
  mode: BUILD_MODE ? 'production' : 'development',
  entry: ENTRY_PATH,
  output: {
    path: BUILD_DIR_PATH,
    filename: `${BUILD_BASE_NAME}${BUILD_MODE ? '.min' : ''}.js`,
    library: OBJECT_NAME,
    libraryTarget: 'var',
    libraryExport: 'default'
  },
  module: {
    rules: [
      {
        resource: {and: [SRC_DIR_PATH, /\.js$/]},
        use: [
          // ================================ Static ESM
          {
            loader: 'skeleton-loader',
            options: {
              procedure(content) {
                if (this.resourcePath === ENTRY_PATH) {
                  STATIC_ESM_FILES.push(
                    {fileName: `${BUILD_BASE_NAME}${BUILD_MODE ? '' : '-debug'}.esm.js`, content});
                }
                return content;
              }
            }
          },
          // ================================ Babel
          {
            loader: 'babel-loader',
            options: {presets: [['@babel/preset-env', {targets: 'defaults', modules: false}]]}
          },
          // ================================ Preprocess
          PREPROC_REMOVE_TAGS.length ? {
            loader: 'skeleton-loader',
            options: {
              procedure(content) {
                content = preProc.removeTag(PREPROC_REMOVE_TAGS, content);
                if (BUILD_MODE && this.resourcePath === ENTRY_PATH) {
                  writeFile(pathUtil.join(SRC_DIR_PATH, `${BUILD_BASE_NAME}.proc.js`), content, 'PROC');
                }
                return content;
              }
            }
          } : null
        ].filter(loader => !!loader)
      },
      {
        resource: {and: [SRC_DIR_PATH, /\.scss$/]},
        use: [
          // ================================ Static ESM
          {
            loader: 'skeleton-loader',
            options: {
              procedure(content) {
                if (!this._module.rawRequest) { throw new Error('Can\'t get `rawRequest`'); }
                STATIC_ESM_CONTENTS.push({path: this._module.rawRequest, content});
                return content;
              },
              toCode: true
            }
          },
          // ================================ Autoprefixer
          {
            loader: 'postcss-loader',
            options: {postcssOptions: {plugins: [['autoprefixer']]}}
          },
          // ================================ SASS
          {
            loader: 'sass-loader',
            options: {
              implementation: require('sass'),
              sassOptions: {
                fiber: require('fibers'),
                includePaths: [pathUtil.resolve(__dirname, '../../_common')],
                outputStyle: 'compressed'
              }
            }
          },
          // ================================ Preprocess
          PREPROC_REMOVE_TAGS.length ? {
            loader: 'pre-proc-loader',
            options: {removeTag: {tag: PREPROC_REMOVE_TAGS}}
          } : null
        ].filter(loader => !!loader)
      },
      {
        test: pathUtil.resolve(SRC_DIR_PATH, 'face.html'),
        use: [
          // ================================ Static ESM
          {
            loader: 'skeleton-loader',
            options: {
              procedure(content) {
                if (!this._module.rawRequest) { throw new Error('Can\'t get `rawRequest`'); }
                STATIC_ESM_CONTENTS.push({path: this._module.rawRequest, content});
                return content;
              },
              toCode: true
            }
          },
          // ================================ Minify
          'htmlclean-loader',
          // ================================ Preprocess
          {
            loader: 'pre-proc-loader',
            options: {pickTag: {}} // `tag` is specified in source code `import`
          }
        ]
      }
    ]
  },
  devtool: BUILD_MODE ? false : 'source-map',
  plugins: [
    BUILD_MODE ? new webpack.BannerPlugin(
      `${PKG.title || PKG.name} v${PKG.version} (c) ${PKG.author.name} ${PKG.homepage}`) : null,

    // Static ESM
    new PostCompile(() => {
      // Fix STATIC_ESM_CONTENTS
      STATIC_ESM_CONTENTS.forEach(content => {
        // Member Import is not supported
        content.re = new RegExp(`\\bimport\\s+(\\w+)\\s+from\\s+(?:'|")${
          content.path.replace(/[\x00-\x7f]/g, // eslint-disable-line no-control-regex
            s => `\\x${('00' + s.charCodeAt().toString(16)).substr(-2)}`)}(?:'|")`, 'g');
        content.content = JSON.stringify(content.content);
      });

      STATIC_ESM_FILES.forEach(file => {
        STATIC_ESM_CONTENTS.forEach(content => {
          file.content = file.content.replace(content.re,
            (s, varName) => `/* Static ESM */ /* ${s} */ var ${varName} = ${content.content}`);
        });
        // Save ESM file
        writeFile(pathUtil.join(ESM_DIR_PATH, file.fileName), file.content, 'ESM');
      });
    })
  ].filter(plugin => !!plugin)
};
