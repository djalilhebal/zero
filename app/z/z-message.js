Vue.component('message', {
  props: ['obj'],
  template: `
  <div class="message" :class="{me: isMine()}">
    <b>{{obj.senderName}}</b><br>{{ obj.text }}
  </div>`,
  methods: {
    isMine() {
      const me = this.$root.profiles[this.$root.myId]
      const sender = this.obj.sender
      return sender === me.id || sender === '@' + me.username
    }
  }
})
