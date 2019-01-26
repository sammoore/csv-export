'use strict';

const { create, keys } = Object;

const fs = require('fs');
const parseArgs = require('./parse-args');
const { csvStreamToAdaptedJsonStream } = require('../');

if (require.main === module) {
  const args = parseArgs();
  const input = getInputStream(args);

  csvStreamToAdaptedJsonStream(input).pipe(process.stdout);
}

function getInputStream(args) {
  if (args['-']) {
    return process.stdin;
  } else {
    return fs.createReadStream(args.file);
  } 
}