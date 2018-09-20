/// ZeroWorker.chat

/***********************
 *    Chat functions   *
 ***********************/

ZeroWorker.inChat = function inChat() {
  const url = ZeroWorker._pageUrl;
  const path = url.pathname.endsWith('/') ? url.pathname.slice(0, -1) : url.pathname
  return (path === '/messages/read' || path === "/messages") &&
          (url.searchParams.has('fbid') || url.searchParams.has('tid')) &&
          !!document.querySelector('#messageGroup');
}

ZeroWorker.getChat = function getChat() {
  // {name, isOnline, lastActiveText, isGroup}
  const parsedHeader = parseChatHeader();
  // { id, username, firstTimestamp, lastTimestamp, isGroup }
  const parsedLink = Zero.parseChatLink(ZeroWorker._pageLink)

  const result = {
    messages: getMessages(),
    id: parsedLink.id,
    isGroup: parsedHeader.isGroup || parsedLink.isGroup,
    firstTimestamp: parsedLink.firstTimestamp,
    lastTimestamp: parsedLink.lastTimestamp,
    linkToOlder: getLinkToOlder(),
    linkToNewer: getLinkToNewer(),
  }
  return result;
  
  function getLinkToOlder() {
    return (document.querySelector('#see_older a') || {}).href
  }
  
  function getLinkToNewer() {
    return (document.querySelector('#see_newer a') || {}).href
  }

  function parseChatHeader() {
    try {
      const $headerDiv = document.querySelector("#root > div > div > div")
      const name = $headerDiv.children[0].innerHTML;
      const isGroup = !!$headerDiv.querySelector('a') // participants link exists?
      const isOnline = $headerDiv.children.length === 3;
      // "active 5 minutes ago"
      const lastActiveText = isOnline ? null : $headerDiv.children[1].innerText;
      return {name, isOnline, lastActiveText, isGroup}
    } catch(e) {
      return {};
    }
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
    const $messagesDiv = Array.from($groupDiv.children).filter( $x => !$x.id)[0]
    const messages = Array.from($messagesDiv.children)
                      .map(parseMessageDiv)
                      .filter( obj => typeof obj === 'object')
    return messages;
  }

  function parseMessageDiv($messageDiv) {
    try {
      const $a = $messageDiv.children[0].querySelector('a');
      const senderName = $a.innerText;
      const senderHref = $a.href;
      const footer = $messageDiv.children[1].innerText;
      const text = Array.from($messageDiv.children[0].querySelectorAll('div'))
                .map( $x => $x.innerText)
                .join('');

      return {senderName, senderHref, text, footer};
    } catch(e) {
      console.log(e);
      return null;
    }
  }
  
}

ZeroWorker.sendText = function sendText(str) {
	var log = console.log;
	const $form = document.querySelector('#composer_form')
	const $input = document.querySelector('#composer_form textarea')

	if (!$form || !$input)
		return log('[sendText] $form or $input not found', $form, $input)

	if (typeof str !== 'string' || str.length === 0)
		return log('[sendText] bad input', str)
	
	$input.value = str;
	$form.submit();
	// after sending check: request_type=send_successs
}
