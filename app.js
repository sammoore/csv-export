'use strict';

const { create, keys } = Object;

function values(object) {
  return keys(object).map(k => object[k]);
}

const csv = require('csv');
const fs = require('fs');
const parseArgs = require('./parse-args');
const transform = require('stream-transform');
const Collector = require('./collect');
const logger = require('./logger');
const config = require('./config.example.js');
const transformColumnHeadings = require('./pre-transformer.js')(config);

const skip = require('./skip');

const args = parseArgs();
const input = getInputStream(args);

const jsonify = transform((data, cb) => {
  try { cb(null, JSON.stringify(data)); }
  catch (err) { cb(err); }
});

const collect = new Collector({
  delimiter: ',',
  prefix: '[',
  suffix: ']'
});

const toStringStream = transform((data, cb) => {
  try { cb(null, data.toString()); }
  catch (err) { cb(err); }
});

input
.pipe(csv.parse({ trim: true }))
.pipe(transformColumnHeadings)
.pipe(csv.stringify()) // stringify each row
.pipe(csv.parse({ columns: values(config.columns) }))
.pipe(skip(1)) // ignore column headings row; we have objects now.
.pipe(jsonify) // get a JSON string for each row
.pipe(collect) // collect each element to an JSON Array string, as a buffer.
.pipe(toStringStream) // turn buffer to a string
.pipe(process.stdout);

function getInputStream(args) {
  if (args['-']) {
    return process.stdin;
  } else {
    return fs.createReadStream(args.file);
  } 
}
