const login = require('facebook-chat-api');
const broker = require('./ZeroBroker.js');

const db = {}

login({ email: '...', password: '...' }, (err, api) => {
  if (err) {
    console.error('Error logging in Facebook', err);
    process.exit(1);
  }

  const myId = api.getCurrentUserID()
  api.setOptions({ selfListen: true }); // !important
  api.listen((err, message) => {
    if (message.senderID === myId && message.body.startsWith('ZeroBroker::')) {
      const request = broker.parse(message.body);
      // fulfill request (that comes after ZeroBroker::)...
      // ... then send a response to ZeroMessenger via the same thread (i.e. texting myself)
      api.sendMessage(message.body, message.threadID, (err, messageInfo) => {
        if (err) {
          // retry?
          return console.error(err);
        }
      });
    }
  });
});
