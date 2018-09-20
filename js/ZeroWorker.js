/// @namespace
const ZeroWorker = {}

// caching
ZeroWorker._pageDate = Date.now();
ZeroWorker._pageLink = window.location.toString();
ZeroWorker._pageUrl  = new URL(ZeroWorker._pageLink);

ZeroWorker.addMeta = function addMeta(obj) {
  obj._pageDate = ZeroWorker._pageDate;
  obj._pageLink = ZeroWorker._pageLink;
  obj._pageType = ZeroWorker.getPageType();
}

/***********************
 *  Profile functions  *
 ***********************/

ZeroWorker.getMessageLink = function getMessageLink() {
  const $links = document.querySelectorAll('#objects_container a')
  const $messageLink = Array.from($links).filter(a => a.innerHTML == 'Message')[0]
  const link = $messageLink ? $messageLink.href : null
  return link;
}

ZeroWorker.hasMessageLink = function hasMessageLink() {
  return !!ZeroWorker.getMessageLink();
}

ZeroWorker.inProfileInfo = function inProfileInfo() {
  const path = ZeroWorker._pageUrl.path;
  const params = ZeroWorker._pageUrl.searchParams;
  return /^\/profile\.php\/?/.test(path) &&
         params.has('id') && params.has('v') &&
         ZeroWorker.hasMessageLink();
}

ZeroWorker.getProfile = function getProfile() {
  function getUsername() {
    try {
      const $element = document.querySelector('#contact-info [title=Facebook]');
      const username = $element.innerText.match(/Facebook\n\/(.+)/)[1].trim();
      return username;
    } catch (e) {
      return null;
    }
  }

  try {
    const $nameSection = document.querySelector('#objects_container strong')
    
    const id = Zero.parseChatLink(ZeroWorker.getMessageLink()).id
    const fullname = $nameSection.innerText // Firstname Lastname (Nickname)
    const isOnline = !!$nameSection.nextSibling // green dot exists?
    const username = getUsername();
    return { id, username, fullname, isOnline };
  } catch(e) {
    console.log(e)
    return null;
  }
}


/***********************
 *  Threads functions  *
 ***********************/

ZeroWorker.inThreads = function inThreads() {
  /// @TODO
  return ZeroWorker._pageUrl.pathname === '/messages/' ||
         document.querySelectorAll('table.br').length;
}

