'use strict';

const transform = require('stream-transform');

module.exports = function (config) {
  const columnIterator = transformCellsForColumns(config);
  const columnTransformer = callbackIterator(firstOnlyIterator(columnIterator));

  return transform(function (data, cb) {
    columnTransformer(data, (err, data) => {
      cb(err, data);
    });
  });
};

function transformCellsForColumns(config) {
  return (tr) => {
    return tr.map((td) => {
      return config.columns[td] || td;
    });
  };
}

// returns a node-style callback function interator `(value, cb) => ()` which
// wraps the provided synchronous iterator `(value) => result`.
function callbackIterator(iterator = (x) => x) {
  return function (value, cb) {
    try {
      value = iterator(value);
      cb(null, value);
    } catch (err) {
      cb(err);
    }
  };
}

// returns an iterator that applies the given iterator to the first iteratee only
function firstOnlyIterator(iterator = (iteratee) => iteratee) {
  return function wrapper(iteratee) {
    if (!wrapper.done) {
      wrapper.done = true;
      iteratee = iterator(iteratee);
    }
    return iteratee;
  };
}
