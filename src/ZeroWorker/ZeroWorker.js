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
 * A general purpose link getter
 * @param {string} str
 * @returns {string}
 */
ZeroWorker.getLink = function getLink(str) {
  try {
    const $links = Array.from(document.querySelectorAll("#root a"))
    const link = $links.find(a => a.href.indexOf(str) === 0).href
    return link
  } catch (e) {
    console.error(e)
    return ''
  }
}

/**
 * A general purpose CSS class names getter
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
 * Obeys Master/Worker's orders.
 *
 * @param {Event} event
 * @param {object} event.data
 * @param {string} event.data.fn
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
