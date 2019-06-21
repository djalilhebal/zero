class Conversation {
  /**
   * @param {ZeroChat} obj 
   */
  constructor (obj) {
    if (!obj) {
      throw new Error('Expected obj')
    }

    this.name = obj.name
    this.id = obj.id || moi.getTheirId(obj._pageLink) // official
    this.participants = [] // official
    this.snippet = Message.formatText(obj.snippet) // official
    this.updatedTime = null // official
    this.messageCount = null // official
    this.unreadCount = null // official
    this.canReply = obj.canReply || null // official
    this.footer = obj.footer || ''

    this.isGroup = obj.isGroup
    this.messages = obj.messages || []
    this.outbox = []

    this.index = obj.index
    this._isUnread = obj.isUnread
    this._unreadCount = obj.unreadCount

    const latestMessage = this.getLatestMessage()
    this._latestMid = latestMessage && latestMessage.getLatestMid()
    this._obj = obj
  }

  mediafy(x) {
    const matched = x.text.match(ZeroFile.rZeroMedia);
    if (matched) {
      x.hidden = true;
      let [, id, partNum, partsCount, partData] = matched;
      //TODO Replace the ZeroPart with a message with attachements
      const old = this.messages.find( y => y instanceof ZeroFile && y.id === id);
      if (old) {
        old.addPart(partNum, partData);
      } else {
        const media = new ZeroFile({id, partsCount, mime: "image/*"});
        media.addPart(partNum, partData);
        this.messages.push(media);
      }
    }
  }

  /** @returns {Message} */
  getLatestMessage() {
    return this.messages.filter(x => x instanceof Message).slice(-1)[0];
  }

  async init() {
    if (this.messages.length)
      return;
    const {messages} = await Conversation.getChunk(this.id)
    this.messages = (messages || []).map(m => new Message(m))
    this.messages.forEach( message => this.mediafy(message))
    const latestMessage = this.getLatestMessage()
    this._latestMid = latestMessage && latestMessage.getLatestMid()
  }

  /** @returns {Promise<boolean>} */
  async isUpToDate() {
    if (!this._latestMid) {
      return false
    } else {
      const chunk = await Conversation.getChunk(this.id)
      const latestMessageId = chunk.messages.slice(-1)[0].getLatestMid()
      return latestMessageId === this._latestMid
    }
  }

  async update() {
    const isUpToDate = await this.isUpToDate()
    if (!isUpToDate) {
      const newMessages = await Conversation.getMessagesUntill(this.id, this._latestMid)
      this._latestMid = newMessages.slice(-1)[0].getLatestMid()
      this.messages = this.messages.concat(newMessages)
    }
  }

  /**
   * @param {ZeroThread} obj 
   * @returns {void}
   */
  updateFromThread(obj) {
    if (typeof obj === 'object') {
      this.snippet = Message.formatText(obj.snippet)
      this.footer = obj.footer
      this.index = obj.index
      this._isUnread = obj.isUnread
      this._unreadCount = obj.unreadCount
    }
  }

  /** @returns {number} */
  getUnreadCount() {
    if (this._unreadCount)
      return Number(this._unreadCount)
    else if (this._isUnread)
      return 1
    else
      return 0
  }

  /**
   * @todo Optimize it a little!! >_<
   */
  deduplicate() {
    this.messages.forEach( (messageA, i) => {
      this.messages.forEach( (messageB, j) => {
        if (i !== j && messageA.isContainedIn(messageB)) {
          this.copyAndDelete(i, j)
        }
      })
    })
  }

  /**
   * Can `this` be considered a subset of `x`?
   * @param {Message} x
   * @returns {boolean}
   */
  isContainedIn(x) {
    return this.mids.every(mid => x.mids.includes(mids) );
  }

  // Copy any userful information from index `i` to index `j`, then delete `i`
  copyAndDelete(i, j) {
    // For now, the only information we are interested in, is `createdTime`
    if (this.messages[i].createdTime) {
      this.messages[j].createdTime = this.messages[i].createdTime;
    }
    this.messages.splice(i, 1);
  }

  /**
   * @param {string} id - conversation id or link
   * @returns {Object}
   */
  static async getChunk(id) {
    const url = id.startsWith('http') ? id : Conversation.getChatLink(id)
    const job = {url, fn: 'getChunk'}
    const res = await (new Master(job)).getResponse()
    //Message.postprocessChunk(res)
    return res
  }

  /**
   * @param {string} id - Conversation id
   * @param {string} mid - Message id
   * @returns {Array<Message>}
   * @public
   */
  static async getMessagesUntill(id, mid) {
    const chunks = [];
    let chunk;
    let url = Conversation.getChatLink(id)
    do {
      chunk = await Conversation.getChunk(url)
      chunks.push(chunk)
      if (Message.chunkHasMid(chunk, mid) || !chunk.linkToOlder) {
        break
      } else {
        url = chunk.linkToOlder
      }
    } while (1);
    const messages = Message.mergeChunksAfter(chunks, mid)
    return messages
  }

  /**
   * @param {string} id
   * @return {string}
   */
  static getChatLink(id) {
    return `${Messenger.origin}/messages/read?fbid=${id}&show_delete_message_button=1`
  }

  /**
   * @param {string[]} ids - user ids
   * @returns {string}
   */
  static getNewGroupLink(ids = []) {
    const params = ids.map( (id, i) => `ids[${i}]=${id}` ).join('&')
    const url = `${Messenger.origin}/messages/compose/?${params}`
    return url
  }

  /**
   * @param {string} id
   * @returns {string}
   */
  static getGroupInfoLink(id) {
    return `${Messenger.origin}/messages/participants/?tid=cid.g.${id}`
  }

  /**
   * @param {string} folder - inbox, pending, other, spam
   * @returns {string}
   */
  static getThreadsLink(folder = 'inbox') {
      return `${Messenger.origin}/messages?folder=${folder}`
  }

  /** @returns {Promise<Object>} */
  static async getThreads() {
    const job = {fn: 'getThreads', url: Conversation.getThreadsLink()}
    const res = await (new Master(job)).getResponse()
    res.threads.forEach( (thread) => {
      thread.id = moi.getTheirId(thread.link)
    })
    return res
  }

  /**
   * Handles links of the forms:
   * - https://0.facebook.com/messages/read/?fbid=ID
   * - https://0.facebook.com/messages/read/?tid=cid.c.ID:MYID
   * - https://0.facebook.com/messages/read/?tid=cid.c.MYID
   * - https://0.facebook.com/messages/read/?tid=cid.g.ID
   * - https://0.facebook.com/messages/thread/ID
   * - https://0.facebook.com/USER.NAME
   *
   * @param {string} link
   * @returns {object} parsed link
   */
  static parseLink(link) {
    if (!link) return {}
    // "https://0.facebook.com/messages/read/?fbid=ID" > "messages/read/?fbid=ID"
    link = link.slice(Messenger.origin.length+1)

    const rFbid = /fbid=(\d+)/
    const rTidc = /tid=cid\.c\.(\d+)(%3A((\d+)))?/
    const rTidg = /tid=cid\.g\.(\d+)/
    const rThread = /^messages\/thread\/(\d+)/

    const [, id, , id2] = link.match(rFbid)  ||
                   link.match(rTidc)  ||
                   link.match(rTidg)  ||
                   link.match(rThread)||
                   [];

    const isGroup = rTidg.test(link)
    const [, firstTimestamp] = link.match(/first_message_timestamp=(\d+)/) || []
    const [, lastTimestamp] = link.match(/last_message_timestamp=(\d+)/) || []
    const [, username] = id ? [] : link.match(/^([\w\d\.]+)/) || []

    return { id, id2, username, firstTimestamp, lastTimestamp, isGroup }
  }

}
