/** @file ZeroWorker.threads */

ZeroWorker.getThreads = function getThreads() {

  // IFF there are unread messages, there will be this CSS rule:
  const boldClass = ZeroWorker.getClassName('{font-weight:bold;}')
  const hasBoldClass = (list) => !!boldClass && list.contains(boldClass);

  function parseThreads() {
    const threadsTables = Array.from(document.querySelectorAll('table.br'))
    if (!threadsTables.length) {
      throw new Error('Thread tables not found')
    }
    
    const result = threadsTables.map( ($table, i) => {
      try {
        // title, content, footer elements
        const $h3Elements = $table.querySelectorAll('h3')
        if ($h3Elements.length !== 3) {
          throw new Error('Expected 3 <h3> elements')
        }
        const thread = parseThread(...$h3Elements)
        thread.index = i
        return thread
      } catch (e) {
        console.error(e)
        return {error: e}
      }
      
    });
    
    return result;
  }
  
  /**
   * @param {HTMLElement} titleEl
   * @param {HTMLElement} contentEl
   * @param {HTMLElement} footerEl
   * @returns {Object}
   */
  function parseThread(titleEl, contentEl, footerEl) {
    const rawName = titleEl.querySelector('a').innerText;
    const link = titleEl.querySelector('a').href;

    const {name, unreadCount} = parseThreadTitle(rawName);
    ZeroWorker.textify(contentEl)
    const snippet = contentEl.innerText;
    const footer = footerEl.innerText;
    const isUnread = hasBoldClass(titleEl.classList);
    const isActive = !!titleEl.querySelector('span'); // Has the green dot ?
    
    return { link, name, snippet, footer, isActive, isUnread, unreadCount}
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
    try {
      return document.querySelector('#see_older_threads a').href
    } catch (e) {
      return ''
    }
  }

  function getLinkToNewer() {
    try {
      return document.querySelector('#see_newer_threads a').href    
    } catch (e) {
      return ''
    }
  }
  
  return {
    threads: parseThreads(),
    linkToOlder: getLinkToOlder(),
    linkToNewer: getLinkToNewer(),
  }

}
