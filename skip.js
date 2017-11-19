'use strict';

const transform = require('stream-transform');

module.exports = function (n) {
  let i = 0;

  if (n == 0) {
    return transform(function (data, cb) {
      cb(null, data);
    });
  }

  return transform(function (data, cb) {
    if (i++ < n) {
      cb(null, null);
    } else {
      cb(null, data);
    }
  });
};
