const Master = {}

const $workers = document.querySelector('#workers')
const _workers = []

Master.getWorker = function getWorker(originalUrl, job) {
  return new Promise( (resolve, reject) => {
    job.id = Date.now();
    job.originalUrl = originalUrl;
    const frame = document.createElement('iframe')
    const worker = { frame, job }
    frame.src = originalUrl;
    frame.onload = () => resolve(worker);
    frame.onerror = frame.onabort = () => reject(worker);
    // for some reason, this is needed
    if ($workers) $workers.appendChild(frame);
    _workers.push(worker);
  })
}

Master.launch = (worker) => {
  return new Promise( (resolve, reject) => {
    // Our action either makes the frame reload
    if (worker.job.reloads) {
      worker.frame.onload = () => resolve(worker)
      worker.frame.onerror = worker.frame.onabort = () => reject(worker)
    } else {
      // or receives a response
      window.addEventListener("message", (e) => {
        if (!e.data ||
            !e.data.job || !e.data.response ||
            e.data.job.id !== worker.job.id ||
            e.data.job.originalUrl !== worker.job.originalUrl) {
          return;
        }
        if (typeof e.data === 'object' && !e.data.error) {
          worker.response = e.data.response;
          resolve(worker)
        } else {
          reject(worker)
        }
      }, false);
    }
    // Order the slave to launch the job now
    worker.frame.contentWindow.postMessage(worker.job, '*')
  })
} 

Master.kill = (worker) =>  {
  if (worker && worker.frame) {
    worker.frame.remove();
    worker.frame = null;
  }
  return worker;
}

const Zero = {}
Zero.parseChatLink = function parseChatLink(link = '') {
  /**
   * Handles links of the forms:
   * https://0.facebook.com/messages/read/?fbid=ID
   * https://0.facebook.com/messages/read/?tid=cid.c.ID:MYID
   * https://0.facebook.com/messages/read/?tid=cid.g.ID
   * https://0.facebook.com/messages/thread/ID
   * https://0.facebook.com/USER.NAME
   *
   * @example
   * // Viewing old messages from a group chat with friends ('Resto')
   * parseChatLink('https://0.facebook.com/messages/read/?tid=cid.g.1339317569528716&last_message_timestamp=1536837017563&pagination_direction=1&show_delete_message_button&refid=12')
   * // {"id":"1339317569528716", "lastTimestamp":"1536837017563", "isGroup":true}
   */

  const origin = 'https://0.facebook.com/'
  link = link.slice(origin.length)
  // `https://0.facebook.com/messages/read/?fbid=ID`
  // becomes `messages/read/?fbid=ID`

  const rFbid = /fbid=(\d+)/
  const rTidc = /tid=cid\.c\.(\d+)/ // can be edited to get MYID
  const rTidg = /tid=cid\.g\.(\d+)/
  const rThread = /^messages\/thread\/(\d+)/  
  
  const [, id] = link.match(rFbid)  ||
                 link.match(rTidc)  ||
                 link.match(rTidg)  ||
                 link.match(rThread)||
                 [];

  const isGroup = rTidg.test(link)
  const [, firstTimestamp] = link.match(/first_message_timestamp=(\d+)/) || []
  const [, lastTimestamp] = link.match(/last_message_timestamp=(\d+)/) || []
  const [, username] = id ? [] : link.match(/^([a-z\.]+)/) || []
  
  return { id, username, firstTimestamp, lastTimestamp, isGroup }
}

class ZeroAPI {
  static genLinkToProfileInfo(id) {
    return `${this.origin}/profile.php?id=${id}&v=info` 
  }

  static genLinkToChat(id) {
    return `${this.origin}/messages/read?fbid=${id}`
  }

  static genLinkToGroupChatInfo(id) {
    return `${this.origin}/messages/participants/?tid=cid.g.${id}`
  }
  
  static sendText(id, text) {
    const url = ZeroAPI.genLinkToChat(id)
    const job = {fn: 'sendText', args: [text], reloads: true}
    return Master.getWorker(url, job)
      .then(Master.launch)
      .then(Master.kill)
  }
  
  static getChat(id) {
    const url = id.startsWith('http') ? id : ZeroAPI.genLinkToChat(id)
    const job = {fn: 'getChat', args: []}
    return (Master.getWorker(url, job)
      .then(Master.launch)
      .then(Master.kill))
  }

  // EXAMPLE: getConversation(friendID).then(console.info);
  static async getConversation(id) {
    const chats = [];
    let worker = await ZeroAPI.getChat(id);
    chats.push(worker.response);
    while (worker.response && worker.response.linkToOlder) {
      worker = await ZeroAPI.getChat(worker.response.linkToOlder)
      chats.push(worker.response)
    }
    console.info(chats);
    return chats;
  }

}

ZeroAPI.origin = 'https://0.facebook.com'
