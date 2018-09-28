const Zero = {
  origin: 'https://0.facebook.com',
}

/**
 * Worker is like an interface to ZeroWorker (on 0.facebook.com windows/iframes)
 *
 * @example
 * const contact = {name: 'Wanis Rowdy', username: 'wanis.rowdy'}
 * const job = {fn: 'isActive', url: `https://0.facebook.com/${contact.username}`}
 * const worker = new Worker(job)
 * worker.getResponse().then((res) => {
 *   console.info(`${contact.name} is ${res.value ? 'online' : offline}`)
 * })
 * // Probably displays: "Wanis Rowdy is offline"
 */

class Worker {
  /**
   * Create a new Worker.
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
    if (!job.args) job.args = [];
    if (!job.reloads) job.reloads = false;
    if (typeof job.once === 'undefined') job.once = true;
    if (!job.times) {
      job.times = {
        load: 30*1000, // 30 secs
        reload: 30*1000, // 30 secs
        response: 3*1000, // 3 secs
      }
    }

    // important for handling message events
    job.id = `${job.url}::${Date.now()}::${Math.random()}`

    this.job = job    
  }
  
  /** @private */
  load() {
    return new Promise ( (resolve, reject) => {
      this._iframe.src = this.job.url;
      this._iframe.onload = () => resolve(this);
      this._iframe.onerror = this._iframe.onabort = (e) => {
        console.error('Worker::load', e)
        reject(this)
        }
      setTimeout(() => reject(this), this.job.times.load);
      
      Worker.$workers.appendChild(this._iframe);
    })
  }
  
  /**
   * @listens Window:message
   * @private
   */
  launch() {
    return new Promise( (resolve, reject) => {
      // The `job` either causes the iframe to reload...
      if (this.job.reloads) {
        this._iframe.onload = () => resolve(this)
        this._iframe.onerror = this._iframe.onabort = (e) => {
          console.error('Loading error', e)
          reject(this)
        }
        setTimeout( () => reject(this), this.job.times.reload);
      } else { // ... or to send a message/response
        const onMessage = (event) => {
          const data = event.data;
          if (data && data.job && data.job.id === this.job.id) {
            // Perfect, this is the event we were listening to. Remove it now
            window.removeEventListener('message', onMessage, false);
            
            if (data.response && !data.response.error) {
              resolve(data.response)
            } else {
              reject(data.response)
            }
          }
        }
        window.addEventListener('message', onMessage, false);
        /// @todo Delete listener on failure
        setTimeout( () => reject(this), this.job.times.response);
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
      console.error('Worker::getResponse', e)
      res = {}
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
Worker.$workers = document.querySelector('#workers')
