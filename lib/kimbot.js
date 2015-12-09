/**
 * Creates a new Kimbot
 *
 * @param {object} slack - slack client
 */
function Kimbot (slack, responses) {
  this.slack = slack;
  this.responses = responses;
}

/**
 * Responds to a slack message
 *
 * @param {object} message - slack message
 */
Kimbot.prototype.respond = function (message) {
  var channel = this.slack.getChannelGroupOrDMByID(message.channel);
  if (message.type === 'message' &&
    message.text.indexOf('@' + this.slack.self.id) > -1) {
    channel.send(
      this.responses[Math.floor(Math.random() * this.responses.length)]);
  }
};

module.exports = Kimbot;
