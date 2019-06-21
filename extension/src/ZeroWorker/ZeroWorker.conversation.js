/**
 * Parse chat info and content (messages)
 * @return {ZeroChat | ZeroError}
 */
ZeroWorker.getChunk = function getChunk() {

  /** @returns {boolean} */
  function getHasSelector() {
   return !!ZeroWorker.getLink('https://0.facebook.com/friends/selector')
  }

  /** @returns {boolean} */
  function getHasComposer() {
    return !!document.querySelector('#composer_form')
  }

  /** @returns {string} */
  function getOlderLink() {
    return ZeroWorker.getHref(document.querySelector('#see_older a'))
  }

  /** @returns {string} */
  function getNewerLink() {
    return ZeroWorker.getHref(document.querySelector('#see_newer a'))
  }

  /** @returns {Array<ZeroMessage>} */
  function getMessages() {
    /*
    <div id="messageGroup">
      #see_older link
      <div>messages</div>
      #see_newer link
    </div>
    */
    
    if (getHasSelector())
      return []
    
    const $groupDiv = document.querySelector('#messageGroup')
    // As can be seen in the comment above, our container has no `id` attribute
    const $messagesDiv = Array.from($groupDiv.children).find($x => !$x.id)
    const messages = Array.from($messagesDiv.children)
                      .map(parseMessageDiv)
                      .filter(obj => typeof obj === 'undefined')
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

  /** @returns {ZeroMessage} */
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
      return undefined
    }
  }

  /** @returns {Object} */
  function parseHeader() {
    try {
      const $headerDiv = document.querySelector('#root > div > div > div')
      const $toParticipants = $headerDiv.querySelector('a')
      const groupInfoLink = $toParticipants ? $toParticipants.href : ''
      const name = $headerDiv.children[0].innerText
      const hasGreenDot = $headerDiv.children.length === 3
      // e.g. 'active now' or 'active 5 minutes ago'
      // exists only if it's not a group conversation
      const statusText = groupInfoLink ? '' : $headerDiv.children[1].innerText
      return {name, hasGreenDot, statusText, groupInfoLink}
    } catch(e) {
      return {error: e}
    }
  }

  const result = {
    ...parseHeader(),
    messages: getMessages(),
    hasSelector: getHasSelector(),
    hasComposer: getHasComposer(),
    olderLink: getOlderLink(),
    newerLink: getNewerLink(),
  }
  return result;
}

/**
 * @param {string} str - Text message to send
 * @throws {TypeError}
 */
ZeroWorker.sendText = function sendText(str) {
  const $form = document.querySelector('#composer_form');
  const $input = $form && $form.querySelector('textarea');

  if (!$form || !$input)
    throw new TypeError('$form or $input not found');

  if (typeof str !== 'string' || str.length === 0)
    throw new TypeError('Input should be a string && length > 0');

  $input.value = str;
  $form.submit();
}

/**
 * Get message composer's info.
 * - If the recipient's `nameAppears` in the composer, it means they are "messageable."
 * @returns {Object}
 */
ZeroWorker.getComposerInfo = function getComposerInfo() {
  const $composeError = document.querySelector('#messaging_compose_error');
  const $recipientsDiv = $composeError && $composeError.nextSibling;
  const nameAppears = $recipientsDiv && !!$recipientsDiv.querySelector('a[class]');

  return {nameAppears}
}
