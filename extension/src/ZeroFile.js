class ZeroFile {
  /**
   * @param {Object} info
   * @param {string} info.id - fbid, zmid, link
   * @param {number} info.partsCount
   * @param {string} info.mime - mimeType (e.g. "image/png")
   */
  constructor(info) {
    this.id = info.id;
    this.mime = info.mime;
    /** @type {Array<string>} */
    this.parts = Array(info.partsCount).fill('');
    this.data = ''; // base64-encoded data
  }

  /** @returns {number} - Progress ratio [0..1] */
  getProgressRatio() {
    return this.parts.filter(part => !!part).length / this.parts.length;
  }

  /**
   * @param {number} partNum
   * @param {string} partData
   * @returns {void}
   */
  addPart(partNum, partData) {
    if (this.parts.length === 0) {
      Messenger.log(this, 'Already have all parts');
      return;
    }

    if (!partNum || !partData) {
      throw new TypeError(`addPart(${partNum}, ${partData})`);
    }
    
    const i = partNum - 1;
    this.parts[i] = partData;
    if (this.getProgressRatio() === 1) {
      this.data = this.parts.join('');
      this.parts = []; // to free memory, yet preserve the attribute's type(?)
    }
  }

}

// "ZeroMedia [id] [partNum]-[partsCount] [partData]"
ZeroFile.rZeroMedia = /^ZeroMedia (\d+) (\d+)-(\d+) (.+)$/;
