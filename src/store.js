import Vue from 'vue';
import Vuex from 'vuex';
import update from 'immutability-helper';
import pull from 'lodash/pull';
import clone from 'lodash/clone';

Vue.use(Vuex);

export const saveDebounce = 300;

export default new Vuex.Store({
  state: {
    highlightedNodeIndex: null,
    undoList: [],
    redoList: [],
    nodes: [],
  },
  getters: {
    nodes: state => state.nodes,
    canUndo: state => state.undoList.length > 0,
    canRedo: state => state.redoList.length > 0,
    highlightedNode: state => state.nodes && state.nodes[state.highlightedNodeIndex],
  },
  mutations: {
    undo(state) {
      if (state.undoList.length > 0) {
        const undoRedo = state.undoList.pop();
        undoRedo.undo();
        state.redoList.unshift(undoRedo);
      }
    },
    redo(state) {
      if (state.redoList.length > 0) {
        const undoRedo = state.redoList.shift();
        undoRedo.redo();
        state.undoList.push(undoRedo);
      }
    },
    updateNodeBounds(state, { node, bounds }) {
      for (const key in bounds) {
        node.diagram.bounds.set(key, bounds[key]);
      }
    },
    updateNodeProp(state, { node, key, value }) {
      node.definition.set(key, value);
    },
    clearNodes(state) {
      state.undoList = [];
      state.redoList = [];
      state.nodes = [];
    },
    clearRedoList(state) {
      state.redoList = [];
    },
    highlightNode(state, node) {
      state.highlightedNodeIndex = state.nodes && state.nodes.indexOf(node);
    },
    revertAction(state) {
      state.undoList.pop();
    },
    addNode(state, node) {
      state.nodes.push(node);
    },
    removeNode(state, node) {
      pull(state.nodes, node);
    },
  },
  actions: {
    addNode({ commit, state }, node) {
      commit('clearRedoList');
      const undo = () => commit('removeNode', node);
      const redo = () => commit('addNode', node);
      redo();
      state.undoList.push({ undo, redo });
    },
    removeNode({ commit, state }, node) {
      commit('clearRedoList');
      const undo = () => commit('addNode', node);
      const redo = () => commit('removeNode', node);
      redo();
      state.undoList.push({ undo, redo });
    },
    updateNodeBounds({ commit, state }, { node, bounds }) {
      commit('clearRedoList');
      const previousBounds = { ...node.diagram.bounds };
      const undo = () => commit('updateNodeBounds', { node, bounds: previousBounds });
      const redo = () => commit('updateNodeBounds', { node, bounds });
      redo();
      state.undoList.push({ undo, redo });
    },
    updateNodeProp({ commit, state }, { node, key, value }) {
      commit('clearRedoList');
      const previousValue = node.definition.get(key);
      const undo = () => commit('updateNodeProp', { node, key, value: previousValue });
      const redo = () => commit('updateNodeProp', { node, key, value });
      redo();
      state.undoList.push({ undo, redo });
    },
  },
});
