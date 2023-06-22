import nodeTypesStore from '@/nodeTypesStore';

export default {
  methods: {
    escapeKeyHandler(event) {
      if (this.selectedNode) {
        event.preventDefault();
        window.ProcessMaker.EventBus.$emit('custom-pointerclick', event);
      }
    },
  },
  computed: {
    selectedNode() {
      return nodeTypesStore.getters.getSelectedNode;
    },
    movedElement() {
      return nodeTypesStore.getters.getGhostNode;
    },
  },
};