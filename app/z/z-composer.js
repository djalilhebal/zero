Vue.component('composer', {
  template: `
  <div class="composer">
    <input type="submit" value="send" @click="send()" />
    <input type="text" placeholder="..." />
  </div>`,
  methods: {
    send() {
      console.info(this)
      const id = this.$root.activeConversation
      const text = this.$el.querySelector('input[type="text"]').value
      Conversation.sendText(id, text)
    }
  }
})
