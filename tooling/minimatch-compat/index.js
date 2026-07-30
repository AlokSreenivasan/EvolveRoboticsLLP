'use strict';

/**
 * Compat shim: minimatch v10 no longer exports a callable default.
 * ESLint 8 / eslint-plugin-react still do `require('minimatch')(...)`.
 */
const api = require('./dist/commonjs/index.js');

function minimatch(path, pattern, options) {
  return api.minimatch(path, pattern, options);
}

Object.assign(minimatch, api);
minimatch.default = minimatch;
minimatch.minimatch = minimatch;

module.exports = minimatch;
