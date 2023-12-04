import nodeTypesStore from '@/nodeTypesStore';
import iconHelper from '@/mixins/iconHelper';

export default {
  mixins: [iconHelper],
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
      }

      const isSvgIcon = this.containsSvg(control.icon);
      const tempGhost = isSvgIcon ? document.createElement('img') : document.createElement('i');

      Object.assign(tempGhost.style, this.helperStyles);

      // Set the appropriate attribute or property based on the control icon type
      if (isSvgIcon) {
        tempGhost.src = control.icon;
      } else {
        tempGhost.setAttribute('class', control.icon);
        tempGhost.style.fontSize = '42px';
        tempGhost.style.width = '42px';
        tempGhost.style.height = '42px';
      }

      document.body.appendChild(tempGhost);
      nodeTypesStore.commit('setGhostNode', tempGhost);
    
      const sourceElement = event.target;
      this.xOffset = event.clientX - sourceElement.getBoundingClientRect().left;
      this.yOffset = event.clientY - sourceElement.getBoundingClientRect().top;
    },
    deselect() {
      window.ProcessMaker.EventBus.$off('custom-pointerclick');
      document.removeEventListener('mousemove', this.setDraggingPosition);
      if (this.movedElement) {
        document.body.removeChild(this.movedElement);
      }
      this.$emit('onSetCursor', 'none');
      this.wasClicked = false;
      nodeTypesStore.commit('clearSelectedNode');
      nodeTypesStore.commit('setGhostNode', null);
    },
    /**
     * The user mouse-down'd inside the panel so this *might* be a
     * click-and-drag event. Set mouseDownDrag to true and fire
     * the onClickHandler (previously, this is what the click event did).
     */
    startDragNewObject(e, control) {
      window.ProcessMaker.mouseDownDrag = true;
      this.onClickHandler(e, control);
    },
    /**
     * The user mouse-up'd inside the panel so this is a
     * click-move-click event, not a click-and-drag event.
     * 
     * Also used by the Pin buttons so we don't trigger a new element
     * when they are clicked/dragged.
     */
    cancelDragNewObject() {
      window.ProcessMaker.mouseDownDrag = false;
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