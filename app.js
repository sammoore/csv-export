'use strict';

const { create, keys } = Object;

function values(object) {
  return keys(object).map(k => object[k]);
}

function include(strings, ...expressions) {
  const moduleRef = expressions.reduce((out, expr, idx) => {
    return `${out}${expr}${strings[idx + 1]}`;
  }, strings[0]);

  return require(moduleRef);
}

const csv = require('csv');
const fs = require('fs');
const parseArgs = require('./parse-args');
const logger = require('./logger');
const transform = require('stream-transform');

const args = parseArgs();
const input = getInputStream(args);
const config = require('./config.example.js');

const rowParser = csv.parse({ trim: true });
const transformColumnHeadings = require('./pre-transformer.js')(config);
const collectEach = csv.stringify();
const Collector = require('./collect');
const stringify = transform((data, cb) => {
  try { cb(null, JSON.stringify(data)); }
  catch (err) { cb(err); }
});

input
  //.pipe(logger({ n: 5, prefix: "raw" }))
  .pipe(rowParser)
  //.pipe(logger({ n: 5, prefix: "before" }))
  .pipe(transformColumnHeadings)
  //.pipe(logger({ n: 5, prefix: "after" }))
  .pipe(collectEach)
  .pipe(csv.parse({ columns: values(config.columns) }))
  //.pipe(logger({ n: 5, prefix: "before" }))
  .pipe(stringify)
  //.pipe(new Collector({ objectMode: true }))
  .pipe(logger({ n: 5, prefix: "collected" }))
;

function getInputStream(args) {
  if (args['-']) {
    return process.stdin;
  } else {
    return fs.createReadStream(args.file);
  } 
}
