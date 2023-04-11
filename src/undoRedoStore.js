import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    stack: [],
    position: null,
    disabled: false,
    saved: false,
    isVersionsInstalled: false,
    isDraft: false,
    isLoading: false,
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
    saved(state) {
      return state.saved;
    },
    isVersionsInstalled(state) {
      return state.isVersionsInstalled;
    },
    isDraft(state) {
      return state.isDraft;
    },
    isLoading(state) {
      return state.isLoading;
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
    clearStack(state) {
      state.stack = [state.stack[state.stack.length - 1]];
    },
    disableSavingState(state) {
      state.disabled = true;
    },
    enableSavingState(state) {
      state.disabled = false;
    },
    savedState(state, payload) {
      state.saved = payload;
    },
    isVersionsInstalled(state, payload) {
      state.isVersionsInstalled = payload;
    },
    isDraft(state, payload) {
      state.isDraft = payload;
    },
    isLoading(state, payload) {
      state.isLoading = payload;
    },
  },
  actions: {
    pushState({ state, getters, commit }, newState) {
      if (newState === getters.currentState || state.disabled) {
        return;
      }

      commit('setState', newState);
      commit('setPosition', state.stack.length - 1);
    },
    undo({ state, getters, commit }) {
      if (!getters.canUndo) {
        return;
      }

      commit('setPosition', state.position - 1);
    },
    redo({ state, getters, commit }) {
      if (!getters.canRedo) {
        return;
      }

      commit('setPosition', state.position + 1);
    },
    saved({ commit }) {
      commit('savedState', true);

      // Automatically remove the notification after 2 seconds.
      setTimeout(() => {
        commit('savedState', false);
      }, 2000);
    },
    enableVersions({ commit }) {
      commit('isVersionsInstalled', true);
    },
    setVersionIndicator({ commit }, newState) {
      commit('isDraft', newState);
    },
    setLoadingState({ commit }, newState) {
      commit('isLoading', newState);
    },
  },
});
