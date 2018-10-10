/**
 * Master is like an interface to ZeroWorker (on 0.facebook.com windows/iframes)
 *
 * @example
 * const username = 'wanis.rowdy'
 * const job = {fn: 'getProfileInfo', url: `https://0.facebook.com/${username}`}
 * const master = new Master(job)
 * master.getResponse().then( (res) => {
 *   console.info(`${res.name} is ${res.isActive? 'online' : offline}`)
 * })
 * // Probably displays: "Wanis Rowdy is offline"
 */

class Master {
  /**
   * @param {Object} job - see setJob
   */
  constructor(job) {
    this.setJob(job)
    const iframe = document.createElement('iframe')
    iframe.className = 'worker' // To hide it using CSS maybe
    this._iframe = iframe
  }

  /**
   * For re-usability.
   *
   * @param {object} job - The Worker's `raison d'être`
   * @param {!string} job.url - The original URL
   * @param {!string} job.fn - The function name that ZeroWorker will call
   * @param {Array<*>} [job.args=[]] - The function's parameters
   * @param {boolean} [job.reloads=false] - Does the `job` make the page reload?
   * @param {boolean} [job.once=true] - Should the Worker be killed after one call?
   * @param {?Object} job.times - Max load/reload/response waiting times
   * @public
   */
  setJob(job) {
    // default parameters
    const {
      args = [],
      reloads = false,
      once = true,
      _times = {},
    } = job;
    const {
        load = 30*1000, // 30 secs
        reload = 30*1000, // 30 secs
        response = 3*1000, // 3 secs
    } = _times;
    const times = {load, reload, response}

    Object.assign(job, {args, reloads, once, times} )
    // important for handling message events
    job.id = `${job.url}::${Date.now()}::${Math.random()}`

    this.job = job
  }

  /** @private */
  load() {
    return new Promise ( (resolve, reject) => {
      this._iframe.src = this.job.url;
      this._iframe.onload = () => resolve({loaded: true});
      this._iframe.onerror = this._iframe.onabort = (e) => {
        reject({error: 'WORKER: Error Loading'})
      }
      setTimeout( () => {
        reject({error: 'WORKER: Loading Timeout'})
      }, this.job.times.load);

      Master.$workplace.appendChild(this._iframe);
    })
  }

  /**
   * @listens Window:message
   * @private
   */
  launch() {
    return new Promise( (resolve, reject) => {
      // The `job` either causes the worker/iframe to reload...
      if (this.job.reloads) {
        /// @todo maybe this is doesn't work
        this._iframe.onload = () => resolve({reloaded: true})
        this._iframe.onerror = this._iframe.onabort = (e) => {
          reject({error: 'WORKER: Error Reloading'})
        }
        setTimeout( () => {
          reject({error: 'WORKER: Reloading Timeout'})
        }, this.job.times.reload);
      } else { // ... or to send a message/response
        const onMessage = (event) => {
          const data = event.data;
          if (data && data.job && data.job.id === this.job.id) {
            // Perfect, this is the event we were listening to.
            removeListener()
            if (data.response && !data.response.error) {
              resolve(data.response)
            } else {
              const err = (data.response && data.response.error) || 'Response err'
              reject({error: err})
            }
          }
        }
        const removeListener = () => window.removeEventListener('message', onMessage, false);
        window.addEventListener('message', onMessage, false)
        setTimeout( () => {
          reject({error: 'WORKER: Response Timeout'})
          removeListener()
        }, this.job.times.response);
      }
      // Now tell ZeroWorker to launch the job
      this._iframe.contentWindow.postMessage(this.job, '*')
    })
  }

  /** @public */
  kill() {
    if (this._iframe instanceof HTMLElement) {
      this._iframe.remove()
      this._iframe = null
    }
  }

  /**
   * Launch the `job` and return the response as a Promise
   * @returns {Object} Object with response data or null object
   * @public
   */
  async getResponse() {
    let res;
    try {
      await this.load()
      res = await this.launch()
    } catch (e) {
      console.error('Master::getResponse', e)
      res = e
    }

    if (this.job.once) {
      this.kill()
    }

    return res
  }

}

/**
 * The "workplace" where `Worker`s (iframe elements) will be appended
 * @constant {HTMLElement}
 */
Master.$workplace = document.querySelector('#workplace')

const Zero = {
  origin: 'https://0.facebook.com',
}

/**
 * @param {string} link - full url to test (must have protocol)
 * @returns {boolean}
 */
Zero.isValidLink = (link) => {
  try {
    // if it doesn't throw, it's probably a valid URL
    new URL(link)
    return true
  } catch(e) {
    return false
  }
}
