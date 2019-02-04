import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store( {
  state: {
    stack: [],
    position: null,
  },
  getters: {
    canUndo(state) {
      return state.position > 0;
    },
    canRedo(state) {
      return state.position < state.stack.length - 1;
    },
    currentState(state) {
      return state.stack[state.position];
    },
  },
  mutations: {
    setPosition(state, position) {
      state.position = position;
    },
    setState(state, newState) {
      state.stack = state.stack.slice(0, state.position + 1);
      state.stack.push(newState);
    },
  },
  actions: {
    pushState({ state, getters, commit }, newState) {
      if (newState === getters.currentState) {
        return;
      }

      commit('setState', newState);
      commit('setPosition', state.stack.length - 1);
    },
    async undo({ state, getters, commit }) {
      if (!getters.canUndo) {
        return;
      }

      commit('setPosition', state.position - 1);
    },
    async redo({ state, getters, commit }) {
      if (!getters.canRedo) {
        return;
      }

      commit('setPosition', state.position + 1);
    },
  },
});
