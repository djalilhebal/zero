class ZeroDatabase {
  constructor() {
    this.profiles = {};
    this.chats = {};
    this.media = {};
    this._usernamesMap = {}
  }
  
  resolveUsername (str) {
    if (this._usernamesMap[str])
      return this._usernamesMap[str]
    else
      return null
  }
  
  update (obj) {
    if (!obj || !obj._type) return;
    
    if (obj._type === 'profile') {
      this.updateProfile(obj)
    }
    else if (obj._type === 'chat') {
      this.updateChat(obj)
    }
  }
  
  updateProfile (x) {
    if (!this.profiles[x.id])
      this.profiles[x.id] = new Profile(x)
    else
      this.profiles[x.id].update(x)
    
    if (x.username && x.id)
      this._usernamesMap[x.username] = x.id

  }

  updateChat (x) {
    if (!this.chats[x.id])
      this.chats[x.id] = new Chat(x)
    else
      this.chats[x.id].update(x)
  }

}
