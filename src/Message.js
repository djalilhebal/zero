// todo get latest mid
// deduplicate messages
// status & sent & resend
class Message {
  /**
   * @param {Object} info
   */
  constructor(info) {
    const {senderName, senderLink, deleteLink, text, footer} = info
    const parsedLink = Conversation.parseLink(senderLink)
    this.text = this.formatText(text)
    this.sender = parsedLink.id || parsedLink.username;
    this.senderName = senderName;
    this.footer = footer;
    this.createdTime = null; // official
    this.mids = Message.parseDeleteLink(deleteLink).mids
    this._info = info
  }
  
  /**
   * @param {string} input
   * @returns {string}
   */
  handleEmoticons(input) {
    const emoticonsMap = {
      'slightsmile': ':)',
      'slightgrin': ':D',
      'tongue': ':p',
      'frown': ':(',
      'gasp': ':O',
      'wink': ';)',
      'grumpy': '>:(',
      'unsure': ':/',
      'cry': ":'(",
      'devil': '3:)',
      'angel': 'O:)',
      'kiss': ':*',
      'heart': '<3',
      'kiki': '^_^',
      'expressionless': '-_-',
      'persevere': '>.<',
      'upset': '>:O',
      'glasses':  'B-)',
      'like': '(y)',
      'penguin': '<(")',
      'poop': ':poop:',
      // Not working on 0.facebook.com/messages/
      'pacman': ':v',
      'confused': 'o.O',
      'confused reverse': 'O.o',
      'shark': '(^^^)',
      'robot': ':|]',
      'colon three': ':3',
    }

    let result = ''
    
    result = input.replace(/\001(url.+?)\002/g, (specialUrl) => {
      // url("https://z-m-static.xx.fbcdn.net/images/emoji.php/v9/z3a/1/16/1f34c.png")
      const url = specialText.slice(6, 3) // https://z-m-static.xx.fbcdn.net/...png
      const img = `<i class="emo" style="background-image:url(${url})"></i>`
      return img
    })  

    result = result.replace(/\001(.+?)\002/g, (specialText) => {
      // `kiki emoticon` -> `kiki`
      const name = specialText.slice(1, -2 - 'emoticon'.length)
      return emoticonsMap[name] || specialText
    })
    
    return result
  }

  /**
   * Make the text suitable for display
   *
   * @example
   * formatText('This shit kinda works kiki emoticon\n')
   * // returns: 'This shit kinda works ^_^'
   *
   * @param {string} text - raw text
   * @returns {string} - formatted text
   * @private
   */
  formatText(text) {
    return this.handleEmoticons(text).trim()
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
   * @returns {Object} - message ids
   */
  static parseDeleteLink(link) {
    try {
      const reformatted = link.replace(/%24/g, '$').replace(/mid\.$/g, '').replace(/%2C/g, ',')
      const params = (new URL(reformatted)).searchParams
      const mids = params.get('mids').split(',')
      return {mids}
    } catch (e) {
      console.error(e)
      return {}
    }
  }
  
}
