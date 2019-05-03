/**
 * Parse chat threads in `/messages/`
 * @returns {ThreadsChunk}
 */
ZeroWorker.getThreads = function getThreads() {

  // IFF there are unread messages, there will be this CSS rule:
  const boldClass = ZeroWorker.getClassName('{font-weight:bold;}')
  const hasBoldClass = (list) => !!boldClass && list.contains(boldClass)

  function parseThreads() {
    const threadsTables = Array.from(document.querySelectorAll('table.br'))
    if (!threadsTables.length) {
      throw new Error('Thread tables not found')
    }
    
    const threads = threadsTables.map( ($table, i) => {

      try {
        return parseThread(i, $table)
      } catch (e) {
        console.error(e)
        return undefined
      }
      
    }).filter(thread => !!thread)
    
    return threads
  }
  
  /**
   * @param {number} index - Index in the current page (as in, it's relative)
   * @param {Element} $table
   * @returns {ZeroThread}
   */
  function parseThread(index, $table) {
    // $title, $content, and $footer elements
    const $h3s = $table.querySelectorAll('h3')
    if ($h3s.length !== 3) {
      throw new Error('Expected 3 <h3> elements')
    }
    const [$title, $content, $footer] = Array.from($h3s) // TS complains about `...$h3s`
    const rawName = $title.querySelector('a').innerText
    const link = $title.querySelector('a').href

    const {name, unreadCount} = parseThreadTitle(rawName)
    ZeroWorker.textify($content)
    const snippet = $content.innerText
    const footer = $footer.innerText
    const isUnread = hasBoldClass($title.classList)
    const hasGreenDot = !!$title.querySelector('span') // Thread has the green dot?
    
    return { link, name, index, snippet, footer, hasGreenDot, isUnread, unreadCount }
  }
  
  /**
   * @example
   *  parseThreadTitle("Nikola Lewinski (3)●")
   * // { name: "Nikola Lewinski", isActive: true, unreadCount: "3" }
   *
   * @example
   *  parseThreadTitle("Resto 6 o'clock")
   * // { name: "Resto 6 o'clock", isActive: false, unreadCount: undefined }
   *
   * @param {string} str
   * @returns {Object}
   **/
  function parseThreadTitle(str = '') {
    const rCount = /\((\d+)\)$/
    const isActive = /●$/.test(str)
    str = str.replace(/●$/, '')
    const [, unreadCount] = str.match(rCount) || []
    str = str.replace(rCount, '')
    const name = str.trim()

    return { name, isActive, unreadCount }
  }

  function getLinkToOlder() {
    return ZeroWorker.getHref(document.querySelector('#see_older_threads a'))
  }

  function getLinkToNewer() {
    return ZeroWorker.getHref(document.querySelector('#see_newer_threads a'))
  }
  
  return {
    threads: parseThreads(),
    linkToOlder: getLinkToOlder(),
    linkToNewer: getLinkToNewer(),
  }

}
