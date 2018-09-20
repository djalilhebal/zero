class Message {
  constructor(senderName, senderHref, text, footer) {
    const parsedHref = Zero.parseChatLink(senderHref)
    this.text = this.formatText(text);
    this.sender = parsedHref.id || '@' + parsedHref.username;
    this.senderName = senderName;
    this.footer = footer;
  }
  
  formatText(text) {
    /// TODO handle stickers and emoticons
    return text.trim()
  }
  
}

/*
Chat {
  id: number
  zeroChats: array
  name: string
  isGroup: boolean
  participants: array
  lastSeenMessage: number
}
*/
class Chat {
  constructor (obj) {
    if (!obj || obj._type !== 'chat') {
      console.error(obj)
      throw Error("Expected obj._type === 'chat' ")
    }

    this.id = obj.id;
    this.name = null;
    this.zeroChats = [obj];
    this.newest = obj;
    this.isGroup = obj.isGroup;
    this.participants = []
    this.lastSeenMessage = null;
  }

  update (obj) {
    if (obj && obj._type === 'chat') {
      this.zeroChats.push(obj);
      if (!obj.lastTimestamp && !obj.firstTimestamp && obj._pageDate > this.newest._pageDate) {
        this.newest = obj;
      }
    }
  }
  
  getNewestZeroChat () {
    return this.newest;
  }
  
  getMessages() {
    const withLastTimestamp = this.zeroChats.filter(x => x.lastTimestamp)
    withLastTimestamp.sort( (a, b) => a.lastTimestamp - b.lastTimestamp)
    const messages = withLastTimestamp.reduce((all, chat) => all.concat(chat.messages), [])
    return messages.concat(this.getNewestZeroChat().messages);
  }
}
