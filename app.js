'use strict';

const { create, keys } = Object;

function values(object) {
  return keys(object).map(k => object[k]);
}

const csv = require('csv');
const fs = require('fs');
const parseArgs = require('./parse-args');
const parseHumanTimeRange = require('./parseHumanTimeRange');
const transform = require('stream-transform');
const Collector = require('./collect');
const logger = require('./logger');
const config = require('./config.example.js');
const translateHeadings = require('./pre-transformer.js')(config);

const skip = require('./skip');
const expand = require('./expand');

const args = parseArgs();
const input = getInputStream(args);
const parseGeoCode = require('./parseGeoCode');
const ratings = ['Better than nothing', 'Good', 'Excellent'];

const adapter = transform((data, cb) => {
  data.hours = data.hours.map(parseHumanTimeRange);

  for (var key in data.perks) {
    var value = data.perks[key];

    if (value.toLowerCase().indexOf('yes') != -1) {
      data.perks[key] = true;
    } else {
      data.perks[key] = false;
    }
  }
  if (data.access.toLowerCase().indexOf('open;customers only') != -1){
    data.access = 'Open'
  }
  if (data.access.toLowerCase().indexOf('token') != -1){
    data.access = 'Key'
  }
  data.rating = getRating(data.rating);
  parseGeoCode(data.address).then(response => {
    data.coordinates = response;
    cb(null, data);
  });
});

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
.pipe(translateHeadings)
//.pipe(logger({ prefix: 'translated', n: 2 }))
.pipe(csv.stringify())
//.pipe(logger({ prefix: 'stringified', n: 2 }))
.pipe(csv.parse({ columns: true }))
//.pipe(logger({ prefix: 'parsed', n: 2 }))
//.pipe(skip(1)) // ignore unnecessary { column: 'column', ... } object
.pipe(expand) // expand 'foo[bar]' and 'arr[0]' keys in each object
.pipe(adapter) // adapt values to mongo compatible
// .pipe(logger({ prefix: 'adapted', n: 2 }))
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

function getRating(rating){
  return ratings.indexOf(rating);
}
