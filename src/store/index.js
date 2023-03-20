import Vue from 'vue';
import Vuex from 'vuex';
import store from './modules/store';
import paperManagerStore from './modules/paperManagerStore';
import undoRedoStore from './modules/undoRedoStore';

Vue.use(Vuex);

export default new Vuex.Store({
  modules: {
    store,
    paperManagerStore,
    undoRedoStore,
  },
});