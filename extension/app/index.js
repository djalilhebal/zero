let moi = null;

const app = new Vue({
  el: '#app',
  data: new Messenger(),

  ready() {
    // set refreshers
    const {threads, contacts, conversation, now} = this.refreshers;
    threads.interval = setInterval(this.updateThreads, threads.EVERY);
    contacts.interval = setInterval(this.updateContacts, contacts.EVERY);
    conversation.interval = setInterval(this.updateActiveConversation, conversation.EVERY);
    now.interval = setInterval(() =>  this.now = Date.now(), now.EVERY);
  },
  
  computed: {
    threads() {
      return Object
        .entries(this.conversations)
        .map(x => x[1])
        .filter( x => x instanceof Conversation)
        .sort( (a, b) => a.index - b.index)
    }
  }, // computed

  methods: {
    async updateMoi() {
      try {
        const res = await Moi.getInfo()
        if (!res.isMoi) {
          throw (res.error || 'Not logged in?')
        }
        moi = new Moi(res)
        this.$set(this, 'moi', moi)
        this.updateThreads()
        moi.update()
        this.updateContacts()
        return {error: null}
      } catch (e) {
        return {error: e.message}
      }
    },

    async updateThreads() {
      if (!moi  || this.refreshers.threads.onprogress) {
        return;
      }

      this.refreshers.threads.onprogress = true
      try {
        const {threads} = await Conversation.getThreads()
        threads.forEach( (thread) => {
          if (this.conversations[thread.id]) {
            this.conversations[thread.id].updateFromThread(thread)
          } else {
            const conv = new Conversation(thread)
            this.$set(this.conversations, conv.id, conv)
          }
        })
      } catch (e) {}
      this.refreshers.threads.onprogress = false
    },

    async updateContacts() {
      if (!moi || !moi.getStatus() || this.refreshers.contacts.onprogress) {
        return;
      }

      this.refreshers.contacts.onprogress = true
      try {
        const {contacts} = await moi.getBuddylist()
        contacts.forEach( (obj) => {
          //TODO Don't replace profiles, just update them
          const profile = new User(obj)
          this.$set(this.profiles, profile.id, profile)
        })
      } catch (e) {}
      this.refreshers.contacts.onprogress = false
    },

    async updateActiveConversation() {
      //TODO Make it work
      if (!moi) return;
      const active = this.conversations.active
      const onprogress = this.refreshers.conversation.onprogress
      if (active && active !== onprogress) {
        this.refreshers.conversation.onprogress = active
        await this.conversations[active].update()
      }
      this.refreshers.conversation.onprogress = ''
    },

  } // methods
})
