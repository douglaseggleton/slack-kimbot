var Slack = require('slack-client'),
  Kimbot = require('./kimbot');

var responses = [
 '안녕! It\'s a nice day! Why not head to the market? I recommend the ' +
   'Bibbimbap!',
 'สวัสดี! A busy day with lots of meetings, but there\'s always time for ' +
   'Thai!',
 'Chào bạn! Take a trip to Camden Town and sample the excellent ' +
   'Vietnamese food!',
 'Hola! Burritos all round!',
 'Let\'s try something new... what do you suggest?'
];

var slack = new Slack(process.env.SLACK_BOT_KEY, true, true);
var kimbot = new Kimbot(slack, responses);

slack.on('message', function (message) {
  // Inside AnonFn. to ensure not called with slacks 'this' scope.
  kimbot.respond(message);
});

slack.login();