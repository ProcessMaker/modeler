// State
const state = {
  stack: [],
  position: null,
  disabled: false,
};

// Getters
const getters = {
  canUndo(state) {
    return state.position > 0;
  },
  canRedo(state) {
    return state.position < state.stack.length - 1;
  },
  currentState(state) {
    return state.stack[state.position];
  },
};

// Mutations
const mutations = {
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
};

// Actions
const actions = {
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
};

export default {
  state,
  getters,
  mutations,
  actions,
};
