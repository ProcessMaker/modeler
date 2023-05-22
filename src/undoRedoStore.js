import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    transaction: null,
    transactionResolve: null,
    transactionReject: null,
    transactionState: null,
    stack: [],
    position: null,
    disabled: false,
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
    startTransaction(state) {
      state.transaction = new Promise((resolve, reject) => {
        state.transactionResolve = resolve;
        state.transactionReject = reject;
      });
    },
    updateTransaction(state, getNewState) {
      state.transactionResolve();
      state.transactionState = getNewState;
    },
    resetState(state, newState) {
      state.stack = [ newState ];
      state.position = 0;
    },
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
    async undoRedoTransaction({ commit, state, getters }, callBack) {
      // eslint-disable-next-line no-console
      console.log('start transaction');
      commit('startTransaction');
      const transaction = state.transaction;
      callBack();
      // wait 500ms for all updates(save-state) to be done
      await new Promise(resolve => setTimeout(resolve, 500));
      await transaction;
      const getNewState = state.transactionState;
      const newState = await getNewState();
      // eslint-disable-next-line no-console
      console.log('commit state');
      if (newState === getters.currentState) {
        return;
      }
      commit('setState', newState);
      commit('setPosition', state.stack.length - 1);
    },
    loadXML({ commit }, newState) {
      commit('resetState', newState);
    },
    async pushState({ commit }, getNewState) {
      // eslint-disable-next-line no-console
      console.log('- update state');
      commit('updateTransaction', getNewState);
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
    enableVersions({ commit }) {
      commit('isVersionsInstalled', true);
    },
    setVersionIndicator({ commit }, value) {
      commit('isDraft', value);
    },
    setLoadingState({ commit }, value) {
      commit('isLoading', value);
    },
  },
});
