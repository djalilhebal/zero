Vue.componenet('z-login', {
  data: () => {
    return {
      isLoading: true,
      error: null,
    }
  },
  template:`
  <div id="z-login" v-if="!isLoggedIn()">
    <img src="imgs/icon.png" alt="Colorful Dreamcatcher" />
    <div v-if="isLoading">
      <h1>lOaDinG~~~</h1>
    </div>
    <div v-if="error !== null">
      <p class="error">{{error}}</p>
      <button @click="reload()">Reload</button>
    </div>
  </div>
  `,
  methods: {
    reload() {
      this.error = null
      this.isLoading = true
      $store.me.updateMe()
    }
  }
})
