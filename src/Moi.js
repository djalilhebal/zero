class Moi extends User {
  /**
   * @param {Object} info
   */
  constructor(info) {
    super(info)
    this.togglePresenceLink = ''
  }

  async update() {
    this.togglePresenceLink = await Moi.getTogglePresenceLink()
  }

  static async getInfo() {
    return await Profile.getUserInfo()
  }
  
  /**
   * Some links are of the form 0.facebook.com/messages/read/?tid=cid.c.<X>:<Y>
   * My id can be either <X> or <Y>
   * At any rate, return their id, not mine
   *
   * @param {string} link
   * @returns {string} user id
   */
  getTheirId(link) {
    let {id, id2} =  Conversation.parseLink(link)
    if (id2) {
      id = [id, id2].find( x => x !== moi.id)
    }
    return id
  }
  
  /**
   * Return a list of contacts in my "buddy list"
   *
   * @returns {Array<Object>}
   */
  async getContacts() {
    const w = new Worker({fn: 'getContacts', url: 'https://0.facebook.com/buddylist.php'})
    const res = await w.getResponse()
    const contacts = res.value
    return contacts.map( (contact) => {
      contact.id = this.getTheirId(contact.threadLink)
      return contact
    })
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
    return link && (new URL(link)).searchParams.get('online') !== '1'
  }

  /**
   * @param {boolean} active
   */
  async setStatus(active) {
    if (this.getStatus() === active) {
      return;
    } else {
      const w = new Worker({fn: 'getError', url: this.togglePresenceLink})
      await w.getResponse()
      await this.update()
    }
  }
  
  /**
   * The togglePresenceLink changes unexpectedly, we need to get it each time
   * @returns {string}
   */
  static async getTogglePresenceLink() {
    const buddyLink = 'https://0.facebook.com/buddylist.php'
    const statusBase = 'https://0.facebook.com/active_status.php'
    const toggleBase = 'https://0.facebook.com/chat/a/presence.php'
    try {
      let job = { url: buddyLink, fn: 'getLink', args: [statusBase], once: false }
      const w = new Worker(job)
      const statusLink = (await w.getResponse()).value

      w.setJob({ url: statusLink, fn: 'getLink', args: [toggleBase], once: true })
      const toggleLink = (await w.getResponse()).value

      return toggleLink
    } catch (e) {
      console.error(e)
      return ''
    }
  }

}
