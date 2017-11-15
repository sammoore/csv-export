'use strict';

const { assign } = Object;

const transform = require('stream-transform');

const DEFAULTS = {
  n: -1,
  prefix: "stream"
};

module.exports = function (options = DEFAULTS) {
  options = assign({}, DEFAULTS, options);
  const { n, prefix } = options;
  let i = n;

  return transform(function (data, cb) {
    if (i-- > 0) {
      console.log(`${prefix}: typeof:`, typeof data);
      console.log(`${prefix}: isArray:`, Array.isArray(data));
      console.log(data);
      console.log("");
    }
    cb(null, data);
  });
};
