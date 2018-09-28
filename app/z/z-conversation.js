Vue.component('conversation', {
  props: ['obj'],
  template: `
  <div>
    <div>
      <message v-for="m in obj.messages" :key="m.id" :obj="m"></message>
      <composer></composer>
    </div>
  </div>
  `
})
