import store from '@/store';
import nodeTypesStore from '@/nodeTypesStore';
import { COLOR_DEFAULT } from '@/components/highlightColors.js';
import Node from '@/components/nodes/node';
import SequenceFlow from '@/components/nodes/genericFlow/SequenceFlow';

const ALLOWED_TYPES = [
  'processmaker-modeler-script-task',
  'processmaker-modeler-service-task',
  'processmaker-modeler-task',
];

export default {
  data() {
    return {
      linkModel: null,
      hoveredLinkModel: null,
      originalColor: null,
    };
  },
  watch: {
  },
  computed: {
    draggingNode() {
      return nodeTypesStore.getters.getSelectedNode;
    },
  },
  methods: {
    linkEditingInit() {
      this.paperManager.addEventHandler('cell:mouseover', (cellView) => {
        if (!this.isLink(cellView.model)) {
          return;
        }
        this.hoveredLinkModel = cellView.model;
        this.previewBisect();
      });
      
      this.paperManager.addEventHandler('cell:mouseout', () => {
        this.unPreviewBisect();
        this.hoveredLinkModel = null;
      });
      
      this.$on('nodeAdded', (newNode) => {
        if (this.canBisect(newNode) && this.linkModel) {
          this.bisect(newNode);
        }
      });
    },

    /**
     * Called in Modeler.vue's onMouseUp method
     * 
     * Capture the hovered link model the moment the new node is dropped
     * Otherwise, the mouse could move away while the node is being built
     */
    checkHoveredLink(cellView) {
      if (this.hoveredLinkModel) {
        this.linkModel = this.hoveredLinkModel;
      }
    },

    isLink(model) {
      return model.component && model.attributes.type === 'standard.Link';
    },

    previewBisect() {
      if (!this.draggingNode) {
        return;
      }

      if (!this.hoveredLinkModel) {
        return;
      }

      if (!this.canBisect(this.draggingNode)) {
        return;
      }

      this.originalColor = this.hoveredLinkModel.attr('line/stroke');
      this.hoveredLinkModel.attr('line/stroke', COLOR_DEFAULT);
    },

    unPreviewBisect() {
      if (!this.hoveredLinkModel) {
        return;
      }

      if (this.originalColor) {
        this.hoveredLinkModel.attr('line/stroke', this.originalColor);
        this.originalColor = null;
      }
    },

    canBisect(node) {
      return ALLOWED_TYPES.includes(node.type);
    },

    bisect(node) {
      const nodeId = node.definition.id;
      const cell = this.getElementByNodeId(nodeId);
      const originalTargetCell = this.linkModel.getTargetCell();
      this.linkModel.component.setTarget(cell);
      const size = cell.size();
      cell.translate(-Math.round(size.width / 2), -Math.round(size.height / 2));
      this.$refs.selector.updateSelectionBox();

      this.newOutgoingLink(cell, originalTargetCell);
      this.linkModel = null;
    },

    newOutgoingLink(source, target) {
      const flow = new SequenceFlow(this.nodeRegistry, this.moddle, this.paper);
      const sourcePosition = source.position();
      const sourceSize = source.size();
      const targetPosition = target.position();
      const targetSize = target.size();
      const waypoints = [
        {
          x: sourcePosition.x + sourceSize.width / 2,
          y: sourcePosition.y + sourceSize.height / 2,
        },
        {
          x: targetPosition.x + targetSize.width / 2,
          y: targetPosition.y + targetSize.height / 2,
        }
      ];

      const newFlowNode = flow.makeFlowNode(source, target, waypoints);
      this.addNode(newFlowNode);
    }
  },
};