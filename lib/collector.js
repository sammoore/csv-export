'use strict';

const { assign } = Object;

const stream = require('stream');

const DELIMITER = Symbol();
const I = Symbol();
const N = Symbol();
const PREFIX = Symbol();
const SUFFIX = Symbol();
const SINK = Symbol();

const DEFAULTS = {
  delimiter: '',
  prefix: '',
  suffix: '',
//  n: 0 // disable collection
//  n: 2 // join every 2 chunks together
  n: -1 // collect all chunks
};

class Collector extends stream.Transform {
  get delimiter() { return this[DELIMITER]; }
  get prefix() { return this[PREFIX]; }
  get suffix() { return this[SUFFIX]; }
  get i() { return this[I]; }
  get n() { return this[N]; }
  get sink() { return this[SINK]; }

  constructor (options = DEFAULTS) {
    options = assign({}, DEFAULTS, options);
    const { delimiter, n, prefix, suffix } = options;
    delete options.n;
    delete options.delimiter;
    delete options.prefix;
    delete options.suffix;

    super(options);

    this[DELIMITER] = delimiter;
    this[N] = n;
    this[PREFIX] = prefix;
    this[SUFFIX] = suffix;

    this[I] = 0;
    this[SINK] = [];
  }
}

Collector.prototype._transform = function (chunk, encoding, callback) {
  process.nextTick(() => {
    try {
      if (this.n >= 0) {
        Collector_flush.call(this);
      }

      this[I] += 1;
      this[SINK].push(encode(chunk, encoding));
    } catch (err) {
      return callback(err);
    }
    callback();
  });
};

Collector.prototype._flush = function (callback) {
  process.nextTick(() => {
    try {
      if (this[SINK].length > 0) {
        Collector_flush.call(this, true);
      }
    } catch (err) {
      return callback(err);
    }
    callback();
  });
}

function Collector_flush(complete = false) {
  if (complete || this[SINK].length >= this.n) {
    this[I] = 0;
    const collected = collect(this[SINK], {
      delimiter: this.delimiter,
      prefix: this.prefix,
      suffix: this.suffix
    });

    this.push(collected);
    this[SINK] = [];
  }
}

function encode(chunk, encoding) {
  if (encoding == 'buffer') {
    return chunk.toString();
  }

  if (typeof chunk == 'string') {
    return chunk;
  }

  if (typeof chunk == 'object') {
    return JSON.stringify(chunk);
  }
}

function collect(sink, options) {
  const { prefix, suffix, delimiter } = options;
  const joined = join(sink, delimiter);
  const result = joined.split();

  result.unshift(prefix);
  result.push(suffix);
  return result.join('');
}

function join(sink, delimiter) {
  return sink.map(x => ("" + x)).join(delimiter);
}

module.exports = (options) => {
  return new Collector(options);
}