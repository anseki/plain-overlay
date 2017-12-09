/* eslint-env node, es6 */

'use strict';

const
  path = require('path'),
  SRC_PATH = path.resolve(__dirname, 'src'),
  BUILD = process.env.NODE_ENV === 'production',
  LIMIT = process.env.EDITION === 'limit',
  SYNC = process.env.SYNC === 'yes', // Enable "sync-mode support"
  BABEL_RULE = {
    loader: 'babel-loader',
    options: {
      presets: ['es2015'],
      plugins: ['add-module-exports']
    }
  },

  LIMIT_TAGS = ['FACE'],
  BASE_NAME = 'plain-overlay',
  OWN_PATH = path.resolve(SRC_PATH, `${BASE_NAME}.js`);

module.exports = [
  {
    resource: {and: [SRC_PATH, /\.js$/]},
    use: [
      BABEL_RULE,
      BUILD ? {
        loader: 'pre-proc-loader',
        options: {
          removeTag: {tag: ['DEBUG'].concat(LIMIT ? LIMIT_TAGS : [], SYNC ? 'DISABLE-SYNC' : [])}
        }
      } : {
        loader: 'skeleton-loader',
        options: {
          procedure: function(content) {
            const preProc = require('pre-proc');
            if (LIMIT) { content = preProc.removeTag(LIMIT_TAGS, content); }
            if (SYNC) { content = preProc.removeTag('DISABLE-SYNC', content); }
            if (this.resourcePath === OWN_PATH && this.options.entry === OWN_PATH) {
              // Save the source code after preProc has been applied.
              const destPath = path.resolve(SRC_PATH,
                `${BASE_NAME}${LIMIT ? '-limit' : ''}${SYNC ? '-sync' : ''}.proc.js`);
              require('fs').writeFileSync(destPath,
                '/*\n    DON\'T MANUALLY EDIT THIS FILE\n*/\n\n' +
                preProc.removeTag('DEBUG', content));
              console.log(`Output: ${destPath}`);
            }
            return content;
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
