import Vue from 'vue'
import ModelerApp from './ModelerApp.vue'

import VueDragDrop from 'vue-drag-drop';

Vue.use(VueDragDrop);

import BootstrapVue from 'bootstrap-vue'

Vue.use(BootstrapVue);

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

Vue.config.productionTip = false

new Vue({
  render: h => h(ModelerApp)
}).$mount('#modeler-app')
