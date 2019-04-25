/** @file ZeroWorker.contacts AKA 'buddylist' AKA 'chat' */

/**
 * Parses https://0.facebook.com/buddylist.php
 * @todo return {moreLink, Array<{name, link}>}
 *
 * @returns {Array<Object>}
 */
ZeroWorker.getBuddylist = function getBuddylist() {
  const $tables = document.querySelectorAll('#root div div div table')
  try {

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
 * Collects and returns the chat group's info.
 * @todo Complete it
 * @returns {Object}
 */
ZeroWorker.getGroupInfo = function getGroupInfo() {
  const $nameInput = document.querySelector("form input[name=thread_name]")
  const groupName = $nameInput.value
  const participants = []
  const participantsCount = null // in case some of the participants are deactivated
  return {groupName, participants, participantsCount}
}
