const data = {
  profiles: {
    moi: null,
  },
  conversations: {
    active: null,
  },
  refreshers: {
    threads: {
      EVERY: 30*1000, // 30 sec
    },
    contacts: {
      EVERY: 120*1000, // 2 mins
    },
    conversation: {
      EVERY: 5*1000, // 5 sec
      onprogress: ''
    }
  }
}

const methods = {
  async updateMoi() {
    const res = await Me.getInfo()
    Me.myId = myInfo.id
    const me = new Me(myInfo)
    await me.update()
    data.profiles[me.id] = me
    data.myId = me.id
  },

  async updateConversation() {
    const active = this.conversations.active
    const onprogress = this.refreshers.conversation.onprogress
    if (active && active !== onprogress) {
      this.refreshers.conversation.onprogress = active
      const conversation = this.conversations[active]
      await conversation.update()
    }    
  },

  async updateThreads() {
    const res = await Thread.getThreads()
    const threads = res.threads
    threads.forEach( async (thread) => {
      if (data.conversations[thread.id]) {
        data.conversations[conv.id].updateFrom(conv)
      } else {
        const conv = new Conversation(thread)
        await conv.init()
        app.$set(data.conversations, conv.id, conv)
      }
    })      
  },

  async updateContacts() {
    const res = await Me.getContacts()
    contacts.forEach( (contact) => {
      const profile = new Profile(contact)
      app.$set(data.profiles, profile.id, profile)
    })
  }
}

const app = new Vue({
  el: '#app',
  store,
  methods,
})

async function main() {
  // set refreshers
  methods.updateMoi()
  const {threads, contacts, conversation} = data.refreshers
  threads.interval = setInterval(this.refreshThreads, threads.EVERY)
  contacts.interval = setInterval(this.refreshContacts, contacts.EVERY)
  conversation.interval = setInterval(this.refreshConversation, conversation.EVERY)

}

// let's get rolling!
main()
