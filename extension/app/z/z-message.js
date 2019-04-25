Vue.component('z-message', {
  props: ['obj'],
  template: `
  <div
    class="message" :class="{isMine}"
    :title="obj.footer"
    v-if="!obj.hidden"
  >
    <div class="sender">{{obj.senderName}}</div>
    <div class="content">
      <span v-if="obj.text" v-html="obj.text"></span>
      <span v-if="obj.data"><img alt="photo" :src="obj.data" /></span>
    </div>
  </div>`,
  computed: {
    isMine() {
      const moi = this.$root.moi
      const sender = this.obj.sender
      return sender === moi.id || sender === moi.username
    }
  },
  methods: {}
})
