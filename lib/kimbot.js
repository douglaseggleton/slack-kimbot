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

/**
 * Kimbot Context
 *
 * @param KimbotContext previousContext
 */
function KimbotContext () {}
var context = new KimbotContext();

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
    if (context.requestedFoodType) {
      var answer = message.text.split();
      if (answer.length === 1) {
        context.cuisineType = answer[0];
      }
      context.requestedFoodType = false;
      this.getLunchRecommendation(context.cuisineType).then(function (venue) {
        context.cuisineType = undefined;
        channel.send(venue);
      });
    } else if (message.text.indexOf('coffee') > -1) {
      this.getCoffeeRecommendation().then(function (venue) {
        channel.send(venue);
      });
    } else if (message.text.indexOf('lunch') > -1) {
      if (!context.cuisineType) {
        var foodTypes = ['vietnamese', 'british', 'thai', 'italian'];
        channel.send('What kind of food would you like for lunch? e.g. ' +
          foodTypes.join(', ') + ' etc');
        context.requestedFoodType = true;
        return;
      }
      this.getLunchRecommendation().then(function (venue) {
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
  var isCold = false;
  var clients = this.clients;

  return this.clients.weather
    .getCurrentForecast(process.env.LAT, process.env.LNG)
    .then(function (response) {

      var tempCelsius = response.main.temp - 273.15;

      if (tempCelsius < 5) {
        isCold = true;
        distance = distance / 2;
      }

      return clients.foursquare.explore(process.env.LAT,
        process.env.LNG, pricePoint, section, distance)
        .then(function (res) {
          var venue = selectRandomResult(res.response.groups[0].items);

          var venueLink = '... ' +
            venue.venue.name + ' at ' + formatVenueAddress(venue) +
              ' https://foursquare.com/v/' + venue.venue.id;

          if (isCold) {
            return 'It\'s a bit cold outside (it\'s ' +
              Math.round(tempCelsius) +
              ' degrees)! Let\'s not venture too far for coffee ' + venueLink;
          }

          return 'Hej! It\'s Fika time! Why not grab a latte from this place?' +
            ' ' + venueLink;
        });

    });
};

function formatVenueRating(venue) {
  if (venue.venue.rating) {
    return ' with rating ' + venue.venue.rating + '/10';
  }
  return '';
}

Kimbot.prototype.getLunchRecommendation = function (cuisineType) {
  var section = 'food';
  var distance = this.getWalkingDistance(section);
  var pricePoint = this.getFoursquarePricePoint(section);
  var isCold = false;
  var clients = this.clients;

  return this.clients.weather
    .getCurrentForecast(process.env.LAT, process.env.LNG)
    .then(function (response) {

      var tempCelsius = response.main.temp - 273.15;

      if (tempCelsius < 5) {
        isCold = true;
        distance = distance / 2;
      }

      var sectionType = section;
      var query = cuisineType;
      if (cuisineType && cuisineType.indexOf('any') === -1) {
        sectionType = undefined;
      } else {
        query = undefined;
      }

      return clients.foursquare.explore(process.env.LAT,
        process.env.LNG, pricePoint, sectionType, distance, query)
        .then(function (res) {
          var venue = selectRandomResult(res.response.groups[0].items);

          var venueLink = '... ' +
            venue.venue.name + formatVenueRating(venue) +
              ' at ' + formatVenueAddress(venue) +
              ' https://foursquare.com/v/' + venue.venue.id;

          if (isCold) {
            return 'It\'s a bit cold outside (it\'s ' +
              Math.round(tempCelsius) +
              ' degrees)! Let\'s not venture too far for lunch ' + venueLink;
          }

          return 'Hej! It\'s lunch time! How about this place? ' + venueLink;
        });

    });
};

module.exports = Kimbot;
