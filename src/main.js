import Vue from 'vue'
import ModelerApp from './ModelerApp.vue'

import VueDragDrop from 'vue-drag-drop';

Vue.use(VueDragDrop);

Vue.config.productionTip = false

new Vue({
  render: h => h(ModelerApp)
}).$mount('#modeler-app')
