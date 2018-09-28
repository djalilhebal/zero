/**
@nosideeffects
@throws {Type}
*/

/**
 * 
 */
function getSearchLink(str, type) {
  
}

async function isSent() {
  w.setJob( {'fn': 'getError'})
  const res = await w.getResponse()
  return res && res._pageLink.get('request_type') === 'send_success'
}

/**
 * @returns {string}
 */
function getActiveDateStr() {
  const timestamp = this.timestamp
  return new Date(timestamp).toISOString()
}
