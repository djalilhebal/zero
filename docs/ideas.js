// ZeroMaster: use Promise.race(gotResponse, timeout)

// ZeroChat.handleLinks (to make them readable)
function generateHtml(rawText) {
  let escapedText = escape(rawText)
  escapedText = escapedText.replace(/%02(.+?)%03/g, unescape)
  const html = handleEmoticons(escaped)
  return html  
}

async function isSent() {
  w.setJob( {'fn': 'getError'})
  const res = await w.getResponse()
  return res && res._pageLink.searchParams.get('request_type') === 'send_success'
}

function resend() {
  // getLatestChunk().lastMessage.content === this.content && isMine? Already sent!
}

/**
 * on User and Message
 * @todo use `timeago.js`
 * @returns {string}
 */
function getActiveDateStr() {
  const timestamp = this.timestamp
  return new Date(timestamp).toISOString()
}

// Messenger:conversation:composer: Typing
/*
(event) => {
  if (event.code == 'Enter') {
    if (event.shiftKey) {
      if (!event.target.innerText.trim()) {
        event.target.innerText = '';
        return
      }
      this.sendMessage(event.target.innerText.trim());
      event.target.innerText = '';
    }
  }
}, false);
*/

// Add to the VueJS instance, to automatically update Messenger's 'time ago' texts
function ready() {
  var self = this;
  setInterval(function () {
     console.log('updating ticker')
     self.$data.now = Date.now()
  }, 1000)
}
