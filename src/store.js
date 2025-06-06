import Vue from 'vue';
import Vuex from 'vuex';
import flatten from 'lodash/flatten';
import uniq from 'lodash/uniq';

Vue.use(Vuex);

function setDefinitionPropertyReactive(definition, key, value) {
  if (Object.hasOwn(definition, key)) {
    definition.set(key, value);
    return;
  }

  delete Object.getPrototypeOf(definition)[key];
  Vue.set(definition, key, value);
}

function removeRef(state, ref, callBack) {
  state.nodes.filter(({ definition }) => (
    definition.$type === 'bpmn:IntermediateCatchEvent' ||
    definition.$type === 'bpmn:StartEvent'
  )
    && definition.eventDefinitions && definition.eventDefinitions.some(callBack)).forEach(({ definition }) => {
    definition.eventDefinitions[0][ref] = null;
  });
}

export default new Vuex.Store({
  state: {
    graph: null,
    paper: null,
    highlightedNodes: [],
    nodes: [],
    rootElements: [],
    autoValidate: false,
    globalProcesses: [],
    allowSavingElementPosition: true,
    copiedElements: [],
    clientLeftPaper: false,
    readOnly: false,
    forDocumenting: false,
    forPrinting: false,
    isMultiplayer: false,
  },
  getters: {
    nodes: state => state.nodes,
    paper: state => state.paper,
    highlightedNodes: state => state.highlightedNodes,
    nodeShape: state => node => {
      return state.graph?.getCells().find(cell => cell.component && cell.component.node === node);
    },
    highlightedShapes: (state, getters) => {
      return getters.highlightedNodes
        .filter(node => node.type !== 'processmaker-modeler-process')
        .map(getters.nodeShape);
    },
    rootElements: state => state.rootElements,
    autoValidate: state => state.autoValidate,
    globalProcesses: state => state.globalProcesses,
    globalProcessEvents: (state, getters) => flatten(getters.globalProcesses.map(process => process.events)),
    allowSavingElementPosition: state => state.allowSavingElementPosition,
    copiedElements: state => state.copiedElements,
    clientLeftPaper: state => state.clientLeftPaper,
    isReadOnly: state => state.readOnly,
    isForDocumenting: state => state.forDocumenting,
    isForPrinting: state => state.forPrinting,
    showComponent: state => !state.readOnly,
    showPanTool: state => state.forDocumenting,
    isMultiplayer: state => state.isMultiplayer,
  },
  mutations: {
    setReadOnly(state, value) {
      state.readOnly = value;
    },
    setForDocumenting(state, value) {
      state.forDocumenting = value;
    },
    setForPrinting(state, value) {
      state.forPrinting = value;
    },
    preventSavingElementPosition(state) {
      state.allowSavingElementPosition = false;
    },
    allowSavingElementPosition(state) {
      state.allowSavingElementPosition = true;
    },
    setAutoValidate(state, autoValidate) {
      state.autoValidate = autoValidate;
    },
    setRootElements(state, rootElements) {
      state.rootElements = rootElements;
    },
    updateNodeBounds(state, { node, bounds }) {
      if (!bounds) {
        return;
      }
      Object.entries(bounds).forEach(([key, val]) => {
        if (key === '$type') {
          return;
        }

        node.diagram.bounds.set(key, val);
      });
    },
    updateNodeProp(state, { node, key, value }) {
      if (key == 'id' && node.definition.id !== value) {
        if (state.nodes.some(node => node.definition.id === value)) {
          return;
        }
      }
      setDefinitionPropertyReactive(node.definition, key, value);
      if (value == null) {
        Vue.delete(node.definition, key);
      }
    },
    clearNodes(state) {
      state.nodes = [];
    },
    highlightNode(state, node) {
      state.highlightedNodes = node ? [node] : [];
    },
    addToHighlightedNodes(state, nodes) {
      const highlightedNodes = uniq([...state.highlightedNodes, ...nodes]);
      const selectedPoolsIds = highlightedNodes
        .filter(node => node.type === 'processmaker-modeler-pool')
        .map(node => node.id);
      state.highlightedNodes = highlightedNodes
        // remove from selection the selected child nodes in the pool
        .filter(node => {
          if (node.pool && node.pool.component.node.id) {
            return !selectedPoolsIds.includes(node.pool.component.node.id);
          }
          return true;
        });
    },
    addNode(state, node) {
      /* Add an unchanging ID that Vue can use to track the component
       * (used in v-for when rendering the node). Relying on the
       * definition ID will cause issues as the user can change the
       * ID of elements. */
      node._modelerId = '_modelerId_' + node.definition.get('id');

      state.nodes.push(node);
    },
    removeNode(state, node) {
      const index = state.nodes.indexOf(node);

      if (index !== -1) {
        state.nodes.splice(index, 1);
      }
    },
    removeMessageRef(state, message) {
      removeRef(state, 'messageRef', ({ messageRef }) => messageRef === message);
    },
    removeSignalRef(state, signal) {
      removeRef(state, 'signalRef', ({ signalRef }) => signalRef === signal);
    },
    setGraph(state, graph) {
      state.graph = graph;
    },
    setPaper(state, paper) {
      state.paper = paper;
    },
    setGlobalProcesses(state, globalProcesses) {
      state.globalProcesses = globalProcesses;
    },
    // Copy Nodes to the clipboard or in this case, to the state
    setCopiedElements(state, elements) {
      state.copiedElements = elements;
    },
    setClientLeftPaper(state, status) {
      state.clientLeftPaper = status;
    },
    enableMultiplayer(state, value){
      state.isMultiplayer = value;
    },
    reset(state, payload){
      Object.assign(state,{
        graph: null,
        paper: null,
        highlightedNodes: [],
        nodes: [],
        rootElements: [],
        autoValidate: false,
        globalProcesses: [],
        allowSavingElementPosition: true,
        copiedElements: [],
        clientLeftPaper: false,
        readOnly: false,
        isMultiplayer: false,
      }, payload);
    },
  },
  actions: {
    async fetchGlobalProcesses({ commit }) {
      try {
        const { data } = await window.ProcessMaker.apiClient.get('processes', {
          params: {
            order_direction: 'asc',
            per_page: 10000,
            status: 'all',
            include: 'events,category',
            simplified_data: true,
          },
        });
        commit('setGlobalProcesses', data.data);
        window.ProcessMaker.globalProcesses = data.data;
      } catch (error) {
        /* Ignore error */
      }
    },
  },
});
