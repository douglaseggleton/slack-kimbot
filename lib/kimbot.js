/**
 * Creates a new Kimbot
 *
 * @param {object} slack - slack client
 */
function Kimbot (slack, responses, clients) {
  this.slack = slack;
  this.responses = responses;
  this.clients = clients;
}

var selectRandomResult = function (arrayOfResults) {
  return arrayOfResults[Math.floor(Math.random() * arrayOfResults.length)];
};

/**
 * Responds to a slack message
 *
 * @param {object} message - slack message
 */
Kimbot.prototype.respond = function (message) {
  var channel = this.slack.getChannelGroupOrDMByID(message.channel);
  if (message.type === 'message' && message.text) {
    if (message.text.indexOf('coffee') > -1) {
      this.getCoffeeRecommendation().then(function (venue) {
        channel.send(venue);
      });
    } else if (message.text.indexOf('@' + this.slack.self.id) > -1) {
      channel.send(selectRandomResult(this.responses));
    }
  }
};

/**
 * Get the distance the user is willing to walk for a section venue.
 *
 * @param string section - Either 'food' or 'coffee'.
 */
Kimbot.prototype.getWalkingDistance = function (section) {
  if (section === 'food') {
    return 1000;
  }
  return 500;
};

/**
 * Get the FourSquare price point for a section.
 *
 * @param string section - Either 'food' or 'coffee'.
 */
Kimbot.prototype.getFoursquarePricePoint = function (section) {
  if (section === 'food') {
    return '1,2';
  }
  return '1';
};

function formatVenueAddress(venue) {
  var components = [];
  var addressComponents =
    ['address', 'crossStreet', 'city', 'state', 'postalCode'];
  addressComponents.forEach(function (value) {
    if (venue.venue.location[value]) {
      components.push(venue.venue.location[value]);
    }
  });
  return components.join(', ');
}

Kimbot.prototype.getCoffeeRecommendation = function () {
  var section = 'coffee';
  var distance = this.getWalkingDistance(section);
  var pricePoint = this.getFoursquarePricePoint(section);
  return this.clients.foursquare.explore(process.env.LAT,
    process.env.LNG, pricePoint, section, distance).then(function (res) {
      var venue = selectRandomResult(res.response.groups[0].items);
      return 'Hej! It\s Fika time! Why not grab a latte from this place? ... ' +
        venue.venue.name + ' at ' + formatVenueAddress(venue) +
        ' https://foursquare.com/v/' + venue.venue.id;
    });
};

module.exports = Kimbot;
