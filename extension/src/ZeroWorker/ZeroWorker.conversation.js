/** @file ZeroWorker.conversation */

/** @return {Object} */
ZeroWorker.getComposerInfo = function getComposerInfo() {
  const recipientsDiv = document.querySelector('#messaging_compose_error').nextSibling;
  const nameAppears = !!recipientsDiv.querySelector('a[class]');
  return {nameAppears}
}

/** @returns {Object} */
ZeroWorker.getChunk = function getChunk() {

  /** @returns {boolean} */
  function getIsNewConversation() {
   return !!ZeroWorker.getLink('https://0.facebook.com/friends/selector')
  }

  /** @returns {boolean} */
  function getHasComposer() {
    return !!document.querySelector('#composer_form')
  }

  /** @returns {string} */
  function getOlderLink() {
    return (document.querySelector('#see_older a') || {}).href || ''
  }

  /** @returns {string} */
  function getNewerLink() {
    return (document.querySelector('#see_newer a') || {}).href || ''
  }

  /** @returns {Array<Object>} */
  function getMessages() {
    /*
    <div id="messageGroup">
      #see_older link
      <div>messages</div>
      #see_newer link
    </div>
    */
    
    if (getIsNewConversation())
      return []
    
    const $groupDiv = document.querySelector('#messageGroup')
    // As can be seen in the comment above, our container has no `id` attribute
    const $messagesDiv = Array.from($groupDiv.children).find($x => !$x.id)
    const messages = Array.from($messagesDiv.children)
                      .map(parseMessageDiv)
                      .filter( obj => typeof obj === 'object')
    return messages;
  }

  /**
   * @param {HTMLElement} $footer
   * @returns {string}
  */
  function getMessageDeleteLink($footer) {
    const $link = Array.from($footer.querySelectorAll('a')).find($a => $a.innerText === 'Delete')
    if ($link) {
      const link = $link.href
      $link.remove()
      return link
    } else {
      return ''
    }
  }

  function parseMessageDiv($messageDiv) {
    try {
      let $sender = $messageDiv.children[0].querySelector('a')
      // Sender has no link? Maybe blocked or deactivated. Just get their name.
      if (!$sender) $sender = $messageDiv.children[0].querySelector('strong')
      const {innerText: senderName, href: senderLink} = $sender
      const $footer = $messageDiv.children[1]
      const deleteLink = getMessageDeleteLink($footer)
      const footer = $footer.innerText
      const $contentsDiv = $messageDiv.children[0]
      ZeroWorker.textify($messageDiv)
      const text = Array.from($contentsDiv.querySelectorAll('div'))
                .map( $part => $part.innerText )
                .join('');

      return {text, senderName, senderLink, deleteLink, footer}
    } catch(e) {
      console.error(e)
      return {}
    }
  }

  /** @returns {Object} */
  function parseHeader() {
    try {
      const $headerDiv = document.querySelector('#root > div > div > div')
      const $toParticipants = $headerDiv.querySelector('a');
      const groupInfoLink = $toParticipants ? $toParticipants.href : '';
      const name = $headerDiv.children[0].innerText;
      const hasGreenDot = $headerDiv.children.length === 3;
      // e.g. 'active now' or 'active 5 minutes ago'
      // exists only if it's not a group conversation
      const statusText = groupInfoLink ? '' : $headerDiv.children[1].innerText;
      return {name, hasGreenDot, statusText, groupInfoLink}
    } catch(e) {
      console.error(e)
      return {}
    }
  }

  const result = {
    ...parseHeader(),
    messages: getMessages(),
    isNewConversation: getIsNewConversation(),
    hasComposer: getHasComposer(),
    olderLink: getOlderLink(),
    newerLink: getNewerLink(),
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
