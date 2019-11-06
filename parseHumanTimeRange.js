'use strict';

const chrono = require('chrono-node');

module.exports = function parseHumanTimeRange(str) {
  if (str.toLowerCase().indexOf('open 24') != -1) {
    return parseHumanTimeRange('12am-11:59pm');
  }

  return parseRange(str);
}

function parseRange(str) {
  // TODO: chrono.parse should return 1 value in an Array, otherwise parse failed
  const result = chrono.parse(str).shift();

  if (!result) {
    return null;
  } else {
    return [
      result.start.knownValues,
      result.end.knownValues
    ].map(timeObjectToDate);
  }
}

function timeObjectToDate(obj) {
  return new Date((obj.hour * 60 * 60 * 1000) + (obj.minute * 60 * 1000));
}
