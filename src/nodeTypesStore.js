import Vue from 'vue';
import Vuex from 'vuex';
import { uniqueId, uniqBy } from 'lodash';
import { BOTTOM } from '@/components/rails/explorer-rail/rankConstants';

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    nodeTypes: [],
    pinnedNodeTypes: [],
    filteredNodeTypes: [],
  },
  getters: {
    getNodeTypes: state => state.nodeTypes,
    getPinnedNodeTypes: state => state.pinnedNodeTypes,
    getFilteredNodeTypes: state => state.filteredNodeTypes,
  },
  mutations: {
    setNodeTypes(state, nodeTypes) {
      state.nodeTypes = nodeTypes
        .filter(nodeType => nodeType.control)
        .map(nodeType => ({
          id: uniqueId('nodeType_'),
          type: nodeType.id,
          icon: nodeType.icon,
          label: nodeType.label,
          bpmnType: nodeType.bpmnType,
          rank: nodeType.rank || BOTTOM,
        }))
        .sort((node1, node2) => node1.rank - node2.rank);
    },
    setPinnedNodes(state, payload) {
      state.pinnedNodeTypes.push(payload);
    },
    setUnpinNode(state, payload) {
      state.pinnedNodeTypes = state.pinnedNodeTypes.filter(node => node !== payload);
    },
    setFilteredNodeTypes(state, searchTerm) {
      const pinnedNodeTypes = state.pinnedNodeTypes;
      const nodeTypes = state.nodeTypes;
      const allNodes = uniqBy([...pinnedNodeTypes, ...nodeTypes], 'id');
      state.filteredNodeTypes = allNodes.filter(node => {
        return node.label.toLowerCase().includes(searchTerm.toLowerCase());
      });
    },
    clearFilteredNodes(state) {
      state.filteredNodeTypes = [];
    },
  },
  actions: {
    getUserPinnedObjects({ commit }) {
      if (!window.ProcessMaker.user) {
        return;
      }
      let user = window.ProcessMaker.user ? window.ProcessMaker.user.id : '';
      let nodes = window.ProcessMaker.apiClient.get(`/users/${user}/get_pinnned_controls`)
        .then(() => {
          commit('setPinnedNode', nodes);
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e);
        });
    },
    setUserPinnedObjects({ commit }, pinnedNodes) {
      commit('setPinnedNodes', pinnedNodes);
      if (!window.ProcessMaker.user) {
        return;
      }
      let user = window.ProcessMaker.user ? window.ProcessMaker.user.id : '';
      window.ProcessMaker.apiClient.put(`/users/${user}/update_pinnned_controls`, { pinnedNodes })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e);
        });
    },
  },
});
