import nodeTypesStore from '@/nodeTypesStore';
import { COLOR_DEFAULT } from '@/components/highlightColors.js';
import SequenceFlow from '@/components/nodes/genericFlow/SequenceFlow';
import store from '@/store';

const ALLOWED_BPMN_TYPES = [
  'bpmn:Task',
  'bpmn:UserTask',
  'bpmn:GlobalTask',
  'bpmn:CallActivity',
  'bpmn:ScriptTask',
  'bpmn:ServiceTask',
];

const ALLOWED_ALTERNATE_TYPES = [
  'processmaker-modeler-task',
  'processmaker-modeler-manual-task',
  'processmaker-modeler-script-task',
  'processmaker-modeler-call-activity',
  'processmaker-modeler-intermediate-catch-timer-event',
  'processmaker-modeler-intermediate-signal-catch-event',
  'processmaker-modeler-intermediate-signal-throw-event',
  'processmaker-modeler-intermediate-message-catch-event',
  'processmaker-modeler-intermediate-message-throw-event',
  'processmaker-modeler-intermediate-conditional-catch-event',
];

export default {
  data() {
    return {
      linkModel: null,
      hoveredLinkModel: null,
      originalHoveredLink: null,
      originalColor: null,
      activeElement: null,
      timeout: null,
      tooltipEl: null,
      clickPosition: null,
      currentMovingModel: null,
      currentMovingModelCanBisect: null,
      currentHover: null,
    };
  },
  watch: {
    hoveredLinkModel() {
      if (this.hoveredLinkModel) {
        this.originalColor = this.hoveredLinkModel.attr('line/stroke');
        this.originalHoveredLink = this.hoveredLinkModel;
        this.hoveredLinkModel.attr('line/stroke', COLOR_DEFAULT);
        this.addElementTooltip();
      } else {
        this.resetLinkColor();
        this.removeElementTooltip();
      }
    },
  },
  computed: {
    ghostNode() {
      return nodeTypesStore.getters.getGhostNode;
    },
  },
  methods: {
    linkEditingInit() {
      this.paperManager.addEventHandler('cell:mouseleave', (view) => {
        if (store.getters.isForDocumenting) {
          window.ProcessMaker.EventBus.$emit('hide-documentation');
          this.currentHover = null;
          view.model.attr({
            doccircle: {
              r: 10,
              stroke: '#2B9DFF',
              strokeWidth: '3',
              fill: '#8DC8FF',
            },
            doclabel: {
              display:'none',
            },
          });
        }
      });

      // Handle hovering a new element on the page
      this.paperManager.addEventHandler('cell:mouseover', (view) => {
        const docElement = view?.model?.component?.node?.definition?.documentation;
        const doc = Array.isArray(docElement)
          ? (docElement[0].text ?? '').trim()
          : (docElement ?? '').trim();

        if (view.cid !== this.currentHover) {
          this.currentHover = view.cid;
        }

        if (doc && store.getters.isForDocumenting) {
          const nodeId = view.model.component.node.id;
          let nodeNumber = -1;
          for (let process of view.model.component.$attrs.processes) {
            nodeNumber = process.flowElements.findIndex(item => item.id === nodeId);
            if (nodeNumber >=0) {
              break;
            }
          }

          if (nodeNumber >= 0) {
            window.ProcessMaker.EventBus.$emit(
              'show-documentation', {
                number: nodeNumber + 1,
                text: doc,
                position: view?.model?.attributes?.position,
                node: view.model.component.node,
                view,
              });
          }

          view.model.attr({
            doccircle: {
              r: 20,
              fill: '#1572C2',
              strokeWidth: 0,
            },
            doclabel: {
              display: 'block',
            },
          });
        }

        if (view?.model?.isLink() && this.addingEligibleItem()) {
          this.timeout = setTimeout(() => {
            this.hoveredLinkModel = view.model;
          }, 1000);
        }
      });
      this.paperManager.addEventHandler('cell:mouseout', () => {
        clearTimeout(this.timeout);
        this.timeout = null;
        if (this.hoveredLinkModel) {
          this.hoveredLinkModel = null;
        }
      });
      
      // Handle hovering an existing element on the page
      this.paperManager.addEventHandler('element:pointermove', (view, evt) => {
        if (!this.canBisectCached(view.model)) {
          return;
        }

        // get any links under the element we're moving
        const viewFromPoint = this.findViewFromPoint(view, evt);
        const model = viewFromPoint?.model;

        if (model?.isLink()) {
          if (this.hoveredLinkModel !== model && !this.timeout) {
            this.timeout = setTimeout(() => {
              this.hoveredLinkModel = model;
              this.linkModel = model;
              this.activeElement = view.model;
            }, 1000);
          }
        } else {
          clearTimeout(this.timeout);
          this.timeout = null;
          if (this.hoveredLinkModel) {
            this.hoveredLinkModel = null;
            this.linkModel = null;
            this.activeElement = null;
          }
        }
      });
      
      // Handle dropping an existing element on the page
      this.paperManager.addEventHandler('element:pointerup', (view, evt) => {
        if (this.linkModel && this.canBisect(view.model)) {
          this.clickPosition = { x: evt.clientX, y: evt.clientY };
          this.paperManager.performAtomicAction(() => {
            this.bisectElement(view.model, this.linkModel);
            this.hoveredLinkModel = null;
            this.linkModel = null;
            this.activeElement = null;
          });
        }
      });

      // Handle dropping a new element on the page
      this.$on('node-added', (newNode) => {
        this.bisectNode(newNode);
      });

      // We need to save the hovered link because the mouse could move
      // before the node is created
      window.ProcessMaker.EventBus.$on('capture-hovered-link', (evt) => {
        this.clickPosition = { x: evt.clientX, y: evt.clientY };
        this.linkModel = this.hoveredLinkModel;
      });
    },

    findViewFromPoint(elementView, evt) {
      const nodesFromPoint = Array.from(
        document.elementsFromPoint(evt.clientX, evt.clientY),
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

    canBisect(controlOrModel) {
      const bpmnTypes = this.getBpmnTypes(controlOrModel);
      const allowedByBpmnType = bpmnTypes.some(type => ALLOWED_BPMN_TYPES.includes(type));

      if (allowedByBpmnType) {
        return true;
      }

      // Sometimes the bpmn type is not set, so check for a type in the config 
      const alternateType = this.getAlternateType(controlOrModel);
      return ALLOWED_ALTERNATE_TYPES.includes(alternateType);
    },

    canBisectCached(model) {
      let canBisect = false;
      if (this.currentMovingModel === model) {
        canBisect = this.currentMovingModelCanBisect;
      } else {
        canBisect = this.canBisect(model);
        this.currentMovingModel = model;
        this.currentMovingModelCanBisect = canBisect;
      }

      return canBisect;
    },

    getBpmnTypes(item) {
      let nodeDefinitionType = item.component?.node?.definition?.$type;
      let controlTypes = item.bpmnType || [];
      if (!Array.isArray(controlTypes)) {
        controlTypes = [controlTypes];
      }
      if (nodeDefinitionType) {
        return [nodeDefinitionType];
      }
      return controlTypes;
    },

    getAlternateType(item) {
      if (item.type) {
        return item.type;
      }
      return item.component?.node?.type;
    },

    bisectNode(node) {
      if (!this.linkModel) {
        return;
      }

      const nodeId = node.definition.id;
      const element = this.getElementByNodeId(nodeId);

      if (!this.canBisect(element)) {
        return;
      }

      const size = element.size();
      this.paperManager.performAtomicAction(() => {
        element.translate(-Math.round(size.width / 2), -Math.round(size.height / 2));
        this.bisectElement(element, this.linkModel);
        this.$refs.selector.updateSelectionBox();
      });

      this.hoveredLinkModel = null;
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


      // Handle splitting vertices
      let vertices = link.vertices();
      const linkView = this.paper.findViewByModel(link);
      const localClick = this.paper.clientToLocalPoint(this.clickPosition);
      let nearestVertex = linkView.getVertexIndex(localClick.x, localClick.y);
      if (vertices.length > 0) {
        nearestVertex--;
      }

      // Add vertices after the drop point to the new link
      const newVertices = [];
      vertices.forEach((vertex, index) => {
        if (index > nearestVertex) {
          newVertices.push(vertex);
        }
      });

      // Remove new vertices from the existing link
      let vertexToRemove = nearestVertex + 1;
      while (vertices.length > vertexToRemove) {
        link.removeVertex(vertexToRemove);
        vertices = link.vertices();
      }

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
        newEndWaypoint,
      ]);

      // User helper to add a new link from our new element to the existing links original original target.
      // This takes care of both the UI and the BPMN definition
      this.newOutgoingLink(element, originalTargetElement, newVertices);
    },
    
    getCenterPosition(element) {
      const size = element.size();
      const position = element.position();
      return {
        x: position.x + size.width / 2,
        y: position.y + size.height / 2,
      };
    },

    newOutgoingLink(source, target, newVertices) {
      const waypointsFromVertices = newVertices.map(vertex => {
        return {
          x: vertex.x,
          y: vertex.y,
        };
      });
      const flow = new SequenceFlow(this.nodeRegistry, this.moddle, this.paper);
      const waypoints = [
        this.getCenterPosition(source),
        ...waypointsFromVertices,
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
      const addingNewElement = nodeTypesStore.getters.getSelectedNode;
      if (addingNewElement) {
        if (this.canBisect(addingNewElement)) {
          return true;
        }
      }
      return false;
    },

    addElementTooltip() {
      const el = document.createElement('div');
      el.innerHTML = this.$t('Drop to add to this flow');
      el.classList.add('element-tooltip');
      document.body.appendChild(el);
      document.addEventListener('mousemove', this.setTooltipPosition);

      el.style.zIndex = '9999';

      this.tooltipEl = el;
      this.setTooltipPosition();
    },

    setTooltipPosition() {
      let left = 0;
      let top = 0;

      if (this.activeElement) { // Moving an existing element

        const elementPosition = this.activeElement.position();
        const elementSize = this.activeElement.size();
        const bottomCenter = {
          x: elementPosition.x + elementSize.width / 2,
          y: elementPosition.y + elementSize.height,
        };
        const realBottomCenter = this.paper.localToClientPoint(bottomCenter);

        const tooltipTopCenter = {
          x: realBottomCenter.x - this.tooltipEl.offsetWidth / 2,
          y: realBottomCenter.y + 10,
        };

        left = tooltipTopCenter.x;
        top = tooltipTopCenter.y;

      } else if (this.ghostNode) { // Creating a new element

        const bottomCenter = {
          x: this.ghostNode.offsetLeft + (this.ghostNode.offsetWidth / 2),
          y: this.ghostNode.offsetTop + this.ghostNode.offsetHeight,
        };

        const tooltipTopCenter = {
          x: bottomCenter.x - this.tooltipEl.offsetWidth / 2,
          y: bottomCenter.y + 10,
        };

        left = tooltipTopCenter.x;
        top = tooltipTopCenter.y;

      }

      this.tooltipEl.style.left = left + 'px';
      this.tooltipEl.style.top = top + 'px';
    },

    removeElementTooltip() {
      if (this.tooltipEl) {
        document.removeEventListener('mousemove', this.setTooltipPosition);
        document.body.removeChild(this.tooltipEl);
        this.tooltipEl = null;
      }
    },
  },
};