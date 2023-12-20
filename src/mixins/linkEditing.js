import nodeTypesStore from '@/nodeTypesStore';
import { COLOR_DEFAULT } from '@/components/highlightColors.js';
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
    hoveredLinkModel() {
      if (this.hoveredLinkModel) {
        this.originalColor = this.hoveredLinkModel.attr('line/stroke');
        this.originalHoveredLink = this.hoveredLinkModel;
        this.hoveredLinkModel.attr('line/stroke', COLOR_DEFAULT);
      } else {
        this.resetLinkColor();
      }
    }
  },
  computed: {
    draggingNode() {
      return nodeTypesStore.getters.getSelectedNode;
    },
  },
  methods: {
    linkEditingInit() {

      this.paperManager.addEventHandler('cell:mouseover', (view, evt) => {
        if (view && view.model.isLink() && this.addingEligibleItem()) {
          this.hoveredLinkModel = this.linkModel = view.model;
        }
      });

      this.paperManager.addEventHandler('cell:mouseout', (view, evt) => {
        this.hoveredLinkModel = null;
      });
      
      this.paperManager.addEventHandler('element:pointermove', (view, evt) => {
        if (!this.modelCanBisect(view.model)) {
          return;
        }
        let viewFromPoint = this.findViewFromPoint(view, evt);
        if (viewFromPoint && viewFromPoint.model.isLink()) {
          this.hoveredLinkModel = this.linkModel = viewFromPoint.model;
        } else {
          this.hoveredLinkModel = this.linkModel = null;
        }
      });
      
      this.paperManager.addEventHandler('element:pointerup', (view, evt) => {
        if (this.linkModel && this.modelCanBisect(view.model)) {
          this.paperManager.performAtomicAction(() => {
            this.bisectElement(view.model, this.linkModel);
          });
          this.linkModel = null;
        }
      });

      this.$on('node-added', (newNode) => {
        this.bisectNode(newNode);
      });
    },

    findViewFromPoint(elementView, evt) {
      const nodesFromPoint = Array.from(
        document.elementsFromPoint(evt.clientX, evt.clientY)
      );
      while (nodesFromPoint.length > 0) {
        const el = nodesFromPoint.shift();
        const view = this.paper.findView(el);
        if (view && view !== elementView) {
          return view;
        }
      }
      return null;
    },

    isLink(model) {
      return model.component && model.attributes.type === 'standard.Link';
    },

    modelCanBisect(model) {
      const type = model.component?.node?.type;
      return ALLOWED_TYPES.includes(type);
    },

    controlCanBisect(control) {
      return ALLOWED_TYPES.includes(control.type);
    },

    bisectNode(node) {
      if (!this.linkModel) {
        return;
      }

      const nodeId = node.definition.id;
      const element = this.getElementByNodeId(nodeId);

      if (!this.modelCanBisect(element)) {
        return;
      }

      const size = element.size();
      this.paperManager.performAtomicAction(() => {
        element.translate(-Math.round(size.width / 2), -Math.round(size.height / 2));
        this.bisectElement(element, this.linkModel);
        this.$refs.selector.updateSelectionBox();
      });

      this.linkModel = null;
    },

    bisectElement(element, link) {
      const originalTargetElement = link.getTargetCell();

      // Update target of the existing link in the UI
      link.component.setTarget(element);

      const linkDefinition = link.component.node.definition;
      const elementDefinition = element.component.node.definition;
      const originalTargetDefinition = linkDefinition.get('targetRef');
      const originalTargetIncomingNodes = originalTargetDefinition.get('incoming');

      // Remove the existing link from the original target in the bpmn definition
      originalTargetDefinition.set('incoming', originalTargetIncomingNodes.filter(link => link !== linkDefinition));

      // Update the existing link in the bpmn definition to point to our new element
      linkDefinition.set('targetRef', elementDefinition);

      // Update our new element to have the existing link as a target 
      elementDefinition.get('incoming').push(linkDefinition);
      
      // Reset the end waypoint for the existing link to the center of the new element in the bpmn definition
      const linkDiagram = link.component.node.diagram;
      const waypoints = linkDiagram.get('waypoint');

      // Remove the last waypoint
      waypoints.pop();

      // Create a new end waypoint for the existing link
      const newEndWaypoint = this.moddle.create('dc:Point', this.getCenterPosition(element));

      // Add it to the existing link
      linkDiagram.set('waypoint', [
        ...waypoints,
        newEndWaypoint
      ]);

      // User helper to add a new link from our new element to the existing links original original target.
      // This takes care of both the UI and the BPMN definition
      this.newOutgoingLink(element, originalTargetElement);
    },
    
    getCenterPosition(element) {
      const size = element.size();
      const position = element.position();
      return {
        x: position.x + size.width / 2,
        y: position.y + size.height / 2,
      };
    },

    newOutgoingLink(source, target) {
      const flow = new SequenceFlow(this.nodeRegistry, this.moddle, this.paper);
      const waypoints = [
        this.getCenterPosition(source),
        this.getCenterPosition(target),
      ];

      const newFlowNode = flow.makeFlowNode(source, target, waypoints);
      this.addNode(newFlowNode);
    },

    resetLinkColor() {
      if (this.originalHoveredLink) {
        this.originalHoveredLink.attr('line/stroke', this.originalColor);
      }
    },

    addingEligibleItem() {
      if (window.ProcessMaker.addingNewElement) {
        const control = window.ProcessMaker.addingNewElement;
        if (this.controlCanBisect(control)) {
          return true;
        }
      }
      return false;
    }
  },
};