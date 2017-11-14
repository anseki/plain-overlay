/* eslint-env node, es6 */

'use strict';

const
  path = require('path'),
  SRC_PATH = path.resolve(__dirname, 'src'),
  BUILD = process.env.NODE_ENV === 'production',
  LIMIT = process.env.EDITION === 'limit',
  SYNC = process.env.SYNC === 'yes', // Enable "sync-mode support"
  SRC = process.env.SRC === 'yes',
  BABEL_RULE = {
    loader: 'babel-loader',
    options: {
      presets: ['es2015'],
      plugins: ['add-module-exports']
    }
  },

  LIMIT_TAGS = ['FACE'],
  BASE_NAME = 'plain-overlay',
  ENTRY_PATH = path.resolve(SRC_PATH, `${BASE_NAME}.js`),
  BUILD_FILE = `${BASE_NAME}${LIMIT ? '-limit' : ''}${SYNC ? '-sync' : ''}${BUILD ? '.min' : ''}.js`,
  preProc = require('pre-proc');

if (!LIMIT && !SYNC && SRC) { throw new Error('This options break source file.'); }

module.exports = [
  {
    resource: {and: [SRC_PATH, /\.js$/]},
    use: [
      BABEL_RULE,
      {
        loader: 'skeleton-loader',
        options: {
          procedure: function(content) {
            if (LIMIT || SYNC) {
              if (LIMIT) { content = preProc.removeTag(LIMIT_TAGS, content); }
              if (SYNC) { content = preProc.removeTag('DISABLE-SYNC', content); }
              if (!BUILD && SRC && this.resourcePath === ENTRY_PATH) {
                // Save the source code of limited functions (or enabled "sync-mode support").
                const destPath = path.resolve(SRC_PATH, BUILD_FILE);
                require('fs').writeFileSync(destPath,
                  '/*\n  DON\'T MANUALLY EDIT THIS FILE; run ' +
                  '`npm run dev-limit` OR `npm run dev-sync`' + // NPM command
                  ` instead.\n*/\n\n${content}`);
                console.log(`Output: ${destPath}`);
              }
            }
            return BUILD ? preProc.removeTag('DEBUG', content) : content;
          }
        }
      }
    ]
  },
  {
    resource: {and: [SRC_PATH, /\.scss$/]},
    use: [
      {
        loader: 'skeleton-loader',
        options: {
          procedure: content => (content + '').replace(/\n/g, ''), // for node-sass bug?
          toCode: true
        }
      },
      {
        loader: 'sass-loader',
        options: {
          includePaths: process.env.SASS_PATHS.split('\n'),
          outputStyle: 'compressed'
        }
      },
      BUILD ? {
        loader: 'pre-proc-loader',
        options: {removeTag: {tag: 'DEBUG'}}
      } : null,
      LIMIT ? {
        loader: 'pre-proc-loader',
        options: {removeTag: {tag: LIMIT_TAGS}}
      } : null
    ].filter(loader => !!loader)
  },
  {
    test: path.resolve(SRC_PATH, 'face.html'),
    use: [
      'htmlclean-loader',
      {
        loader: 'pre-proc-loader',
        options: {pickTag: {}}
      }
    ]
  }
];
