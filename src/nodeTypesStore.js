import Vue from 'vue';
import Vuex from 'vuex';

Vue.use(Vuex);

export const nodeTypesStore = new Vuex.Store({
  state: {
    nodeTypes: [],
    pinnedNodeTypes: [],
  },
  getters: {
    getNodeTypes: state => state.nodeTypes,
    getPinnedNodeTypes: state => state.pinnedNodeTypes,
  },
  mutations: {
    setNodeTypes(state, payload) {
      state.nodeTypes = payload;
    },
    setPinnedNodes(state, payload) {
      state.pinnedNodeTypes = payload;
    },
  },
  actions: {
    // eslint-disable-next-line no-unused-vars
    getUserPinnedObjects(state) {
      // here goes the axios call to get the user pinned objects
    },
  },
});
