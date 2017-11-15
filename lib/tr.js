'use strict';

const { assign, keys } = Object;

const stream = require('stream');

const SET1 = Symbol();
const SET2 = Symbol();

class TranslateChar extends stream.Transform {
  get set1() { return this[SET1]; }
  get set2() { return this[SET2]; }

  constructor (set1, set2) {
    if (typeof set1 == 'object') {
      { set1, set2 } = set1;
    }
    
    set1 = set1.charAt(0);
    set2 = set2.charAt(0);

    super();

    this[SET1] = set1;
    this[SET2] = set2;
  }
}

TranslateChar.prototype._transform = function (chunk, encoding, callback) {
  process.nextTick(() => {
    let result;
    try {
      if (encoding == 'buffer') {
        chunk = chunk.toString();
      }
      result = chunk.replace(set1, set2);
      this.push(result);
    } catch (err) {
      return callback(err);
    }
    callback(null, result);
  });
};

module.exports = TranslateChar
