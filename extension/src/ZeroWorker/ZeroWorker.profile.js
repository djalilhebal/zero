/** @file ZeroWorker.profile: Parse users and pages' information */

/** @returns {object} Profile's info */
ZeroWorker.getProfileInfo = function getProfileInfo() {

  /**
   * Gets user profile info attributes.
   *
   * @param {string} attr - 'Facebook', 'Gender', 'Mobile'
   * @param {boolean} lowerCase - Should lowerCase the attribute's value?
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

  /** @returns {string} A numerical string that represents the current user's id */
  function getMyId() {
    try {
      // "Activity Log" https://0.facebook.com/<MY_ID>/allactivity
      const rMyId = /^https\:\/\/0.facebook.com\/(\d+)\/allactivity/
      const myActivityLink = ZeroWorker.getLink(rMyId)
      const [, myId] = myActivityLink.match(rMyId)
      return myId
    } catch (e) {
      console.warn(e)
      return ''
    }
  }

  function getIsVerified() {
    // Also, it has the attribute role="img"
    const forUser = 'span[aria-label="Verified Profile"]'
    const forPage = 'span[aria-label="Verified Page"]'
    const $badge = document.querySelector(forUser) || document.querySelector(forPage)
    if ($badge) {
      $badge.remove()
      return true
    } else {
      return false
    }
  }
  
  function getHasGreenDot() {
    const greenClass = ZeroWorker.getClassName('{color:#6ba93e;}')
    const $greenDot = greenClass && document.querySelector(`span.${greenClass}`)
    if ($greenDot) {
      $greenDot.remove()
      return true
    } else {
      return false
    }
  }

  /** @returns {string} */
  function getAlternateName() {
    const $alternateName = document.querySelector('#objects_container strong .alternate_name')
    if ($alternateName) {
      const alternateName = $alternateName.innerText.slice(1, -1) // remove parenthesis
      $alternateName.remove()
      return alternateName
    } else {
      return ''
    }
  }

  /** @returns {string} */
  function getName() {
    const $name = document.querySelector('#objects_container strong')
    const name = $name.innerText
    return name
  }
  
  try {
    // Order is important: Removes $badge, $greenDot, and $alternateName, then gets name.
    const isVerified = getIsVerified()
    const hasGreenDot = getHasGreenDot()
    const alternateName = getAlternateName()
    const name = getName()
    // later parse this link to get `id`
    const messageLink = ZeroWorker.getLink('https://0.facebook.com/messages/thread/')
    const myId = getMyId()
    // on page profiles
    const pageMoreLink = ZeroWorker.getLink('https://0.facebook.com/pages/more')
    const toUnlike = 'https://0.facebook.com/a/profile.php?unfan&id='
    const toLike = 'https://0.facebook.com/a/profile.php?fan&id='
    const fanLink = ZeroWorker.getLink(toLike) || ZeroWorker.getLink(toUnlike)
    // on user profiles
    const username = getAttr('Facebook')
    const gender = getAttr('Gender')
    const mobile = getAttr('Mobile')
    const unfriendLink = ZeroWorker.getLink('https://0.facebook.com/removefriend.php?friend_id=')
    
    return {
      name, messageLink, pageMoreLink, myId, username, // required
      alternateName, hasGreenDot, fanLink, unfriendLink, // additional
      isVerified, gender, mobile, // unused
    }
    
  } catch(e) {
    console.error(e)
    return {error: e}
  }
}
