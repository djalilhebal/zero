/**
 * @file A content script that is injected in https://0.facebook.com/* iframes
 * @author Djalil Dreamski <dreamski21@gmail.com>
 */

const ZeroWorker = {}

ZeroWorker._pageDate = Date.now(); // important for updating
ZeroWorker._pageLink = window.location.toString(); // caching
ZeroWorker._addMeta = function _addMeta(obj) {
  obj._pageDate = ZeroWorker._pageDate
  obj._pageLink = ZeroWorker._pageLink
}

/**
 * A general purpose link finder
 * @param {string|RegExp} criteria - Prefix (string) or a pattern (regex)
 * @returns {string}
 */
ZeroWorker.getLink = function getLink(criteria) {
  try {
    const hasPrefix = ($a) => $a.href.startsWith(criteria);
    const hasPattern = ($a) => criteria.test($a.href);
    const predicate = typeof criteria === 'string' ? hasPrefix : hasPattern;
    const $links = Array.from(document.querySelectorAll('a'))
    const link = $links.find(predicate).href
    return link
  } catch (e) {
    console.warn(e)
    return ''
  }
}

/**
 * Extract href string from the anchor `$a` maybe
 * Used often in different places
 * @param {HTMLAnchorElement} $a - Anchor element maybe
 * @return {string} Link or empty string
 */
ZeroWorker.getHref = function getHref($a) {
  if ($a && typeof $a.href === 'string') {
    return $a.href
  } else {
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
  const styleHtml = document.querySelector('style').innerHTML
  const escapedRule = rule.replace(/[{}().]/g, '\\$&')
  const rRule = RegExp('\\.(\\w+?)' + escapedRule)
  const [, className] = styleHtml.match(rRule) || []
  return className || ''
}

/**
 * Preprocess texts in thread and message divs to preserve emojis and emotions.
 * 
 * @todo handle urls, photo, audio, video,
 * @param {HTMLElement} $div
 * @returns {void}
 */
ZeroWorker.textify = function textify($div) {
  // Surround str with ASCII Start/End of Text control characters
  const STX = '\x02'
  const ETX = '\x03'
  const mark = (str) => STX + str + ETX
  
  $div.querySelectorAll('i[style]').forEach( ($emoImage) => {
    const imgUrl = $emoImage.style.backgroundImage
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
    const $firstDiv = $root.children[0]
    if (getComputedStyle($firstDiv).borderColor === errBorderColor) {
      err = $firstDiv.innerText
    }
  }
  return err
}

/**
 * Obeys Master's order and sends a response.
 *
 * @param {MessageEvent} event
 * @listens Window:message
 * @fires Window:message
 */
ZeroWorker.onOrder = function onOrder(event) {
  const job = event.data

  if (typeof job !== 'object' ||
      typeof job.fn !== 'string' ||
      typeof ZeroWorker[job.fn] !== 'function' ||
      !Array.isArray(job.args)) {
    return event.source.postMessage({job, response: {error: 'bad job'}}, '*')
  }
  
  const output = ZeroWorker[job.fn](...job.args)
  if (output) {
    const isObject = typeof output === 'object' && !Array.isArray(output)
    const response =  isObject ? output : {value: output}
    ZeroWorker._addMeta(response)
    event.source.postMessage({job, response}, '*')    
  }

}

window.addEventListener('message', ZeroWorker.onOrder, false)
