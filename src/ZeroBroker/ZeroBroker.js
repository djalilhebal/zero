/**
 * @file ZeroBroker, a bot to base64-ify incoming media for ZeroMessenger
 * @todo Actually define `Messenger` and make it usable
 */

/**
 * Convert a media file into text and send it to my inbox
 * @param {Object} message
 */
function handleMedia(message) {
  const MAX_MESSAGE = 2 ** 14;  // 16KB - limited by Facebook or idk
  const MAX_PART_DATA = MAX_MESSAGE;

  const fullData = Base64.encode(message.content);
  const partsCount = Math.ceil(fullData.length / MAX_PART_DATA);
  const id = `${message.cid}_${message.mid}`;
  const mime = message.mime;
  
  for (let i = 0; i < partsCount; i++) {
    const start = i * MAX_PART_DATA;
    const stop = (i + 1) * MAX_PART_DATA;
    const partData = fullData.slice(start, stop);
    const partNum = i + 1;
    const msg = `ZeroMedia ${mime} ${id} ${partNum}-${partsCount} ${partData}`;
    Messenger.sendText(ME, msg);
  }
}

/**
 * @listens Messenger:message
 */
Messenger.onMessage( (message) => {
  const rMedia = /^ZeroMedia (\w+\/\w+) (\d+) (\d+)-(\d+) (.+)$/;
  if (rMedia.test(message.text)) {
    handleMedia(message);
  }
});
