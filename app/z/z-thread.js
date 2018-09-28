Vue.component('thread', {
  props: ['obj'],
  template: `
  <div @click="setActive()" :class="{active: obj.isActive, unread: obj.getUnreadCount() }">
    <b class="name">{{ obj.name }}</b>
    <br>
    <i class="snippet">{{ obj.snippet }}</i>
  </div>`,
  methods: {
    setActive() {
      this.$root.activeConversation = this.obj.id
    }
  }
})