ZeroWorker.getThreads = function getThreads() {
  function getBoldClass() {
    // IFF there are unread messages, there will be this CSS rule:
    // .xx{font-weight:bold;}
    // the class name changes randomly, we use this to determine it
    const rRule = /\.(\w+?)\{font-weight:bold;\}/;
    const styleHtml = document.querySelector('style').innerHTML;
    const [, xx] = styleHtml.match(rRule) || [];
    return xx;
  }
  const boldClass = getBoldClass(); // `string` or `undefined`
  const hasBoldClass = (list) => !!boldClass && list.contains(boldClass);

  return getThreads();

  function getThreads() {
    return {
      threads: parseThreads(),
      timestamp: getTimestamp(),
      pageNum: getPageNum(),
      linkToOlder: getLinkToOlder(),
      linkToNewer: getLinkToNewer(),
    }
  }

  function parseThreadTitle(str = '') {
    /**
     *
     * @example
     *
     *  parseThreadTitle("Nikola Lewinski (3)●")
     * // returns
     *  {
     *   "name": "Nikola Lewinski",
     *   "isOnline": true,
     *   "newMessagesCount": "3"
     *  }
     *
     *  parseThreadTitle("Resto 6 o'clock")
     * // returns
     *  {
     *   "name": "Resto 6 o'clock",
     *   "isOnline": false,
     *   "newMessagesCount": undefined
     *  }
     *  
     **/

    const isOnline = /●$/.test(str);
    str = str.replace(/●$/, '');

    const [, newMessagesCount] = str.match(/\((\d+)\)$/) || []
    str = str.replace(/\((\d+)\)$/, '');

    const name = str.trim();

    return { name, isOnline, newMessagesCount }

  }

  function parseThread(titleEl, contentEl, footerEl) { // HTMLElements
  
    function getNumberOfNewMessages() {
      /// @TODO
      if (newMessagesCount)
        return Number(newMessagesCount)
      else if (isUnread)
        return 1;
      else
        return 0;
    }

    const rawName = titleEl.querySelector('a').innerText;
    const href = titleEl.querySelector('a').href;

    const {name, isOnline, newMessagesCount} = parseThreadTitle(rawName)
    const id = Zero.parseChatLink(href).id
    const isUnread = hasBoldClass(titleEl.classList);
    //const isOnline = !!titleEl.querySelector('span'); // has the green dot ?
    const text = contentEl.innerText;
    const footer = footerEl.innerText;
    //const numberOfNewMessages = getNumberOfNewMessages();  
    return { id, name, isOnline, isUnread, newMessagesCount, text, footer }
  }

  function parseThreads() {
    const threadsTables = Array.from(document.querySelectorAll('table.br'));
    if (threadsTables.length === 0) throw Error('tables not found')
    
    const result = threadsTables.map( (table) => {
      try {
        const h3Elements = table.querySelectorAll("h3");
        if (h3Elements.length !== 3) throw Error('expected 3 <h3> elements')
        return parseThread(...h3Elements); // title, content, footer elements
      } catch (e) {
        console.error(e);
        return null;
      }
      
    });
    
    return result;
  }

  function getLinkToOlder() {
    try {
      return document.querySelector('#see_older_threads a').href
    } catch (e) {
      return null;
    }
  }

  function getLinkToNewer() {
    try {
      return document.querySelector('#see_newer_threads a').href    
    } catch (e) {
      return null;
    }
  }

  function getTimestamp() {
    try {
      return +ZeroWorker.pageUrl.searchParams.get('timestamp')
    } catch (e) {
      return null;
    }
  }
  
  function getPageNum() {
    try {
      return +ZeroWorker.pageUrl.searchParams.get('pageNum')
    } catch (e) {
      return null;
    }
  }

}


/***********************
 *        Orders       *
 ***********************/

ZeroWorker.getPageType = function getPageType() {
  /**
   * Determine the type of the current page
   */
  
  if (ZeroWorker.inChat()) {
    return 'chat'
  }
  else if (ZeroWorker.inProfileInfo()) {
    return 'profileInfo'
  }
  else if (ZeroWorker.hasMessageLink()) {
    return 'profile'
  }
  else if (ZeroWorker.inThreads()) {
    return 'threads'
  }
  else { 
    return 'unknown'
  }
}

ZeroWorker.isLoggedIn = function isLoggedIn() {
  return !!document.querySelector('#mbasic_logout_button')
}

ZeroWorker.isError = function isError() {
  const errorFooterText = "Back to previous page · Report a Problem"
  const errorBorderColor = "rgb(221, 60, 16)" // red
  const $root = document.querySelector('#root') || {children: []}
  const [$firstDiv, $secondDiv] = $root.children
  
  // Delete the logical OR? Maybe only one condition is enough
  return ($firstDiv && getComputedStyle($firstDiv).borderColor === errorBorderColor) ||
          ($secondDiv && $secondDiv.innerText === errorFooterText);
}

ZeroWorker.onOrder = function onOrder(event) {
  const job = event.data;

  if (typeof job !== 'object' || typeof job.fn !== 'string' ||
      typeof ZeroWorker[job.fn] !== 'function') {
    return console.error('ZeroWorker.onOrder', job);
  }
  
  const response = ZeroWorker[job.fn](...job.args)

  if (typeof response === 'object') {
    ZeroWorker.addMeta(response)
    event.source.postMessage({job, response}, '*')
  }
}

window.addEventListener('message', ZeroWorker.onOrder, false)
