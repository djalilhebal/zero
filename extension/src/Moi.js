class Moi extends User {
  /**
   * @param {Object} info
   */
  constructor(info) {
    super(info)
    this.status = null
    this.togglePresenceLink = ''
    this.updateToggleLink()
  }

  async updateToggleLink() {
    const val = await this.getTogglePresenceLink()
    if (Messenger.isValidLink(val)) {
      this.togglePresenceLink = val
      this.status = this.getStatus()
    }
  }

  /**
   * The togglePresenceLink changes expectedly, we need to get it each time
   * @returns {string}
   */
  async getTogglePresenceLink() {
    const buddyLink  = `${Messenger.origin}/buddylist.php`
    const statusBase = `${Messenger.origin}/active_status.php`
    const toggleBase = `${Messenger.origin}/chat/a/presence.php`
    try {
      let job = { url: buddyLink, fn: 'getLink', args: [statusBase], once: false }
      const w = new Master(job)
      const statusLink = (await w.getResponse()).value

      w.setJob({ url: statusLink, fn: 'getLink', args: [toggleBase], once: true })
      const toggleLink = (await w.getResponse()).value

      return toggleLink
    } catch (e) {
      console.error('getTogglePresenceLink', e)
      return ''
    }
  }

  static async getInfo() {
    return await Profile.getUserInfo()
  }

  /**
   * Some links are of the form 0.facebook.com/messages/read/?tid=cid.c.<X>:<Y>
   * My id can be either <X> or <Y>.
   * At any rate, return their id, not mine
   *
   * @param {string} link
   * @returns {string} user id
   */
  getTheirId(link) {
    let {id, id2} =  Conversation.parseLink(link)
    if (id2) {
      id = [id, id2].find( x => x !== this.id)
    }
    return id
  }

  /**
   * Parse presence toggling link to know whether we're active or not.
   *
   * if the link contains the param `online=1`, then our status is `off`
   * and the link is used to turn it `on`.
   * Otherwise, our status is `on` and the link is to switch it `off`.
   *
   * @returns {boolean}
   */
  getStatus() {
    const link = this.togglePresenceLink
    if (!link) {
      return null
    } else {
      return (new URL(link)).searchParams.get('online') !== '1'
    }
  }

  /**
   * Change my public status
   * @param {boolean} active
   */
  async setStatus(active) {
    if (this.getStatus() === active) {
      return;
    } else {
      const w = new Master({fn: 'getError', url: this.togglePresenceLink, reloads: true})
      await w.getResponse()
      await this.updateToggleLink()
    }
  }

  /**
   * Return an array of contacts in my "buddy list"
   * @todo if I'm not active, just return {}, as buddylist would be empty anyway
   * @returns {Object}
   */
  async getBuddylist() {
    const w = new Master({fn: 'getBuddylist', url: `${Messenger.origin}/buddylist.php`})
    const res = await w.getResponse()
    // now postprocess it a little
    res.contacts = res.value.map( (contact) => {
      contact.id = this.getTheirId(contact.threadLink)
      delete contact.threadLink
      return contact
    })
    delete res.value
    return res
  }

}
