import Vue from 'vue';
import Vuex from 'vuex';
import uniqueId from 'lodash/uniqueId';

Vue.use(Vuex);

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
      /* Add an unchanging ID that Vue can use to track the component
       * (used in v-for when rendering the node). Relying on the
       * definition ID will cause issues as the user can change the
       * ID of elements. */
      node._modelerId = uniqueId();

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
