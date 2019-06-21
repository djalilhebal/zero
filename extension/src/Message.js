class Message {
  /**
   * @param {ZeroMessage} info
   */
  constructor(info) {
    this._info = info; // Save the "raw obj" for debugguing maybe

    const {senderName, senderLink, deleteLink, text, footer} = info;
    const parsedLink = Conversation.parseLink(senderLink);
    this.text = Message.formatText(text);
    this.sender = parsedLink.id || Profile.formatUsername(parsedLink.username);
    this.senderName = senderName;
    this.footer = footer;
    this.mids = Message.parseDeleteLink(deleteLink).mids;
    /** @type {number?} */
    this.createdTime = null; // official
    /** @type {Array<ZeroFile>} */
    this.attachments = [];
    this.hidden = false;
  }

  /**
   * Sends a text message.
   *
   * @param {string} id - Conversation id
   * @param {string} text
   */
  static async send(id, text) {
    const url = Conversation.getChatLink(id);
    const job = {url, fn: 'sendText', args: [text], reloads: true};
    const res = await (new Master(job)).getResponse();
    return res;
  }

  /**
   * Was the message successfully sent?
   * True if we were redirected to a page that has '?request_type=send_success'
   * @todo MAKE IT WORK
   * @param {Master} w - the Worker that was used to send the message
   * @returns {Promise<boolean>}
   */
  async isSent(w) {
    w.setJob({'fn': 'getError'});
    const res = await w.getResponse();
    return res && res._pageLink.searchParams.get('request_type') === 'send_success';
  }

  /**
   * @todo MAKE IT WORK
   * @todo Add option 'autoResend' (to resend(...) or send(...))
  resend() {
    const latest = Conversation.getLatestChunk().getLastMessage;
    const alreadySent = latest.isMine && latest.text === this.text;
    if (alreadySent) {
      return; // do nothing
    } else {
      Message.send(this.cid, this.text);
    }
  }
   */

  getLatestMid() {
    return this.mids.slice(-1)[0]
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
   */
  static formatText(text) {
    if (typeof text === 'string') {
      return Message.handleEmoticons(text).replace(/\u00AD/g, '').trim()
    } else {
      return ''
    }
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

  /**
   * @param {string} specialText
   * @returns {string}
   */
  static handleEmoticons(specialText) {
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
      'kiss': ':*',
      'heart': '<3',
      'kiki': '^_^',
      'crying': 'T_T',
      'expressionless': '-_-',
      'persevere': '>_<',
      'upset': '>:O',
      'glasses': 'B-)',
      'devil': '3:)',
      'angel': 'O:)',
      'like': '(y)',
      'penguin': '<(")',
      'poop': ':poop:',
      // Not working on 0.facebook.com/messages/
      'pacman': ':v',
      'confused': 'o.O',
      'confused reverse': 'O.o',
    }

    return specialText.replace(/\x02([a-z]+):(.+?)\x03/g, (specialPart) => {
      const [type, ...vals] = specialText.slice(1, -1).split(':');
      const val = vals.join(':'); // needed to handle urls
      if (type === 'emoji') {
        // val = 'kiki emoticon'
        // code = 'kiki'
        // return '^_^'
        const code = val.slice(0, -1 - 'emoticon'.length);
        return emoticonsMap[code] || specialPart;
      }
      else if (type === 'emoticon') {
        const url = val;
        const img = `<i class="emo" style="background-image:url(${url})"></i>`;
        return img;
      }
      else {
        return specialPart;
      }
    })
  }

  /**
   * @todo Move it to Conversation?
   *
   * @param {Object} chunk
   * @param {string} mid
   * @returns {boolean}
   */
  static chunkHasMid(chunk, mid) {
    return chunk.messages.some( message => message.mids.includes(mid))
  }

  /**
   * @todo Move it to Conversation?
   *
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

}
