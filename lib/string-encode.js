'use strict';

module.exports = function encode(chunk, encoding) {
  if (encoding == 'buffer') {
    return chunk.toString();
  }

  if (typeof chunk == 'string') {
    return chunk;
  }

  if (typeof chunk == 'object') {
    return JSON.stringify(chunk);
  }
};
