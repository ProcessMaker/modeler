import Vue from 'vue';
import ModelerApp from './ModelerApp.vue';
import BootstrapVue from 'bootstrap-vue';
import './setup/initialLoad';

Vue.use(BootstrapVue);

import * as VueDeepSet from 'vue-deepset';
Vue.use(VueDeepSet);

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import '@fortawesome/fontawesome-free/css/all.min.css';

Vue.config.productionTip = false;

new Vue({
  render: h => h(ModelerApp),
}).$mount('#modeler-app');
