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
    explorerOpen: false,
    searchTerm: '',
    selectedNode: null,
    ghostNode: null,
  },
  getters: {
    getNodeTypes: state => state.nodeTypes,
    getPinnedNodeTypes: state => state.pinnedNodeTypes,
    getFilteredNodeTypes: state => state.filteredNodeTypes,
    getExplorerOpen: state => state.explorerOpen,
    getSearchTerm: state => state.searchTerm,
    getSelectedNode: state => state.selectedNode,
    getGhostNode: state => state.ghostNode,
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
          items: nodeType.items?.map(item => ({ ...item, type: item.id })),
        }))
        .sort((node1, node2) => node1.rank - node2.rank);
    },
    setPinnedNodes(state, payload) {
      state.pinnedNodeTypes.push(payload);
      // Remove duplicates
      state.pinnedNodeTypes = [...new Map(state.pinnedNodeTypes.map(node => [node['type'], node])).values()];
      state.pinnedNodeTypes.sort((node1, node2) => node1.rank - node2.rank);
    },
    setUnpinNode(state, payload) {
      state.pinnedNodeTypes = state.pinnedNodeTypes.filter(node => node !== payload);
    },
    setFilteredNodeTypes(state, searchTerm) {
      const pinnedNodeTypes = state.pinnedNodeTypes;
      const nodeTypes = state.nodeTypes;
      state.searchTerm = searchTerm;
      const allNodes = uniqBy([...pinnedNodeTypes, ...nodeTypes], 'id');
      state.filteredNodeTypes = allNodes.filter(node => {
        return node.label.toLowerCase().includes(searchTerm.toLowerCase());
      });
    },
    clearFilteredNodes(state) {
      state.filteredNodeTypes = [];
      state.searchTerm = '';
    },
    closeExplorer(state) {
      state.explorerOpen = false;
    },
    toggleExplorer(state) {
      state.explorerOpen = !state.explorerOpen;
    },
    setSelectedNode(state, payload) {
      state.selectedNode = payload;
    },
    clearSelectedNode(state) {
      state.selectedNode = null;
    },
    setGhostNode(state, payload) {
      state.ghostNode = payload;
    },
  },
  actions: {
    getUserPinnedObjects({ commit }) {
      if (!window.ProcessMaker.user) {
        // For standalone version of Modeler
        const pinnedNodes = localStorage.pinnedNodes ? JSON.parse(localStorage.pinnedNodes) : [] ;
        pinnedNodes.forEach(node => {
          commit('setPinnedNodes', node);
        });
        return;
      }
      const user = window.ProcessMaker.user ? window.ProcessMaker.user.id : '';
      window.ProcessMaker.apiClient.get(`/users/${user}/get_pinnned_controls`)
        .then(({ data }) => {
          data.forEach(node => {
            commit('setPinnedNodes', node);
          });
        })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e);
        });
    },
    addUserPinnedObject({ commit, state }, pinnedNode) {
      commit('setPinnedNodes', pinnedNode);
      const pinnedNodes = state.pinnedNodeTypes;
      if (!window.ProcessMaker.user) {
        // For standalone version of Modeler
        localStorage.pinnedNodes = JSON.stringify(pinnedNodes);
        return;
      }
      const user = window.ProcessMaker.user ? window.ProcessMaker.user.id : '';
      window.ProcessMaker.apiClient.put(`/users/${user}/update_pinned_controls`, { pinnedNodes })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e);
        });
    },
    removeUserPinnedObject({ commit, state }, nodeToUnpin) {
      commit('setUnpinNode', nodeToUnpin);
      const pinnedNodes = state.pinnedNodeTypes;
      if (!window.ProcessMaker.user) {
        // For standalone version of Modeler
        localStorage.pinnedNodes = JSON.stringify(pinnedNodes);
        return;
      }
      const user = window.ProcessMaker.user ? window.ProcessMaker.user.id : '';
      window.ProcessMaker.apiClient.put(`/users/${user}/update_pinned_controls`, { pinnedNodes })
        .catch((e) => {
          // eslint-disable-next-line no-console
          console.error(e);
        });
    },
  },
});