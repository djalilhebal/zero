class Profile {
  /**
   * Create new profile.
   *
   * @param {ZeroProfile} obj
   */
  constructor(obj) {
    this.id = obj.id;
    this.name = obj.name;
    this.username = Profile.formatUsername(obj.username);
  }

  /**
   * @todo toLowerCase it
   * @param {string?} str - Raw username
   * @returns {string}
   */
  static formatUsername(str) {
    if (!str) {
      return '';
    } else if (str.startsWith('@')) {
      return str;
    } else if (str.startsWith('/')) {
      return str.replace('/', '@');
    } else {
      return '@' + str;
    }
  }

  /** @param {Object} obj */
  static postprocessProfile(obj) {
    let {id} =  Conversation.parseLink(obj.messageLink)
    const username = obj.username || Conversation.parseLink(obj._pageLink).username || ''
    const isMoi = !!obj.myId
    id =  isMoi? obj.myId : id

    delete obj.myId
    obj.id = id
    obj.isMoi = isMoi
    obj.username = username
  }

  /**
   * @param {?string} id
   * @returns {Object}
   */
  static async getUserInfo(id) {
    const job = {url: Profile.getLinkToProfile(id), fn: 'getProfileInfo'}
    const res = await (new Master(job)).getResponse()
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
      result = `${Messenger.origin}/profile.php`
    } else if (id.startsWith('@')) {
      result = `${Messenger.origin}/${id.slice(1)}`
    } else {
      result = `${Messenger.origin}/profile.php?id=${id}`
    }
    if (info) result += '?v=info'
    return result
  }

}

class User extends Profile {
  constructor(obj) {
    super(obj); // handles id, name, username
    this.alternativeName = obj.alternativeName
    this.isFriend = !!obj.unfriendLink
    this.hasGreenDot = obj.hasGreenDot
    this.hasGreenDotDate = obj._pageDate
    this.statusText = ''
    this.statusTextDate = -Infinity
  }

  isActive() {
    const TWO_MINUTES = 2 * 60 * 1000;
    const now = Date.now();
    const fromGreenDot = this.statusTextDate - now < TWO_MINUTES
    const fromStatusText = this.hasGreenDotDate - now < TWO_MINUTES
    const statusTextMeansActive = this.meansActive(this.statusText)
    return fromGreenDot || (statusTextMeansActive && fromStatusText)
  }
  
  /**
   * Even if user doesn't have green dot, their status text
   * can indicate whether they're active.
   * @example
   * meansActive('active 37 seconds ago') === true
   *
   * @todo add more conditions
   * @param {string} str - activeText string
   * @returns {boolean}
   */
  meansActive(str) {
    // active now, few seconds ago, a minute ago
    return str === 'active now' ||
      str.endsWith('seconds ago') || // 'active 37 seconds ago'
      str.endsWith('a minute ago'); // 'active about a minute ago'
  }
  
  /**
   * Updates user's status (active or inactive)
   * Input can come from `profile`, `buddylist`, `conversation`, or `threads`
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
    super(obj)
    this.fanLink = obj.fanLink
    this.isFan = Messenger.hasParam(this.fanLink, 'unfan')
  }
}
