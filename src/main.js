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
import i18n from './i18n';

Vue.config.productionTip = false;

new Vue({
  i18n,
  render: h => h(ModelerApp),
}).$mount('#modeler-app');
