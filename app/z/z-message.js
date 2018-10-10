Vue.component('z-message', {
  props: ['obj'],
  template: `
  <div class="message" :class="{isMine}" v-if="!obj.hidden" >
    <div class="sender" title="">{{obj.senderName}}</div>
    <div v-if="obj.text" class="content" v-html="obj.text"></div>
    <div v-if="obj.data" class="content"><img v-bind:src="obj.data" /></div>
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
