// status & sent & resend
// isMine

class Message {
  /**
   * @param {Object} info
   */
  constructor(info) {
    const {senderName, senderLink, deleteLink, text, footer} = info
    const parsedLink = Conversation.parseLink(senderLink)
    this.text = TextMessage.formatText(text)
    this.sender = parsedLink.id || '@' + parsedLink.username;
    this.senderName = senderName;
    this.footer = footer;
    this.createdTime = null; // official
    this.mids = Message.parseDeleteLink(deleteLink).mids
    this._info = info
  }

  getLatestMid() {
    return this.mids.slice(-1)[0]
  }

  /**
   * @param {Array<Object>} chunks
   * @param {string} mid
   * @returns {Array<Message>}
   */
  static mergeChunksAfter(chunks, mid) {
    const messages = []
    chunks.reverse()
    for (const chunk of chunks) {
      chunk.messages.reverse();
      for (const message of chunk.messages) {
        if (message.mids.includes(mid)) {
          if (message.mids.indexOf(mid) !== message.mids.length - 1) {
            messages.push(message)
          }
          messages.reverse()
          return messages;
        } else {
          messages.push(message)
        }
      }
    }
    messages.reverse()
    return messages
  }

  /**
   * @param {Object} chunk
   * @param {string} mid
   * @returns {boolean}
   */
  static chunkHasMid(chunk, mid) {
    return chunk.messages.some( message => message.mids.includes(mid))
  }

  /**
   * @param {string} link
   * @returns {Object} - message ids and maybe other stuff
   */
  static parseDeleteLink(link) {
    try {
      const reformatted = link.replace(/%24/g, '$').replace(/mid\.$/g, '').replace(/%2C/g, ',')
      const mids = (new URL(reformatted)).searchParams.get('mids').split(',')
      return {mids}
    } catch (e) {
      console.error(e)
      return {error: e}
    }
  }

}
