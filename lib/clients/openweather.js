var request = require('request-promise');

/**
 *
 */
function OpenWeather(applicationID) {
  this.applicationID = applicationID;
}

/**
 *
 */
OpenWeather.prototype.getCurrentForecast = function (lat, lng) {
  return request({
    method: 'GET',
    json: true,
    uri: 'http://api.openweathermap.org/data/2.5/weather',
    qs: {
      lat: lat,
      lon: lng,
      appid: this.applicationID
    }
  });
};

module.exports = OpenWeather;
