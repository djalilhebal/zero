class TextMessage extends Message {
  constructor(obj) {
    super(obj);
    this.hidden = false;
  }

  /**
   * Sends a text message.
   *
   * @param {string} id - Conversation id
   * @param {string} text
   */
  static async send(id, text) {
    const url = Conversation.getLinkToChat(id)
    const job = {url, fn: 'sendText', args: [text], reloads: true}
    const res = await (new Master(job)).getResponse()
    return res
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
      return TextMessage.handleEmoticons(text).replace(/\u00AD/g, '').trim()
    } else {
      return ''
    }
  }

  /**
   * @param {string} input
   * @returns {string}
   */
  static handleEmoticons(input) {
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
      'persevere': '>_<',
      'upset': '>:O',
      'glasses': 'B-)',
      'like': '(y)',
      'penguin': '<(")',
      'poop': ':poop:',
      // Not working on 0.facebook.com/messages/
      'pacman': ':v',
      'confused': 'o.O',
      'confused reverse': 'O.o',
      'shark': '(^^^)',
      'robot': ':|]',
    }

    return input.replace(/\001([a-z]+):(.+?)\002/g, (specialText) => {
      let [type, ...val] = specialText.slice(1, -1).split(':')
      if (type === 'emoji') {
        // val = ['kiki emoticon']
        // code = 'kiki'
        // return '^_^'
        const code = val[0].slice(0, -1 - 'emoticon'.length)
        return emoticonsMap[code] || specialText
      }
      else if (type === 'emoticon') {
        const url = val.join(':');
        const img = `<i class="emo" style="background-image:url(${url})"></i>`
        return img
      }
      else {
        return specialText
      }
    })
  }

}
