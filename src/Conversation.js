class Conversation {
  constructor (obj) {
    if (!obj) {
      throw new Error('Expected obj')
    }

    this.name = obj.name
    this.id = moi.getTheirId(obj._pageLink) // official
    this.participants = [] // official
    this.snippet = obj.snippet || '' // official
    this.updatedTime = null // official
    this.messageCount = null // official
    this.unreadCount = null // official
    this.canReply = obj.canReply || null // official

    this.isGroup = obj.isGroup
    this.messages = obj.messages || []
    this.outbox = []

    this._isUnread = obj.isUnread
    this._unreadCount = obj.unreadCount

    const latestMessage = this.messages.slice(-1)[0]
    this._latestMid = latestMessage && latestMessage.mids.slice(-1)[0]
  }

  async init() {
    const {messages} = await Conversation.getChunk(this.id)
    this.messages = messages || []
    const latestMessage = this.messages.slice(-1)[0]
    this._latestMid = latestMessage && latestMessage.mids.slice(-1)[0]
  }
  
  /** @returns {boolean} */
  async isUpToDate() {
    if (!this._latestMid) {
      return false
    } else {
      const chunk = await Conversation.getChunk(this.id)
      const latestMessageId = chunk.messages.slice(-1)[0].mids.slice(-1)[0]
      return latestMessageId === this._latestMid
    }
  }
  
  async update() {
    const isUpToDate = await this.isUpToDate()
    if (!isUpToDate) {
      const newMessages = await Conversation.getMessagesUntill(this.id, this._latestMid)
      this._latestMid = newMessages.slice(-1)[0].mids.slice(-1)[0]
      this.messages = this.messages.concat(newMessages)
    }
  }

  updateFrom(obj) {
    if (obj) {
      this.snippet = obj.snippet
      this._unreadCount = obj._unreadCount
      this._isUnread = obj._isUnread
    }
  }
  
  /**
   * @returns {number}
   * @public
   */
  getUnreadCount() {
    if (this._unreadCount)
      return Number(this._unreadCount)
    else if (this._isUnread)
      return 1
    else
      return 0
  }
  
  /**
   * Sends a text message.
   *
   * @param {string} id - Conversation id
   * @param {string} text
   */
  static async sendText(id, text) {
    const url = Conversation.getLinkToChat(id)
    const job = {url, fn: 'sendText', args: [text], reloads: true}
    const res = await (new Worker(job)).getResponse()
    return res
  }
  
  /**
   * @param {string} id - conversation id or link
   * @returns {Object}
   */
  static async getChunk(id) {
    const url = id.startsWith('http') ? id : Conversation.getLinkToChat(id)
    const job = {url, fn: 'getChunk'}
    const res = await (new Worker(job)).getResponse()
    Message.postprocessChunk(res)
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
    let url = Conversation.getLinkToChat(id)
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
  static getLinkToChat(id) {
    return `${Zero.origin}/messages/read?fbid=${id}&show_delete_message_button=1`
  }
  
  /**
   * @param {string[]} ids - user ids
   * @returns {string}
   */
  static getLinkToNewGroup(ids = []) {
    const params = ids.map( (id, i) => `ids[${i}]=${id}` ).join('&')
    const url = `${Zero.origin}/messages/compose/?${params}`
    return url
  }
  
  /**
   * @param {string} id
   * @returns {string}
   */
  static getLinkToGroupInfo(id) {
    return `${Zero.origin}/messages/participants/?tid=cid.g.${id}`
  }

  /**
   * @param {?string} folder - inbox, pending, other, spam
   * @returns {string}
   */
  static getLinkToThreads(folder = 'inbox') {
      return `${Zero.origin}/messages?folder=${folder}`
  }
  
  /** @returns {Object} */
  static async getThreads() {
    const job = {fn: 'getThreads', url: Thread.getLinkToThreads()}
    const res = await (new Worker(job)).getResponse()
    return res
  }

  /**
   * Handles links of the forms:
   * - https://0.facebook.com/messages/read/?fbid=ID
   * - https://0.facebook.com/messages/read/?tid=cid.c.ID:MYID
   * - https://0.facebook.com/messages/read/?tid=cid.g.ID
   * - https://0.facebook.com/messages/thread/ID
   * - https://0.facebook.com/USER.NAME
   *
   * @param {string} link
   * @returns {object} parsed link
   */
  static parseLink(link) {
    // "https://0.facebook.com/messages/read/?fbid=ID" > "messages/read/?fbid=ID"
    link = link.slice(Zero.origin.length+1)

    const rFbid = /fbid=(\d+)/
    const rTidc = /tid=cid\.c\.(\d+)%3A(\d+)/
    const rTidg = /tid=cid\.g\.(\d+)/
    const rThread = /^messages\/thread\/(\d+)/  
    
    const [, id, id2] = link.match(rFbid)  ||
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
