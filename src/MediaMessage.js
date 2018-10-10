// todo: "... extends Message"
class MediaMessage {
  /**
   * @param {string} id
   * @param {string} partsCount
   * @param {TextMessage} originalMessage
   */
  constructor(id, partsCount, originalMessage) {
    this.id = id;
    this.parts = Array(Number(partsCount)).fill(null);
    this.data = '';
    this.sender = originalMessage.sender;
    this.senderName = originalMessage.senderName;
  }

  /** @returns {number} - Progress ratio [0..1] */
  getProgressRatio() {
    return this.parts.filter( part => !!part ).length / this.parts.length;
  }

  /**
   * @param {number} partNum
   * @param {string} partData
   */
  addPart(partNum, partData) {
    if (!partNum || !partData) {
      return console.error('MediaMessage::addPart', partNum, partData);
    }

    const i = partNum - 1;
    this.parts[i] = partData;
    if (this.getProgressRatio() === 1) {
      this.data = this.parts.join('');
      this.parts = ['done'] // to free memory, yet preserve the attribute's type?
    }
  }

}

// "ZeroMedia [id] [part]-[partsCount] [partData]"
MediaMessage.rZeroMedia = /^ZeroMedia (\d+) (\d+)-(\d+) (.+)$/
