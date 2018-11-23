import Vue from 'vue';
import axios from 'axios';

axios.defaults.baseURL = 'https://bpm4.local.processmaker.com/api/1.0/';
axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
axios.defaults.timeout = 5000;

window.ProcessMaker = { EventBus: new Vue(), apiClient: axios };
