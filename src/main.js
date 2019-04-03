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
import i18next from 'i18next';
import VueI18Next from '@panter/vue-i18next';
Vue.config.productionTip = false;

Vue.use(VueI18Next);
i18next.init({lng: 'en'});
Vue.mixin({ i18n: new VueI18Next(i18next) });

new Vue({
  render: h => h(ModelerApp),
}).$mount('#modeler-app');
