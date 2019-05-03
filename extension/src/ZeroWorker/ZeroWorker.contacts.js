/**
 * Parse contacts list AKA 'buddylist' https://0.facebook.com/buddylist.php
 * @todo Add a `seeMoreLink` prop that points to the next page.
 * @returns {ZeroBuddylist | ZeroError}
 */
ZeroWorker.getBuddylist = function getBuddylist() {
  try {
    const $tables = document.querySelectorAll('#root div div div table')
    const contacts = Array
      .from($tables)
      .map( ($table) => {
        const [$name, $active] = $table.querySelectorAll('td')
        const name = $name.innerText
        const threadLink = $name.querySelector('a').href
        const hasGreenDot = $active.innerText === '●'

        return {name, threadLink, hasGreenDot}
      })
    return { contacts }
  } catch (e) {
    return {error: e}
  }
}

/**
 * Collects and returns the chat group's info.
 * @todo Complete it
 * @todo Move it to ZeroWorker.conversation.js? (not that it matters)
 * @returns {Object}
 */
ZeroWorker.getGroupInfo = function getGroupInfo() {
  const $nameInput = document.querySelector("form input[name=thread_name]")
  const groupName = $nameInput.value
  // Why not just use `participants.length`? Some of them may be deactivated.
  const participantsCount = -1 // TODO Just get it from the page
  const participants = [] // TODO Parse page to an Array<{name: string, link: string}>
  return {groupName, participants, participantsCount}
}
