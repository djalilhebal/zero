// ZeroMaster: use Promise.race(gotResponse, timeout)

// ZeroChat.handleLinks (to make them readable)
function generateHtml(rawText) {
  let escapedText = escape(rawText)
  escapedText = escapedText.replace(/%02(.+?)%03/g, unescape)
  const html = handleEmoticons(escaped)
  return html  
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
