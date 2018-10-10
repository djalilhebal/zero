// ZeroChat.handleLinks (to make them readable)
function generateHtml(rawText) {
  let escapedText = escape(rawText)
  escapedText = escapedText.replace(/%01(.+?)%02/g, unescape)
  const html = handleEmoticons(escaped)
  return html  
}

async function isSent() {
  w.setJob( {'fn': 'getError'})
  const res = await w.getResponse()
  return res && res._pageLink.searchParams.get('request_type') === 'send_success'
}

/**
 * on User and Message
 * @returns {string}
 */
function getActiveDateStr() {
  const timestamp = this.timestamp
  return new Date(timestamp).toISOString()
}

resend() {
  getLatestChunk().lastMessage.content === this.content && isMine? Already sent  
}

//Message.status: fetched, sent, sending, failed
Composer/Message.RTL

// todo: assumption: "0" won't be sent or received
