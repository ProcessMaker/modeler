import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const saveDebounce = 300;

export default new Vuex.Store({
  state: {
    graph: null,
    paper: null,
    highlightedNode: null,
    nodes: [],
  },
  getters: {
    nodes: state => state.nodes,
    highlightedNode: state => state.highlightedNode,
    nodeShape: state => node => {
      return state.graph.getCells().find(cell => cell.component && cell.component.node === node);
    },
  },
  mutations: {
    updateNodeBounds(state, { node, bounds }) {
      Object.entries(bounds).forEach(([key, val]) => {
        if (key === '$type') {
          return;
        }

        node.diagram.bounds.set(key, val);
      });
    },
    updateNodeProp(state, { node, key, value }) {
      node.definition.set(key, value);
    },
    clearNodes(state) {
      state.nodes = [];
    },
    highlightNode(state, node) {
      state.highlightedNode = node;
    },
    addNode(state, node) {
      state.nodes.push(node);
    },
    removeNode(state, node) {
      const index = state.nodes.indexOf(node);

      if (index !== -1) {
        state.nodes.splice(index, 1);
      }
    },
    setGraph(state, graph) {
      state.graph = graph;
    },
    setPaper(state, paper) {
      state.paper = paper;
    },
  },
});
