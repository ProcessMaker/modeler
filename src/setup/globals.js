import Vue from 'vue';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import mockProcesses from './mockProcesses.json';

axios.defaults.baseURL = 'https://bpm4.local.processmaker.com/api/1.0/';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.timeout = 5000;

const mock = new MockAdapter(axios);
mock.onGet('processes').reply(200, mockProcesses);

window.ProcessMaker = { EventBus: new Vue(), apiClient: axios };
