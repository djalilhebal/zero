/** @file ZeroWorker.profile */

/** @returns {object} Profile's info */
ZeroWorker.getProfileInfo = function getProfileInfo() {

  /** @returns {boolean} Is it not a user's page? */
  function isPageProfile() {
    return !!document.querySelector('#pages_follow_action_id')
  }

  /**
   * Gets user profile info attributes.
   *
   * @param {string} attr - 'Facebook', 'Gender', 'Mobile'
   * @param {boolean} [lowerCase=true] - lower case the attribute's value?
   * @returns {string}
   */
  function getAttr(attr, lowerCase = true) {
    const $container = document.querySelector(`#root [title="${attr}"]`)
    if ($container) {
      let text = $container.innerText.trim()
      if (lowerCase) text = text.toLowerCase()
      const val = text.split('\n')[1]
      return val
    } else {
      return ''
    }
  }

  /** @returns {string} */
  function getUsername() {
    return getAttr('Facebook').slice(1)
  }

  /** @returns {string} link to start conversation with this profile */
  function getMessageLink() {
    return ZeroWorker.getLink('https://0.facebook.com/messages/thread/')
  }

  /** @returns {string} My link to log out */
  function getMyLogoutLink() {
    return ZeroWorker.getLink('https://0.facebook.com/logout.php')
  }

  /** @returns {string} A numerical string represents the current user's id */
  function getMyId() {
    try {
      // "Activity Log" https://0.facebook.com/ID/allactivity
      const rMyId = /^https\:\/\/0.facebook.com\/(\d+)\/allactivity/
      const $elements = Array.from(document.querySelectorAll('#root a'))
      const link = $elements.find(el => rMyId.test(el.href)).href
      const [, myId] = link.match(rMyId)
      return myId
    } catch (e) {
      // console.warn(e)
      return ''
    }
  }

  /** @returns {string} alternative name */
  function getAltName($nameSection) {
    const $altName = $nameSection.querySelector('.alternate_name')
    if ($altName) {
      const altName = $altName.innerText.slice(1, -1) // remove parenthesis
      $altName.remove() // remove it so that it won't end up in `name`
      return altName
    } else {
      return ''
    }
  }

  function parseNameSection() {
    const $nameSection = document.querySelector('#objects_container strong')
    if ($nameSection) {
      const altName = getAltName($nameSection)
      const name = $nameSection.innerText
      const isActive = !!$nameSection.nextSibling // Green dot exists?
      return {name, altName, isActive}
    } else {
      return {}
    }
  }

  try {
    const {name, altName, isActive} = parseNameSection()
    const messageLink = getMessageLink() // later parse this link to get `id`
    const myId = getMyId()
    const myLogoutLink = getMyLogoutLink()
    const isPage = isPageProfile()
    const username = getUsername()
    const gender = getAttr('Gender')
    const mobile = getAttr('Mobile')
    return {
      name, messageLink, isPage, myId, myLogoutLink, // required
      username, isActive, gender, altName, mobile, // additional
    }
  } catch(e) {
    console.error(e)
    return {error: e}
  }
}
