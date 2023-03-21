import Vue from 'vue';
import Vuex from 'vuex';
import store from './modules/store';
import paperManagerStore from './modules/paperManagerStore';
import undoRedoStore from './modules/undoRedoStore';

const debug = process.env.NODE_ENV !== 'production';

Vue.use(Vuex);
export default new Vuex.Store({
  modules: {
    store,
    paperManagerStore,
    undoRedoStore,
  },
  strict: debug,
  plugins: debug ? [Vuex.createLogger()] : [],
});
