import Vue from 'vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import mockProcesses from './mockProcesses.json';
import mockSignals from './mockSignals.json';
import mockProcessSvg from './mockProcessSvg';

axios.defaults.baseURL = 'https://bpm4.local.processmaker.com/api/1.0/';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.timeout = 5000;

const mock = new MockAdapter(axios);
mock.onGet('processes').reply(200, mockProcesses);
mock.onGet('signals').reply(200, mockSignals);
mock.onGet(/\/processes\/\d+/).reply((config) => {
  if (config.url === '/processes/13') {
    return new Promise((resolve) => {
      setTimeout(() => resolve([500]), 1000);
    });
  }

  const regex = /processes\/(\d+)/g;
  const matches = regex.exec(config.url);
  const requestedId = matches[1];
  const process = mockProcesses.data.find(p => p.id === parseInt(requestedId));

  return new Promise((resolve) => {
    setTimeout(() => resolve([200, { svg: mockProcessSvg, ...process }]), 1000);
  });
});

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
  modeler: {
    process: {
      id: 1,
    },
  },
};
