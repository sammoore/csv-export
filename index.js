'use strict';

const csv = require('csv');
const transform = require('stream-transform');
const collector = require('./lib/collector');
const expand = require('./lib/expand');
const skip = require('./lib/skip');
const logger = require('./lib/logger');

const config = require('./config.example.js');
const mkTranslateHeadings = require('./pre-transformer.js');
const parseHumanTimeRange = require('./parseHumanTimeRange');
const parseGeoCode = require('./parseGeoCode');

const ratings = ['Better than nothing', 'Good', 'Excellent'];

const adapter = () => transform((data, cb) => {
  data.hours = data.hours.map((value, idx) => {
    return parseHumanTimeRange(value);
  });

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
  data.rating = ratings.indexOf(data.rating);
  parseGeoCode(data.address).then(response => {
    data.coordinates = response;
    cb(null, data);
  });
});

const jsonify = () => transform((data, cb) => {
  try { cb(null, JSON.stringify(data)); }
  catch (err) { cb(err); }
});

const collect = () => collector({
  delimiter: ',',
  prefix: '[',
  suffix: ']'
});

const toStringStream = () => transform((data, cb) => {
  try { cb(null, data.toString()); }
  catch (err) { cb(err); }
});

function csvStreamToAdaptedJsonStream(csvStream/*: NodeJS.ReadStream | ReadStream */)/*: NodeJS.ReadStream | ReadStream */ {
  return csvStream
    .pipe(csv.parse({ trim: true }))
    .pipe(mkTranslateHeadings(config))
    //.pipe(logger({ prefix: 'translated', n: 2 }))
    .pipe(csv.stringify())
    //.pipe(logger({ prefix: 'stringified', n: 2 }))
    .pipe(csv.parse({ columns: true }))
    //.pipe(logger({ prefix: 'parsed', n: 2 }))
    //.pipe(skip(1)) // ignore unnecessary { column: 'column', ... } object
    .pipe(expand()) // expand 'foo[bar]' and 'arr[0]' keys in each object
    .pipe(adapter()) // adapt values to mongo compatible
    // .pipe(logger({ prefix: 'adapted', n: 2 }))
    .pipe(jsonify()) // get a JSON string for each row
    .pipe(collect()) // collect each element to an JSON Array string, as a buffer.
    .pipe(toStringStream()) // turn buffer to a string
  ;
};
Object.assign(module.exports, { csvStreamToAdaptedJsonStream });
