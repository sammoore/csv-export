'use strict';

const { assign } = Object;

const stream = require('stream');
const encode = require('./string-encode');

const DELIMITER = Symbol();
const N = Symbol();
const SINK = Symbol();

const DEFAULTS = {
  delimiter: '',
//  n: 0 // disable collection
  n: -1 // collect all chunks
};

class Rechunk extends stream.Transform {
  get delimiter() { return this[DELIMITER]; }
  get n() { return this[N]; }
  get sink() { return this[SINK]; }

  constructor (options = DEFAULTS) {
    options = assign({}, DEFAULTS, options);
    const { delimiter, n } = options;
    delete options.n;
    delete options.delimiter;

    super(options);

    this[DELIMITER] = delimiter;
    this[N] = n;

    this[SINK] = [];
  }
}

Rechunk.prototype._transform = function (chunk, encoding, callback) {
  process.nextTick(() => {
    try {
      if (this.n >= 0) {
        Rechunk_flush.call(this);
      }

      this[SINK].push(encode(chunk, encoding));
    } catch (err) {
      return callback(err);
    }
    callback();
  });
};

Rechunk.prototype._flush = function (callback) {
  process.nextTick(() => {
    try {
      if (this[SINK].length > 0) {
        Rechunk_flush.call(this, true);
      }
    } catch (err) {
      return callback(err);
    }
    callback();
  });
}
    
module.exports = Rechunk;

function Rechunk_flush(complete = false) {
  if (complete || this[SINK].length >= this.n) {
    const collected = collect(this[SINK], this.delimiter);

    this.push(collected);
    this[SINK] = [];
  }
}

function collect(sink, delimiter) {
  return sink.map(x => ("" + x)).join(delimiter);
}
