'use strict';

const transform = require('stream-transform');

module.exports = function (config) {
  const translate = translator(config.columns);

  return transform(function t(row, cb) {
    try {
      if (!t.columns) {
        t.columns = true;
        row = row.map(translate);
      }
    } catch (e) {
      cb(e);
      return;
    }
    cb(null, row);
  });
};

function translator(dict) {
  return (val) => dict[val] || val;
}
