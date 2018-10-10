/**
 * @file A content script that is injected in https://0.facebook.com/* iframes
 * @author Djalil Dreamski <dreamski21@gmail.com>
 */

const ZeroWorker = {}

ZeroWorker._pageDate = Date.now(); // important for updating
ZeroWorker._pageLink = window.location.toString(); // caching
ZeroWorker._pageUrl  = new URL(ZeroWorker._pageLink); // caching
ZeroWorker._pagePath = (() => {
    const pathname = ZeroWorker._pageUrl.pathname
    const path = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname
    return path
  })();

/** @private */
ZeroWorker.addMeta = function addMeta(obj) {
  obj._pageDate = ZeroWorker._pageDate
  obj._pageLink = ZeroWorker._pageLink
}

/**
 * A general purpose link finder
 * @param {string} str
 * @returns {string}
 */
ZeroWorker.getLink = function getLink(str) {
  try {
    const $links = Array.from(document.querySelectorAll("#root a"))
    const link = $links.find(a => a.href.indexOf(str) === 0).href
    return link
  } catch (e) {
    console.warn(e)
    return ''
  }
}

/**
 * A general purpose CSS class names finder
 * Class name changes randomly, we use this to determine them
 * @example
 * // having a rule .xx{font-weight:bold;}
 * getClassName('{font-weight:bold;}') === 'xx'
 *
 * @param {string} rule
 * @returns {string}
 */
ZeroWorker.getClassName = function getClassName(rule) {
  rule = rule.replace(/{/g, '\\{').replace(/:/g, '\\:')
  const rRule = RegExp('\\.(\\w+?)' + rule);
  const styleHtml = document.querySelector('style').innerHTML;
  const [, xx] = styleHtml.match(rRule) || [];
  return xx || '';
}

/**
 * Handles emojis and emotions, for threads and messages
 * @todo handle urls
 * @todo use prefixes: emoji, emoticon, url, etc
 * @param {HTMLElement} $div
 */
ZeroWorker.textify = function textify($div) {
  const SPECIAL_START = '\001'
  const SPECIAL_STOP = '\002'
  const mark = (str) => SPECIAL_START + str + SPECIAL_STOP
  
  $div.querySelectorAll('i[style]').forEach( ($emoImage) => {
    const imgUrl = $emoImage.style.backgroundImage;
    const url = imgUrl.slice(5, -2)
    const text = mark('emoticon:' + url)
    $emoImage.replaceWith(text)
  })

  const emoClass = ZeroWorker.getClassName('{display:table-cell;padding:4px;')
  $div.querySelectorAll(`[class="${emoClass}"]`).forEach( ($emoText) => {
    const text = mark('emoji:' + $emoText.innerText.trim())
    $emoText.parentElement.replaceWith(text)
  })

}


/** @return {string} Error text or an empty string */
ZeroWorker.getError = function getError() {
  const errBorderColor = "rgb(221, 60, 16)" // red
  const $root = document.querySelector('#root')
  let err = '';
  if ($root.children.length === 3) {
    $firstDiv = $root.children[0]
    if (getComputedStyle($firstDiv).borderColor === errBorderColor) {
      err = $firstDiv.innerText
    }
  }
  return err
}

/**
 * Obeys Master's orders.
 *
 * @param {Event} event
 * @param {object} event.data
 * @param {string} event.data.fn
 * @param {Array} event.data.args
 * @listens Window:message
 * @fires Window:message
 */
ZeroWorker.onOrder = function onOrder(event) {
  const job = event.data

  if (typeof job !== 'object' ||
      typeof job.fn !== 'string' ||
      typeof ZeroWorker[job.fn] !== 'function') {
    event.source.postMessage({job, response: {error: "bad 'job'"}}, '*')
  }
  
  const output = ZeroWorker[job.fn](...job.args)
  if (output) {
    const isObject = typeof output === 'object' && !Array.isArray(output)
    const response =  isObject? output : {value: output}
    ZeroWorker.addMeta(response)
    event.source.postMessage({job, response}, '*')    
  }

}

window.addEventListener('message', ZeroWorker.onOrder, false)
