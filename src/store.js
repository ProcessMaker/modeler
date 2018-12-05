import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    nodes: {
      past: [],
      present: null,
      future: [],
    },
  },
  getters: {
    nodes: state => state.nodes.present,
    canUndo: state => state.nodes.past.length > 0,
    canRedo: state => state.nodes.future.length > 0,
  },
  mutations: {
    undo(state) {
      if (state.nodes.past.length > 0) {
        const present = state.nodes.past.pop();
        state.nodes.future.unshift(state.nodes.present);
        state.nodes.present = present;
      }
    },
    redo(state) {
      if (state.nodes.future.length > 0) {
        const present = state.nodes.future.shift();
        state.nodes.past.push(state.nodes.present);
        state.nodes.present = present;
      }
    },
    addNode(state, node) {
      if (state.nodes.present) {
        state.nodes.past.push(state.nodes.present);
        state.nodes.present = [...state.nodes.present, node];

        if (state.nodes.future.length > 0) {
          state.nodes.future = [];
        }
      } else {
        state.nodes.present = [node];
      }
    },
    removeNode(state, node) {
      state.nodes.past.push(state.nodes.present);
      state.nodes.present = state.nodes.present.filter(n => n !== node);

      if (state.nodes.future.length > 0) {
        state.nodes.future = [];
      }
    },
    clearNodes(state) {
      state.nodes = {
        past: [],
        present: null,
        future: [],
      };
    },
  },
});
