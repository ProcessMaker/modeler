import Vue from 'vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import mockProcesses from './mockProcesses.json';

axios.defaults.baseURL = 'https://bpm4.local.processmaker.com/api/1.0/';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.timeout = 5000;


const runningInCypressTest = !!window.Cypress;

if (runningInCypressTest) {
  const mock = new MockAdapter(axios);
  mock.onGet('processes').reply(200, mockProcesses);
}

window.ProcessMaker = {
  navbar: {
    alerts: [],
  },
  EventBus: new Vue(),
  apiClient: axios,
  alert(msg, variant, showValue = 60, stayNextScreen = false) {
    if (showValue === 0) {
      showValue = true;
    }

    window.ProcessMaker.navbar.alerts.push({
      alertText: msg,
      alertShow: showValue,
      alertVariant: String(variant),
      stayNextScreen,
    });

    window.ProcessMaker.EventBus.$emit('alert', window.ProcessMaker.navbar.alerts);
  },
};
