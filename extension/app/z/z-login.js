Vue.component('z-login', {
  data() {
    return {
      isLoading: true,
      error: null,
    }
  },

  template:`
  <div id="z-login">
    <img src="app/images/logo.jpg" alt="Colorful Dreamcatcher" />
    <div class="loading" v-if="isLoading">lOaDinG~~~</div>
    <div v-if="error !== null">
      <button @click="reload()">Reload</button>
      <div class="error">{{JSON.stringify(error)}}</div>
    </div>
  </div>
  `,

  mounted() {
    this.reload();
  },

  methods: {
    async reload() {
      console.log('Reloading <Moi>');
      this.error = null;
      this.isLoading = true;
      const res = await this.$root.updateMoi();
      if (res.error) this.error = res.error;
      this.isLoading = false;
    }
  }
})
