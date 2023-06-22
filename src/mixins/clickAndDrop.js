import nodeTypesStore from '@/nodeTypesStore';

export default {
  data() {
    return {
      wasClicked: false,
      selectedSubmenuItem: null,
      xOffset: 0,
      yOffset: 0,
      helperStyles: {
        backgroundColor:'#ffffff',
        position: 'absolute',
        height: '40px',
        width: '40px',
        zIndex: '10',
        opacity: '0.5',
        pointerEvents: 'none',
      },
      popperType: null,
    };
  },
  methods: {
    onClickHandler(event, control) {
      this.createDraggingHelper(event, control);
      document.addEventListener('mousemove', this.setDraggingPosition);
      this.setDraggingPosition(event);
      // Deselect control on click if same control is already selected
      if (this.selectedItem && (this.selectedItem.type === control.type)) {
        this.deselect();
        return;
      }
      this.wasClicked = true;
      nodeTypesStore.commit('setSelectedNode', control);
      this.$emit('onSetCursor', 'crosshair');
      if (!this.parent) {
        this.popperType = control.type;
      }
      window.ProcessMaker.EventBus.$on('custom-pointerclick', message => {
        window.ProcessMaker.EventBus.$off('custom-pointerclick');
        document.removeEventListener('mousemove', this.setDraggingPosition);
        if (this.movedElement) {
          document.body.removeChild(this.movedElement);
        }
        this.popperType = null;
        this.selectedSubmenuItem = null;
        this.onCreateElement(message);
        nodeTypesStore.commit('clearSelectedNode');
        nodeTypesStore.commit('setGhostNode', null);
        this.$emit('onSetCursor', 'none');
      });
    },
    onCreateElement(event){
      if (this.wasClicked && this.selectedItem) {
        if (this.parent) {
          this.parent = null;
        }
        this.$emit('onCreateElement', { event, control: this.selectedItem });
        this.wasClicked = false;
        event.preventDefault();
      }
    },
    setDraggingPosition({ pageX, pageY }) {
      let tempGhost = this.movedElement;
      if (tempGhost) {
        tempGhost.style.left = `${pageX}px`;
        tempGhost.style.top = `${pageY}px`;
      }
      nodeTypesStore.commit('setGhostNode', tempGhost);
    },
    createDraggingHelper(event, control) {
      if (this.movedElement) {
        document.removeEventListener('mousemove', this.setDraggingPosition);
        document.body.removeChild(this.movedElement);
        nodeTypesStore.commit('setGhostNode', null);
      }
      const sourceElement = event.target;
      nodeTypesStore.commit('setGhostNode', document.createElement('img'));
      let tempGhost = this.movedElement;
      Object.keys(this.helperStyles).forEach((property) => {
        tempGhost.style[property] = this.helperStyles[property];
      });
      tempGhost.src = control.icon;
      nodeTypesStore.commit('setGhostNode', tempGhost);
      document.body.appendChild(this.movedElement);
      this.xOffset = event.clientX - sourceElement.getBoundingClientRect().left;
      this.yOffset = event.clientY - sourceElement.getBoundingClientRect().top;
    },
    deselect() {
      document.removeEventListener('mousemove', this.setDraggingPosition);
      if (this.movedElement) {
        document.body.removeChild(this.movedElement);
      }
      this.$emit('onSetCursor', 'none');
      this.wasClicked = false;
      nodeTypesStore.commit('clearSelectedNode');
      nodeTypesStore.commit('setGhostNode', null);
    },
  },
  computed: {
    selectedItem() {
      return nodeTypesStore.getters.getSelectedNode;
    },
    movedElement() {
      return nodeTypesStore.getters.getGhostNode;
    },
  },
};