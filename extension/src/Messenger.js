class Messenger {  
  constructor() {
    /** @type {Object<string, Conversation?>} */
    this.conversations = {
      active: null,
    };
    /** @type {Moi?} */
    this.moi = null;
    this.contacts = {}; // TODO delete this
    this.profiles = {};
    this.now = Date.now();

    /** @type {Object<string, ZeroFile>} */
    this.files = {};

    this.refreshers = {
      contacts: {
        EVERY: 30*1000, // 30 secs
        onprogress: false,
      },
      threads: {
        EVERY: 10*1000, // 10 secs
        onprogress: false,
      },
      conversation: {
        EVERY: 5*1000, // 5 secs
        onprogress: '',
      },
      // A "time ticker" automatically update Messenger's 'time ago' texts
      now: {
        EVERY: 10*1000 // 10 secs
      }
    }
  }

  /**
   * @param {Array<any>} args
   * @returns {void}
   */
  static log(...args) {
    if (Messenger.isDev) {
      console.log(...args);
    }
  }

  /**
   * @param {string} str - search query
   * @param {string} type - 'people' or 'pages'
   * @returns {string}
   */
  static getSearchLink(str, type = 'people') {
    return `${Messenger.origin}/search/${type}/?q=${str}`;
  }

  /**
   * @param {string} link - Full URL to test (must have protocol)
   * @returns {boolean}
   */
  static isValidLink(link) {
    try {
      // if it doesn't throw, it's probably a valid URL
      new URL(link);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * @param {string} url
   * @param {string} param
   * @returns {string} - param's value
   */
  static getParam(url, param) {
    return (new URL(url)).searchParams.get(param) || '';
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
Messenger.isDev = true;
