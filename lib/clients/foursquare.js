var request = require('request-promise');

/**
 * Creats a new foursquare client
 */
function Foursquare(clientID, clientSecret) {
  this.clientID = clientID;
  this.clientSecret = clientSecret;
}

/**
 * Authenticates this instance of Foursquare
 */
Foursquare.prototype.explore = function (lat, lng, price, section, radius) {

  return request({
    method: 'GET',
    json: true,
    uri: 'https://api.foursquare.com/v2/venues/explore',
    qs: {
      ll: lat + ',' + lng,
      llAcc: 100,
      radius: radius,
      client_id: this.clientID,
      client_secret: this.clientSecret,
      v: 20151216,
      price: price,
      section: section
    }
  });
};

module.exports = Foursquare;
