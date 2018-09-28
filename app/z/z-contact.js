Vue.component('contact', {
  props: ['obj'],
  template: `
  <div>
    <b :style=" {color: obj.isActive? 'yellow' : 'black' }"> {{ obj.name }}</b>
  </div>`
})
