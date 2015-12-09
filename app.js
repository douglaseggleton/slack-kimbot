var
  Slack = require('slack-client'),
  responses = [
    '안녕! It\'s a nice day! Why not head to the market? I recommend the Bibbimbap!',
    'สวัสดี! A busy day with lots of meetings, but there\'s always time for Thai!',
    'Chào bạn! Take a trip to Camden Town and sample the excellent Vietnamese food!',
    'Hola! Burritos all round!',
    'Let\'s try something new... what do you suggest?'
  ];

slack = new Slack(process.env.SLACK_BOT_KEY, true, true);

var isDirect = function(userId, messageText) {
    var userTag = '@' + userId;
    return messageText &&
           messageText.length >= userTag.length &&
           messageText.substr(0, userTag.length) === userTag;
};

slack.on('message', function(message) {
    var channel = slack.getChannelGroupOrDMByID(message.channel);
    var user = slack.getUserByID(message.user);

    if (message.type === 'message' &&  message.text.indexOf('@' + slack.self.id) > -1)
      channel.send(responses[Math.floor(Math.random()*responses.length)]);
});




slack.login();
