import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

const store = new Vuex.Store({
  state: {
    paperManager: null,
  },
  mutations: {
    setPaperManager(state, paperManager) {
      state.paperManager = paperManager;
    },
    changeScale(state, newScale) {
      return state.paperManager.scale = newScale;
    },
  },
});
export default store;