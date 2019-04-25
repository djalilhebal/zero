Vue.component('z-contact', {
  props: ['obj'],
  template: `
  <div class="contact" :class=" { isActive: obj.isActive }">
    <div class="icon"></div>
    <div class="name">{{ obj.name }}</div>
    <div v-if="obj.altName" class="altname">"{{ obj.altName }}"</div>
    <div v-if="obj.username" class="username"> {{ obj.username }}</div>
  </div>`
})

Vue.component('z-moi',{
  props: ['moi'],
  template:`
  <div id="moi">
    <div class="logo"></div>
    <h2><< Moi >></h2>
    <div class="name">{{ moi.name }}</div>
    <div v-if="moi.altName" class="altname">"{{ moi.altName }}"</div>
    <div v-if="moi.username" class="username"> {{ moi.username }}</div>
    <br/>
    Status: {{ moi.status? 'active' : 'inactive' }}
    <button @click="toggleStatus()">Toggle</button>
  </div>
  `,
  methods: {
    async toggleStatus() {
      const $button = this.$el.querySelector('button')
      $button.setAttribute('disabled', true)
      try {
        await this.$root.moi.setStatus(!this.$root.moi.status)
      } catch(e) {}
      $button.removeAttribute('disabled')
    }
  }
})
