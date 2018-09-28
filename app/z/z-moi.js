Vue.componenet('z-moi', {
  template:`
  <div id="moi">
      <b>{{ me.name }}</b> (<i v-if="me.username ">{{ me.username }}</i>)
      <button @click="toggleStatus()">Toggle Status</button>
  </div>
  `,
  methods: {
    toggleStatus() {
      this.$root.moi.toggleStatus()
    }
  }
})
