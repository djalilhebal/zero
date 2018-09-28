class Profile {
  /**
   * Create new profile.
   * @example
   * const a = new Profile({id: '123', name: 'Wanis Rowdy', username: '@wanis.rowdy'})
   * const b = new Profile({id: '42', name: 'الباحثون المسلمون', username: '@muslim.researchers'})
   *
   * @param {Object} obj
   * @param {string} obj.id
   * @param {string} obj.name
   * @param {string} obj.username
   */
  constructor(obj) {
    this.id = obj.id
    this.name = obj.name
    this.username = (obj.username || '').toLowerCase()
  }
  
  /** @param {Object} obj */
  static postprocessProfile(obj) {
    let {id} =  Conversation.parseLink(obj.messageLink)
    const username = obj.username || Conversation.parseLink(obj._pageLink).username || ''
    const isMe = !!obj.myId
    id =  isMe? obj.myId : id

    delete obj.myId
    obj.id = id
    obj.isMe = isMe
    obj.username = username
  }
  
  /**
   * @param {?string} id
   * @returns {Object}
   */
  static async getUserInfo(id) {
    const job = {url: Profile.getLinkToProfile(id), fn: 'getProfileInfo'}
    const res = await (new Worker(job)).getResponse()
    Profile.postprocessProfile(res)
    return res
  }
  
  /**
   * @param {?string} id - user id or username or null
   * @param {boolean} [info=true] - Go to info page? (Only for users)
   * @returns {string}
   */
  static getLinkToProfile(id, info = true) {
    let result;
    if (!id) {
      result = `${Zero.origin}/profile.php`
    } else if (id.startsWith('@')) {
      result = `${Zero.origin}/${id.slice(1)}`
    } else {
      result = `${Zero.origin}/profile.php?id=${id}`
    }
    if (info) result += '?v=info'
    return result
  }

}

class User extends Profile {
  constructor(obj) {
    super(obj); // handles id, name, username

    this.altName = obj.altName
    this.isActive = obj.isActive
    this.activeText = ''
    this.activeDate = obj.isActive? obj._pageDate : null
    this.lastChecked = obj._pageDate
  }
  
  /**
   * Updates user's status (active or inactive)
   * Input can come from `profile`, `buddylist`, `conversation`, `threads`
   *
   * @param {object} obj
   * @param {boolean} obj.isActive
   * @param {number} obj._pageDate
   * @param {?string} obj.activeText
   */
  updateStatus(obj) {
    if (obj && obj.isActive && obj._pageDate &&
        obj._pageDate > this.lastChecked) {
      this.lastChecked = obj._pageDate
      this.isActive = obj.isActive
      if (obj.isActive) this.activeDate = obj._pageDate
      if (obj.activeText) this.activeText = obj.activeText
    }
  }

}

class Page extends Profile {
  constructor(obj) {
    super(obj);
  }
}
