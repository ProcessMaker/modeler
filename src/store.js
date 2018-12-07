import Vue from 'vue';
import Vuex from 'vuex';
import update from 'immutability-helper';

Vue.use(Vuex);

export const saveDebounce = 300;

export default new Vuex.Store({
  state: {
    highlightedNodeIndex: null,
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
    highlightedNode: state => state.nodes.present && state.nodes.present[state.highlightedNodeIndex],
  },
  mutations: {
    undo(state) {
      if (state.nodes.past.length > 0) {
        state.nodes.future.unshift(state.nodes.present);
        state.nodes.present = state.nodes.past.pop();
      }
    },
    redo(state) {
      if (state.nodes.future.length > 0) {
        state.nodes.past.push(state.nodes.present);
        state.nodes.present = state.nodes.future.shift();
      }
    },
    updateNodes(state, nodes) {
      if (state.nodes.present) {
        state.nodes.past.push(state.nodes.present);
        state.nodes.present = nodes;

        if (state.nodes.future.length > 0) {
          state.nodes.future = [];
        }
      } else {
        state.nodes.present = nodes;
      }
    },
    clearNodes(state) {
      state.nodes = {
        past: [],
        present: null,
        future: [],
      };
    },
    highlightNode(state, node) {
      state.highlightedNodeIndex = state.nodes.present && state.nodes.present.indexOf(node);
    },
    revertAction(state) {
      state.nodes.present = state.nodes.past.pop();
    },
  },
  actions: {
    addNode({ commit, state }, node) {
      const newNodes = state.nodes.present
        ? update(state.nodes.present, { $push: [node] })
        : [node];
      commit('updateNodes', newNodes);
    },
    removeNode({ commit, state }, node) {
      const nodeIndex = state.nodes.present.indexOf(node);
      const newNodes = update(state.nodes.present, { $splice: [[nodeIndex, 1]] });
      commit('updateNodes', newNodes);
    },
    updateNodePosition({ commit, state }, { node, position }) {
      const nodeIndex = state.nodes.present.indexOf(node);
      const newNodes = update(state.nodes.present, {
        [nodeIndex]: {
          diagram: {
            bounds: {
              x: { $set: position.x },
              y: { $set: position.y },
            },
          },
        },
      });

      commit('updateNodes', newNodes);
    },
    updateNodeProp({ commit, state }, { node, key, value }) {
      const nodeIndex = state.nodes.present.indexOf(node);
      const newNodes = update(state.nodes.present, {
        [nodeIndex]: {
          definition: { [key]: { $set: value } },
        },
      });

      commit('updateNodes', newNodes);
    },
  },
});
