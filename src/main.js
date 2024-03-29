import Vue from 'vue';
import i18next from 'i18next';
import VueI18Next from '@panter/vue-i18next';
import ModelerApp from './ModelerApp.vue';
import BootstrapVue from 'bootstrap-vue';
import './setup/initialLoad';
import translations from '@/setup/translations.json';
import * as VueDeepSet from 'vue-deepset';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import ScreenBuilder from '@processmaker/screen-builder';
import { Multiselect } from '@processmaker/vue-multiselect';

import '@fortawesome/fontawesome-free/css/all.min.css';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faBoundaryEvent } from '@/components/crown/crownButtons/icons';

library.add(faBoundaryEvent);

Vue.use(BootstrapVue);
Vue.use(VueDeepSet);
Vue.use(VueI18Next);
Vue.use(ScreenBuilder);
Vue.component('font-awesome-icon', FontAwesomeIcon);
Vue.component('Multiselect', Multiselect);

Vue.config.productionTip = false;

i18next.init({
  lng: 'en',
  resources: { en: { translation: translations } },
});
Vue.mixin({ i18n: new VueI18Next(i18next) });

new Vue({
  render: h => h(ModelerApp),
}).$mount('#modeler-app');
