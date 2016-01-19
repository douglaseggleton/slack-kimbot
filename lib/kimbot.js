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

Kimbot.prototype.getCoffeeRecommendation = function () {
  return this.clients.foursquare.explore(process.env.LAT,
    process.env.LNG, '1', 'coffee', 250).then(function (res) {
      var venue = selectRandomResult(res.response.groups[0].items);
      return 'Hej! It\s Fika time! Why not grab a latte from this place? ... ' +
        venue.venue.name + ' https://foursquare.com/v/' + venue.venue.id;
    });
};

module.exports = Kimbot;
