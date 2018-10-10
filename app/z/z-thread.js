Vue.component('z-thread', {
  props: ['obj'],
  template: `
  <div class="thread"
      :class="{active: isActive, unread: isUnread }"
      @click="setActive()">
    <div class="name">{{ obj.name }}</div>
    <div class="snippet">{{ obj.snippet }}</div>
    <div class="footer">{{ obj.footer }}</div>
  </div>`,

  computed: {
    isUnread() {
      return !!this.obj._isUnread;
    },
    isActive() {
      return this.obj.id === this.$root.conversations.active;
    }
  },

  methods: {
    setActive() {
      this.$root.conversations.active = this.obj.id;
      this.$root.conversations[this.obj.id].init();
    }
  }
})
