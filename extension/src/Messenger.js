class Messenger {
  constructor() {
   this.conversations = {};
   this.contacts = {};
   this.moi = null;
   this.now = Date.now();
  }

  /**
   * @param {string} str - search query
   * @param {string} type - 'people' or 'pages'
   * @returns {string}
   */
  static getSearchLink(str, type = 'people') {
    return `${Messenger.origin}/search/${type}/?q=${str}`
  }

  /**
   * @param {string} link - Full URL to test (must have protocol)
   * @returns {boolean}
   */
  static isValidLink(link) {
    try {
      // if it doesn't throw, it's probably a valid URL
      new URL(link)
      return true
    } catch(e) {
      return false
    }
  }

  /**
   * @param {string} url
   * @param {string} param
   * @returns {string} - param's value
   */
  static getParam(url, param) {
    return (new URL(url)).searchParams.get(param);
  } 

  /**
   * @param {string} url
   * @param {string} param
   * @returns {boolean}
   */
  static hasParam(url, param) {
    return (new URL(url)).searchParams.has(param);
  }

}

Messenger.origin = 'https://0.facebook.com';
