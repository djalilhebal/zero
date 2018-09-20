// Only one instance of this page should exist
// kill all windows expect this one
chrome.extension.getViews()
  .filter( v => v !== window)
  .forEach( v => v.close() )

// now to work
const db = new ZeroDatabase();

// Taken from
// http://www.natewillard.com/blog/chrome/javascript/iframes/2015/10/20/chrome-communication/
chrome.webRequest.onHeadersReceived.addListener(
    function(info) {
        var headers = info.responseHeaders;
        for (var i=headers.length-1; i>=0; --i) {
            var header = headers[i].name.toLowerCase();
            if (header == 'x-frame-options' || header == 'frame-options') {
                headers.splice(i, 1); // Remove header
            }
        }
        return {responseHeaders: headers};
    },
    {
        urls: [ 'https://0.facebook.com/*' ],
        types: [ 'sub_frame' ]
    },
    ['blocking', 'responseHeaders']
);

chrome.runtime.onMessage.addListener(function handleMessage(request, sender, sendResponse) {
  console.info(request)
  console.log(sender)
  db.update(request);

  //sendResponse({order: 'sendText', text: 'Yo!'})
});

chrome.browserAction.onClicked.addListener( () => {
  window.open(chrome.extension.getURL('index.html'))
})
