/**
 * Kinda a namespace for ZeroBroker
 * These functions were basically taken from `Zerofy.html`
 * @todo Make it work
 * @todo Integrate it with `index.js` and `ZeroFile.js`
 */
module.exports = class ZeroBroker {
  // Maximum length of a message, or in TCP-speak "Maximum Segment Size"
  static MAXIMUM_SEGMENT_SIZE = 2 ** 14;  // 16KB - limited by Facebook or idk

  static rZeroFileSegment = /^ZeroFile (zfid\d+) (\d+)-(\d+) (.+)$/

  /**
   * @param {Buffer} buff - file's buffer
   * @returns {Array<string>}
   */
  static toSegments(buff) {
    const MAX_PART_DATA = ZeroBroker.MAXIMUM_SEGMENT_SIZE;

    const id = ZeroBroker.generateId();
    const fullData = buff.toString('base64');
    const partsCount = Math.ceil(fullData.length / MAX_PART_DATA);
    const parts =
      new Array(partsCount)
      .fill('')
      .map( (_, i) => {
        const partNum = i + 1;
        const start = i * MAX_PART_DATA;
        const stop = (i + 1) * MAX_PART_DATA;
        const partData = fullData.slice(start, stop);
        const part = `ZeroMedia ${id} ${partNum}-${partsCount} ${partData}`;
        return part
      });
    return parts;
  }

  /**
   * @todo Find a better thing to use. File's checksum maybe?
   * @returns {string} A unique id
   */
  static generateId() {
    // const rZfid = /^zfid(\d{10})(\d{10})$/;
    const prefix = 'zfid';
    const now = Date.now().toString().slice(-10);
    const random = (Math.random() * 10 ** 10).toFixed();
    return  prefix + now + random;
  }

  /**
   * @param {string} body
   * @returns {object} Parsed request
   */
  static parseRequest(body) {
    const rRequest = /^ZeroBroker::(?<action>[a-z]+)(::(?<params>.+))?$/;
    const matched = body.match(rRequest);
    const {action, params} = matched.groups;
    switch (action) {
      case 'send':
        return {
          action,
          target: params.split('::')[0],
          fileSegment: params.split('::')[1]
        }

      case 'get':
        return {
          action,
          source: params,
        }

      default:
        return {}
    }
  }
}
