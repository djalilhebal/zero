/** @file ZeroWorker.conversation */

/** @returns {boolean} */
ZeroWorker.inConversation = function inConversation() {
  const url = ZeroWorker._pageUrl
  const path = ZeroWorker._pagePath
  return (path === '/messages/read' || path === "/messages") &&
          (url.searchParams.has('fbid') || url.searchParams.has('tid'))
          // && !!document.querySelector('#messageGroup'); // can be empty
}

/** @returns {Object} */
ZeroWorker.getChunk = function getChunk() {
  /** @returns {Object} */
  function parseHeader() {
    try {
      const $headerDiv = document.querySelector('#root > div > div > div')
      const $toParticipants = $headerDiv.querySelector('a')
      const linkToParticipants = $toParticipants ? $toParticipants.href : '';
      const name = $headerDiv.children[0].innerText;
      const isGroup = !!$toParticipants;
      const isActive = $headerDiv.children.length === 3;
      // e.g. 'active now' or 'active 5 minutes ago'
      const activeText = isGroup? '' : $headerDiv.children[1].innerText;
      return {name, isActive, activeText, isGroup, linkToParticipants}
    } catch(e) {
      console.error(e)
      return {}
    }
  }

  /** @returns {boolean} */
  function canReply() {
    return !!document.querySelector('#composer_form')
  } 

  /** @returns {string} */
  function getLinkToOlder() {
    return (document.querySelector('#see_older a') || {}).href || ''
  }
  
  /** @returns {string} */
  function getLinkToNewer() {
    return (document.querySelector('#see_newer a') || {}).href || ''
  }

  function getMessages() {
    /*
    <div id="messageGroup">
      <div id="see_older">link</div>
      <div>messages</div>
      <div id="see_newer">link</div>
    </div>
    */
    const $groupDiv = document.querySelector('#messageGroup')
    // As can be seen in the comment above, our container has no `id` attribute
    const $messagesDiv = Array.from($groupDiv.children).find( $x => !$x.id)
    const messages = Array.from($messagesDiv.children)
                      .map(parseMessageDiv)
                      .filter( obj => typeof obj === 'object')
    return messages;
  }

  /**
   * @param {HTMLElement} $footer
   * @returns {string}
  */
  function getDeleteLink($footer) {
    const $link = Array.from($footer.querySelectorAll('a')).find( a => a.innerText === 'Delete')
    if ($link) {
      const link = $link.href
      $link.remove()
      return link
    } else {
      return ''
    }
    
  }

  function textifyEmoticons($div) {
    const SPECIAL_START = '\001'
    const SPECIAL_STOP = '\002'
    const mark = (str) => SPECIAL_START + str + SPECIAL_STOP
    
    $div.querySelectorAll('i[style]').forEach( ($emoImage) => {
      const text = mark($emoImage.style.backgroundImage)
      $emoImage.replaceWith(text)
    })

    const emoClass = ZeroWorker.getClassName('{display:table-cell;padding:4px;')
    $div.querySelectorAll(`[class="${emoClass}"]`).forEach( ($emoText) => {
      const text = mark($emoText.innerText.trim())
      $emoText.parentElement.replaceWith(text)
    })

  }
  
  function parseMessageDiv($messageDiv) {
    try {
      const $sender = $messageDiv.children[0].querySelector('a')
      const {innerText: senderName, href: senderLink} = $sender
      const $footer = $messageDiv.children[1]
      const deleteLink = getDeleteLink($footer)
      const footer = $footer.innerText
      const $messagesDiv = $messageDiv.children[0]
      textifyEmoticons($messageDiv)
      const text = Array.from($messagesDiv.querySelectorAll('div'))
                .map( $part => $part.innerText )
                .join('');

      return {text, senderLink, deleteLink, senderName, footer}
    } catch(e) {
      console.error(e)
      return {}
    }
  }
  
  const {name, isActive, activeText, isGroup, linkToParticipants} = parseHeader()

  const result = {
    messages: getMessages(),
    canReply: canReply(),
    linkToOlder: getLinkToOlder(),
    linkToNewer: getLinkToNewer(),
    name, isActive, activeText, isGroup, linkToParticipants,
  }
  return result;
}

/**
 * @param {string} str - text message to send
 * @throws {Error}
 */
ZeroWorker.sendText = function sendText(str) {
	const $form = document.querySelector('#composer_form')
	const $input = $form.querySelector('textarea')

	if (!$form || !$input)    
		throw new Error('$form or $input not found')

	if (typeof str !== 'string' || str.length === 0)
		throw new Error('Input should be a string && length > 0')
	
	$input.value = str;
	$form.submit();
}
