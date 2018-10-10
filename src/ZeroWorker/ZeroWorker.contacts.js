/** @file ZeroWorker.contacts AKA 'buddylist' AKA 'chat' */

/**
 * Parses https://0.facebook.com/buddylist.php
 * @returns {Array<Object>}
 */
ZeroWorker.getBuddylist = function getBuddylist() {
  try {
    const $tables = document.querySelectorAll('#root div div div table')

    return Array
      .from($tables)
      .map( ($table) => {
        const [$name, $active] = $table.querySelectorAll('td')
        const name = $name.innerText
        const threadLink = $name.querySelector('a').href
        const isActive = $active.innerText === '●'

        return {name, threadLink, isActive}
      })

  } catch (e) {
    console.error(e)
    return []
  }
}

/**
 * @param {string} str - search query
 * @param {string} [type="people"] - people, pages
 * @returns {string}
 */
function getSearchLink(str, type = 'people') {
  return `${Zero.origin}/search/${type}/?q=${str}`
}
// {moreLink, Array<{name, link}>}

ZeroWorker.getGroupInfo = function getGroupInfo() {
  /// @todo
  const $nameInput = document.querySelector("form input[name=thread_name]")
  const groupName = $nameInput.value
  const participants = []
  const participantsCount = null // in case some of the participants are deactivated
  return {groupName, participants, participantsCount}
}
