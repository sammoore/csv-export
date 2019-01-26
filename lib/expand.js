'use strict';

const transform = require('stream-transform');
const qs = require('qs');

const OPTIONS = { encode: true };

module.exports = transform((data, cb) => {
  let result = null;
  try {
    result = qs.parse(qs.stringify(data, OPTIONS), OPTIONS);
  } catch (err) {
    return cb(err);
  }
  cb(null, result);
});
