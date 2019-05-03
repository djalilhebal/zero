const {Readable} = require('stream');
const login = require('facebook-chat-api');
const ZeroBroker = require('./ZeroBroker.js');

// attach it to ZeroBroker? Convert it to a class ZeroDatastore or ZeroCache or something?
const db = new Map();

login({ email: '...', password: '...' }, (err, api) => {
  if (err) {
    console.error('Error logging in Facebook', err);
    process.exit(1);
  }

  const myId = api.getCurrentUserID();
  api.setOptions({ selfListen: true }); // !important
  api.listen((err, message) => {
    if (message.senderID === myId && message.body.startsWith('ZeroBroker::')) {
      const parsed = ZeroBroker.parseRequest(message.body);
      const response = fulfillRequest(parsed);
      if (!response) return;
      // Send a response to ZeroMessenger via the same thread (i.e. texting myself)
      api.sendMessage('ZeroBroker::info::'+response, message.threadID, (err, sentMessage) => {
        if (err) {
          // retry?
          return console.error(err);
        }
      });
    }
  });
});

/**
 * @param {object} request
 * @returns {string} Response string to ZeroMessenger maybe
 */
function fulfillRequest(request) {
  if (request.action === 'send') {
    //@ts-ignore
    const seg = new ZeroSegment(request.fileSegment)
    if (db.has(seg.id)) {
      const zf = db.get(seg.id);
      zf.addPart(seg);
      if (zf.isComplete()) {
        sendAsNormalFile(zf);
        return `sent ${ze.id}`
      }
    } else {
      // @todo in case the file contains only one seg.
      db.set(seg.id, new ZeroFile(seg));
    }
  return `got ${seg.id} ${seg.partNum}`
  } else if (request.action === 'get') {
    // realfile = fetch(request.link)
    // zerofile = toZeroFile(file)
    // zerofile.segments.forEach(segmen => sendText(segment, toMyself, autoretry))
  }
  return ''
}

function sendAsNormalFile(zfid) {
  const info = db.get(zfid);
  var message = {
    body: '',
    attachment: toReadStream(info.data)
  }

  api.sendMessage(message, info.target, (err, sentMessage) => {
    if (err) {
      console.error(err);
      // retry? Inform ZeroMessenger?
    } else {
      info.fbid = sentMessage.id;
    }
  })
  
}

/**
 * Convert a base64 string to a ReadStream
 * Taken from https://stackoverflow.com/a/44091532/9453525
 * @todo Good enough for my use-case?
 * @param {string} str
 * @returns {Readable}
 */
function toReadStream(str) {
  const buffer = new Buffer(str, 'base64')
  const readable = new Readable()
  readable._read = () => {} // _read is required but you can noop it
  readable.push(buffer)
  readable.push(null)
  return readable
}
