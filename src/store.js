import Vue from 'vue';
import Vuex from 'vuex';
import pull from 'lodash/pull';

Vue.use(Vuex);

export const saveDebounce = 300;

export default new Vuex.Store({
  state: {
    graph: null,
    useTemp: false,
    highlightedNode: null,
    undoList: [],
    redoList: [],
    tempAction: null,
    nodes: [],
    batch: false,
    batchActions: [],
  },
  getters: {
    nodes: state => state.nodes,
    canUndo: state => state.undoList.length > 0,
    canRedo: state => state.redoList.length > 0,
    highlightedNode: state => state.highlightedNode,
    nodeShape: state => node => {
      return state.graph.getCells().find(cell => cell.component && cell.component.node === node);
    },
  },
  mutations: {
    undo(state) {
      if (state.undoList.length > 0) {
        state.highlightedNode = null;
        const undoRedo = state.undoList.pop();

        Array.isArray(undoRedo)
          ? undoRedo.forEach(({ undo }) => undo())
          : undoRedo.undo();

        state.redoList.unshift(undoRedo);
      }
    },
    redo(state) {
      if (state.redoList.length > 0) {
        const undoRedo = state.redoList.shift();

        Array.isArray(undoRedo)
          ? undoRedo.forEach(({ redo }) => redo())
          : undoRedo.redo();

        state.undoList.push(undoRedo);
      }
    },
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
      state.undoList = [];
      state.redoList = [];
      state.nodes = [];
    },
    clearRedoList(state) {
      state.redoList = [];
    },
    highlightNode(state, node) {
      state.highlightedNode = node;
    },
    addNode(state, node) {
      state.nodes.push(node);
    },
    unembedNodes(state, nodeShape) {
      nodeShape.getEmbeddedCells().forEach(cell => {
        if (cell.component) {
          cell.component.node.pool = null;
          nodeShape.unembed(cell);
        }
      });
    },
    removeNode(state, node) {
      pull(state.nodes, node);
    },
    useTemp(state) {
      state.useTemp = true;
    },
    commitTemp(state) {
      state.useTemp = false;
      state.redoList = [];
      state.undoList.push(state.tempAction);
      state.tempAction = null;
    },
    purgeTemp(state) {
      state.useTemp = false;
      state.tempAction.undo();
      state.tempAction = null;
    },
    startBatchAction(state) {
      state.batch = true;
    },
    commitBatchAction(state) {
      if (!state.batch) {
        return;
      }

      state.batch = false;

      if (state.batchActions.length > 0) {
        state.undoList.push(state.batchActions);
      }

      state.batchActions = [];
    },
    setGraph(state, graph) {
      state.graph = graph;
    },
  },
  actions: {
    addNode({ commit, state, getters }, node) {
      const undo = () => {
        commit('unembedNodes', getters.nodeShape(node));
        commit('removeNode', node);
      };
      const redo = () => commit('addNode', node);

      redo();

      if (state.useTemp) {
        state.tempAction = { undo, redo };
      } else {
        commit('clearRedoList');
        state.batch
          ? state.batchActions.push({ undo, redo })
          : state.undoList.push({ undo, redo });
      }
    },
    removeNode({ commit, state }, node) {
      const undo = () => commit('addNode', node);
      const redo = () => commit('removeNode', node);
      redo();

      state.batch
        ? state.batchActions.push({ undo, redo })
        : state.undoList.push({ undo, redo });

      commit('clearRedoList');
    },
    updateNodeBounds({ commit, state }, { node, bounds }) {
      /* Nodes may aquire properties that are not 'watched' by undo/redo. So, it's important to
       * spread the old bounds over the previous bounds to ensure this data is not lost during
       * undo. */
      const previousBounds = { ...bounds, ...node.diagram.bounds };

      const undo = () => commit('updateNodeBounds', { node, bounds: previousBounds });
      const redo = () => commit('updateNodeBounds', { node, bounds });
      redo();

      state.batch
        ? state.batchActions.push({ undo, redo })
        : state.undoList.push({ undo, redo });

      commit('clearRedoList');
    },
    updateNodeProp({ commit, state }, { node, key, value }) {
      const previousValue = node.definition.get(key);
      const undo = () => commit('updateNodeProp', { node, key, value: previousValue });
      const redo = () => commit('updateNodeProp', { node, key, value });
      redo();

      state.batch
        ? state.batchActions.push({ undo, redo })
        : state.undoList.push({ undo, redo });

      commit('clearRedoList');
    },
  },
});
