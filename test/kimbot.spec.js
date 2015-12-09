/* global describe, it */

var sinon = require('sinon'),
  chai = require('chai'),
  Kimbot = require('./../lib/kimbot'),
  sinonChai = require('sinon-chai');

chai.should();
chai.use(sinonChai);

describe('kimbot', function () {
  describe('respond', function () {
    it('should send a response back to the chanel when the user is mentioned',
      function () {
        // arrange
        var channel = {
          send: sinon.stub()
        };
        var slack = {
          login: sinon.stub(),
          getChannelGroupOrDMByID: sinon.stub().returns(channel),
          self: {
            id: 'testuser'
          }
        };
        var kimbot = new Kimbot(slack, [
          'test-response'
        ]);
        var message = {
          type: 'message',
          text: 'mention @testuser in test'
        };

        // act
        kimbot.respond(message);

        // assert
        channel.send.should.have.been.calledWith('test-response');
      });
  });
});
