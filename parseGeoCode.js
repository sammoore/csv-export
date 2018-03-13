var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyAazZjefmevaOY90VrFyrhEUKWDkYRdWbw', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};

var geocoder = NodeGeocoder(options);
// Using callback

module.exports = function parseGeoCode(address) {
  return geocoder.geocode(address)
  .then(function(res) {
    return [res[0]['longitude'], res[0]['latitude']];
  })
  .catch(function(err) {
    return [];
  });
}