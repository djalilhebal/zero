/**
 * @param {Buffer} buff - file's buffer
 * @returns {Array<string>}
 */
function zerofy (buff) {
  const MAX_MESSAGE = 2 ** 14;  // 16KB - limited by Facebook or idk
  const MAX_PART_DATA = MAX_MESSAGE;

  // id = Date now (13 symbols) + random int (10 symbols)
  const id = Date.now() + '' + (Math.random() * 10 ** 10).toFixed();
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

// "ZeroMedia [id] [part]-[partsCount] [partData]"
const rZeroMedia = /^ZeroMedia (\d+) (\d+)-(\d+) (.+)$/

const mediaDB = {}

function mediafy(obj) {
  if (!mediaDB[obj.id]) {
    mediaDB[obj.id] = {
      id: obj.id,
      data: new Array(obj.partsCount).fill(null)
    }
  }
  
  const media = mediaDB[obj.id]
  if (typeof media.data !== 'string') {
    const i = partNum - 1;
    media.data[i] = partData;
    
    if (media.data.every(part => !!part)) {
      this.data = this.data.join('');
    }
  }
  return media; // maybe to check it?
}
