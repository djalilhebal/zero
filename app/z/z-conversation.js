Vue.component('z-conversation', {
  props: ['conv'],

  template: `
  <div class="conversation">
    <div class="messages">
      <div v-if="conv && conv.messages">
        <z-message v-for="m in conv.messages" :key="m.id" :obj="m"></z-message>
        <z-message v-for="m in conv.outbox" :key="m.id" :obj="m"></z-message>
        <div class="composer">
          <textarea placeholder="..."></textarea>
          <button>Send!</button>
        </div>
      </div>
    </div>
  </div>`,

  mounted() {
    if (this.conv instanceof Conversation)
      this.conv.init()
  },

  methods: {
    send() { // in composer
      const text = this.$el.querySelector('input[type="text"]').value
      this.conv.sendText(text)
    }
  }
})
