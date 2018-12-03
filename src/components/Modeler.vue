<template>
  <div class="modeler">
    <div class="modeler-container">
      <controls :controls="controls"/>

      <div ref="paper-container" class="paper-container" :class="cursor">
        <drop @drop="handleDrop" @dragover="validateDropTarget">
          <div ref="paper"/>
        </drop>
      </div>

      <div class="inspector">
        <vue-form-renderer
          ref="inspector"
          :data="inspectorData"
          @update="inspectorHandler"
          :config="inspectorConfig"
        />
      </div>
    </div>

    <component
      v-for="(node, id) in nodes"
      :is="node.type"
      :key="id"
      :graph="graph"
      :paper="paper"
      :node="node"
      :id="id"
      :highlighted="highlighted && highlighted.model.component === node.component"
      :collaboration="collaboration"
      :process-node="processNode"
      :processes="processes"
      :plane-elements="planeElements"
      @add-node="addNode"
      @remove-node="removeNode"
      @set-cursor="cursor = $event"
      @set-pool-target="poolTarget = $event"
    />
  </div>
</template>

<script>
import Vue from 'vue';
import BpmnModdle from 'bpmn-moddle';
import controls from './controls';
import { highlightPadding } from '@/mixins/crownConfig';
import uniqueId from 'lodash/uniqueId';
import pull from 'lodash/pull';
import { startEvent } from '@/components/nodes';

// Our renderer for our inspector
import { Drag, Drop } from 'vue-drag-drop';

// Bring in our own form controls
import {
  FormInput,
  FormSelect,
  FormTextArea,
  FormCheckbox,
  FormRadioButtonGroup,
  FormCodeEditor,
} from '@processmaker/vue-form-elements';

import processInspectorConfig from './inspectors/process';
import sequenceExpressionInspectorConfig from './inspectors/sequenceExpression';

import { VueFormRenderer, renderer } from '@processmaker/vue-form-builder';

import { id as poolId } from './nodes/pool';
import { id as laneId } from './nodes/poolLane/';

// Register those components
Vue.component('FormText', renderer.FormText);
Vue.component('FormInput', FormInput);
Vue.component('FormSelect', FormSelect);
Vue.component('FormTextArea', FormTextArea);
Vue.component('FormCheckbox', FormCheckbox);
Vue.component('FormRadioButtonGroup', FormRadioButtonGroup);
Vue.component('FormCodeEditor', FormCodeEditor);
Vue.component('VueFormRenderer', VueFormRenderer);

const version = '1.0';

if (!window.joint) {
  window.joint = require('jointjs');
}

export default {
  components: {
    Drag,
    Drop,
    controls,
  },
  data() {
    return {
      /* Custom parsers for handling certain bpmn node types */
      parsers: {},

      // What bpmn moddle extensions should we register
      extensions: [],
      // Our controls/nodes to show in our palette
      controls: {},
      // Our node types, keyed by the id
      nodeRegistry: {},
      // Our jointjs data graph model
      graph: null,
      // Our jointjs paper
      paper: null,
      definitions: null,
      context: null,
      planeElements: null,
      canvasDragPosition: null,
      // This is our id based lookup model
      inspectors: {
        process: processInspectorConfig,
      },
      processNode: null,
      // Each type/control in our modeler has it's own inspector configuration
      inspectorConfigurations: {},
      inspectorNode: null,
      inspectorData: null,
      inspectorHandler: () => {},
      highlighted: null,
      inspectorConfig: [
        {
          name: 'Empty',
          items: [],
        },
      ],
      sequenceExpressionInspectorConfig,
      nodes: {},
      collaboration: null,
      moddle: null,
      dragPoint: { x: null, y: null },
      allowDrop: true,
      poolTarget: null,
      processes: [],
      cursor: null,
    };
  },
  watch: {
    // When assigning to a new inspectorNode, it's important to
    // create a new inspectorData that will be a "clean" object.
    // But we also need to avoid circular references. In bpmn-moddle, this is usually brought
    // on by parent
    inspectorNode() {
      const type =
        this.nodes[this.inspectorNode.id] &&
        this.nodes[this.inspectorNode.id].type;

      this.inspectorData =
        type && this.nodeRegistry[type].inspectorData
          ? this.nodeRegistry[type].inspectorData(this.inspectorNode)
          : Object.entries(this.inspectorNode).reduce((data, [key, value]) => {
            data[key] = value;
            return data;
          }, {});
    },
  },
  methods: {
    /**
     * Register an inspector component to configure extended attributes and elements
     * for specific bpmn extensions and execution environments. If the inspector
     * component is already registered, it is replaced by the new one.
     */
    registerInspectorExtension(node, config) {
      const registeredIndex = node.inspectorConfig[0].items.findIndex(item => {
        return config.id && config.id === item.id;
      });
      if (registeredIndex === -1) {
        node.inspectorConfig[0].items.push(config);
      } else {
        node.inspectorConfig[0].items[registeredIndex] = config;
      }
    },
    /**
     * Register a BPMN Moddle extension in order to support extensions to the bpmn xml format.
     * This is used to support new attributes and elements that would be needed for specific
     * bpmn execution environments.
     */
    registerBpmnExtension(namespace, extension) {
      this.extensions[namespace] = extension;
    },
    // This registers a node to use in the bpmn modeler
    registerNode(nodeType, parser) {
      const defaultParser = () => nodeType.id;

      this.inspectorConfigurations[nodeType.id] = nodeType.inspectorConfig;
      this.nodeRegistry[nodeType.id] = nodeType;

      Vue.component(nodeType.id, nodeType.component);

      if (nodeType.control) {
        // Register the control for our control palette
        if (!this.controls[nodeType.category]) {
          this.$set(this.controls, nodeType.category, []);
        }

        this.controls[nodeType.category].push({
          type: nodeType.id,
          icon: nodeType.icon,
          label: nodeType.label,
        });
      }

      this.parsers[nodeType.bpmnType]
        ? this.parsers[nodeType.bpmnType].push(parser || defaultParser)
        : this.parsers[nodeType.bpmnType] = [parser || defaultParser];
    },
    // Parses our definitions and graphs and stores them in our id based lookup model
    parse() {
      // Get the top level objects
      // All root elements are either bpmn:process or bpmn:collaboration types
      // There should only be one collaboration

      this.collaboration = this.definitions.rootElements.find(({ $type }) => $type === 'bpmn:Collaboration');
      this.processes = this.definitions.rootElements.filter(({ $type }) => $type === 'bpmn:Process');

      /* Get the diagram; there should only be one diagram. */
      this.plane = this.definitions.diagrams[0].plane;
      this.planeElements = this.plane.get('planeElement');

      this.processNode = this.processes[0];
      this.inspectorConfig = this.inspectors['process'];
      this.inspectorNode = this.processNode;

      /* Add any pools */
      if (this.collaboration) {
        this.collaboration.get('participants').forEach(this.setNode);
      }

      /* Iterate through all elements in each process. */
      this.processes.forEach(process => {
        /* Add any lanes */
        if (process.get('laneSets')[0]) {
          process.laneSets[0].lanes.forEach(this.setNode);
        }

        /* Add all other elements */
        process.get('flowElements').forEach(this.setNode);
        process.get('artifacts').forEach(this.setNode);
      });
    },
    setNode(definition) {
      const type = this.parsers[definition.$type].reduce((type, parser) => {
        return parser(definition) || type;
      }, null);

      if (!type) {
        throw new Error(`Unsupported element type in parse: ${definition.$type}`);
      }

      const unnamedElements = ['bpmn:TextAnnotation'];
      const requireName = unnamedElements.indexOf(definition.$type) === -1;
      if (requireName && !definition.get('name')) {
        definition.set('name', '');
      }

      /* Get the diagram element for the corresponding flow element node. */
      const diagram = this.planeElements.find(diagram => diagram.bpmnElement.id === definition.id);

      this.$set(this.nodes, definition.id, {
        type,
        definition,
        diagram,
      });
    },
    loadXML(xml) {
      this.nodes = {};
      this.moddle.fromXML(xml, (err, definitions, context) => {
        if (!err) {
          // Update definitions export to our own information
          definitions.exporter = 'ProcessMaker Modeler';
          definitions.exporterVersion = version;
          this.definitions = definitions;
          this.context = context;
          this.initializeUniqueId(context);
          this.parse();
          this.$emit('parsed');
        }
      });
    },
    toXML(cb) {
      this.moddle.toXML(this.definitions, { format: true }, cb);
    },
    handleDrop(transferData, event) {
      if (!this.allowDrop) {
        return;
      }

      const type = transferData.type;

      // Add to our processNode
      const definition = this.nodeRegistry[type].definition(this.moddle);

      // Now, let's modify planeElement
      const diagram = this.nodeRegistry[type].diagram(this.moddle);

      // Handle transform
      diagram.bounds.x = event.offsetX - this.paper.options.origin.x;
      diagram.bounds.y = event.offsetY - this.paper.options.origin.y;

      // Our BPMN models are updated, now add to our nodes
      // @todo come up with random id
      this.addNode({ type, definition, diagram });
    },
    addNode({ type, definition, diagram }) {
      /*
       * If we are adding a pool, first, create a bpmn:Collaboration, or get the current bpmn:Collaboration,
       * if one exists.
       *
       * For each process, bpmn:Collaboration will contain a bpmn:participant (a pool is a graphical represnetation of a participant).
       * If there are currently no pools, don't create a new process, use the current one instead, and add (embed) all current flow elements to it.
       *
       * For lanes, it will be bpmn:laneSet > bpmn:lanes (TODO).
       */
      if (type === poolId) {
        if (!this.collaboration) {
          this.collaboration = this.moddle.create('bpmn:Collaboration');
          this.definitions.get('rootElements').push(this.collaboration);
          this.collaboration.set('id', 'collaboration_0');
          this.plane.set('bpmnElement', this.collaboration);
        }

        let process;
        if (this.collaboration.get('participants').length === 0) {
          process = this.processNode;
        } else {
          process = this.moddle.create('bpmn:Process');
          this.processes.push(process);
          process.set('id', `process_${this.processes.length}`);
          process.set('isExecutable', false);

          this.definitions.get('rootElements').push(process);
        }

        definition.set('processRef', process);
        this.collaboration.get('participants').push(definition);
      } else {
        /* Check if this.poolTarget is set, and if so, add to appropriate process. */
        const targetProcess = this.poolTarget
          ? this.processes.find(({ id }) => id === this.poolTarget.component.node.definition.get('processRef').id)
          : this.processNode;

        if (type === laneId) {
          targetProcess
            .get('laneSets')[0]
            .get('lanes')
            .push(definition);
        } else if (definition.$type === 'bpmn:TextAnnotation') {
          targetProcess.get('artifacts').push(definition);
        } else {
          targetProcess.get('flowElements').push(definition);
        }
      }

      const id = uniqueId('node_');
      definition.id = id;

      if (diagram) {
        diagram.id = `${id}_di`;
        diagram.bpmnElement = definition;
      }

      this.planeElements.push(diagram);

      this.$set(this.nodes, id, {
        type,
        definition,
        diagram,
        pool: this.poolTarget,
      });

      this.poolTarget = null;
    },
    initializeUniqueId(context) {
      let last = uniqueId() * 1;
      context.references.forEach((ref)=>{
        const ma = ref.id.match(/^node_(\d+)$/),
          index = ma && ma[1] * 1;
        while(last < index) last = uniqueId() * 1;
      });
    },
    removeNode(node) {
      pull(this.processNode.get('flowElements'), node.definition);
      pull(this.planeElements, node.diagram);
      this.$delete(this.nodes, node.definition.id);
    },
    handleResize() {
      let parent = this.$el.parentElement;
      this.$refs['paper-container'].style.width = parent.clientWidth + 'px';
      this.$refs['paper-container'].style.height = parent.clientHeight + 'px';
    },
    loadInspector(type, data, component) {
      this.inspectorNode = data;
      if(type === 'processmaker-modeler-sequence-flow' && (data.sourceRef.$type === 'bpmn:ExclusiveGateway' || data.sourceRef.$type === 'bpmn:InclusiveGateway')) {
        this.inspectorConfig = this.sequenceExpressionInspectorConfig;
      } else {
        this.inspectorConfig = this.nodeRegistry[type].inspectorConfig;
      }

      this.inspectorHandler = this.nodeRegistry[type].inspectorHandler
        ? value => this.nodeRegistry[type].inspectorHandler(value, data, component)
        : value => this.defaultInspectorHandler(value, data, component);
    },
    defaultInspectorHandler(value, definition, component) {
      /* Go through each property and rebind it to our data */
      for (const key in value) {
        if (definition[key] !== value[key]) {
          definition[key] = value[key];
        }
      }

      component.updateShape();
    },
    validateDropTarget(transferData, { clientX, clientY }) {
      /* You can drop a pool anywhere (a pool will not be embedded into another pool) */
      if (transferData.type === poolId) {
        this.allowDrop = true;
        return;
      }

      /* If there are no pools on the grid, allow dragging components anywhere */
      if (
        !this.collaboration ||
        this.collaboration.get('participants').length === 0
      ) {
        this.allowDrop = true;
        return;
      }

      const { x, y } = this.dragPoint;
      if (clientX === x && clientY === y) {
        /* We don't need to re-calcaulte values if mouse position hasn't changed */
        return;
      }

      /* The mouse co-ordinates are set so we can compare them above if this function runs again */
      this.dragPoint = { x: clientX, y: clientY };

      /* Determine if we are over a pool, and only allow dropping elements over a pool */

      const localMousePosition = this.paper.clientToLocalPoint({
        x: clientX,
        y: clientY,
      });
      const pool = this.graph
        .findModelsFromPoint(localMousePosition)
        .find(({ component }) => {
          return component && component.node.type === poolId;
        });

      if (!pool) {
        this.allowDrop = false;
        this.poolTarget = null;
      } else {
        this.allowDrop = true;
        this.poolTarget = pool;
      }
    },
    addStartEvent() {
      /* Add an initial startEvent node if the graph is empty */
      if (Object.keys(this.nodes).length === 0) {
        return;
      }

      const definition = startEvent.definition(this.moddle);
      const diagram = startEvent.diagram(this.moddle);

      diagram.bounds.x = 150;
      diagram.bounds.y = 150;

      this.addNode({
        definition,
        diagram,
        type: startEvent.id,
      });
    },
  },
  created() {
    /* Initialize the BpmnModdle and its extensions */
    window.ProcessMaker.EventBus.$emit('modeler-init', {
      registerInspectorExtension: this.registerInspectorExtension,
      registerBpmnExtension: this.registerBpmnExtension,
      registerNode: this.registerNode,
    });

    this.moddle = new BpmnModdle(this.extensions);
  },
  mounted() {
    // Handle window resize
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    this.graph = new window.joint.dia.Graph();
    this.graph.set('interactiveFunc', cellView => {
      if (
        cellView.model.getParentCell() &&
        (!cellView.model.component ||
          cellView.model.component.node.type === laneId)
      ) {
        /* Prevent dragging crown icons and lanes */
        return false;
      }

      return { labelMove: false };
    });
    this.paper = new window.joint.dia.Paper({
      el: this.$refs.paper,
      model: this.graph,
      gridSize: 10,
      width: this.$refs['paper-container'].clientWidth,
      height: this.$refs['paper-container'].clientHeight,
      drawGrid: true,
      clickThreshold: 10,
      perpendicularLinks: true,
      interactive: this.graph.get('interactiveFunc'),
      highlighting: {
        default: { options: { padding: highlightPadding } },
      },
    });
    this.paper.on('blank:pointerclick', () => {
      if (this.highlighted) {
        this.highlighted.unhighlight();
        this.highlighted = null;
      }
      this.inspectorNode = this.processNode;
      this.inspectorConfig = processInspectorConfig;
    });

    this.paper.on('blank:pointerdown', (event, x, y) => {
      this.canvasDragPosition = { x, y };
    });
    this.paper.on('cell:pointerup blank:pointerup', () => {
      this.canvasDragPosition = null;
    });

    this.$el.addEventListener('mousemove', event => {
      if (this.canvasDragPosition) {
        this.paper.translate(
          event.offsetX - this.canvasDragPosition.x,
          event.offsetY - this.canvasDragPosition.y
        );
      }
    });

    this.paper.on('cell:pointerclick', (cellView, evt, x, y) => {
      const clickHandler = cellView.model.get('onClick');
      if (clickHandler) {
        clickHandler(cellView, evt, x, y);
      }

      if (this.highlighted) {
        this.highlighted.unhighlight();
        this.highlighted = null;
      }

      if (cellView.model.component) {
        cellView.highlight();

        cellView.model.toFront({ deep: true });
        this.graph
          .getConnectedLinks(cellView.model)
          .forEach(link => link.toFront());

        if ([poolId, laneId].includes(cellView.model.component.node.type)) {
          /* If we brought a pool or lane to the front, ensure it doesn't overlap its children */

          const { x, y, width, height } = cellView.model.getBBox();
          const area = { x, y, width, height };

          this.graph
            .findModelsInArea(area)
            .filter(element => {
              return (
                element.component &&
                ![poolId, laneId].includes(element.component.node.type)
              );
            })
            .forEach(element => {
              element.toFront({ deep: true });
              this.graph
                .getConnectedLinks(element)
                .forEach(link => link.toFront());
            });
        }

        this.highlighted = cellView;
        cellView.model.component.handleClick();
      }
    });
    this.paper.on('link:pointerclick', cellView => {
      if (this.highlighted) {
        this.highlighted.unhighlight();
        this.highlighted = null;
      }
      if (cellView.model.component) {
        cellView.highlight();
        this.highlighted = cellView;
        cellView.model.component.handleClick();
      }
    });

    /* Register custom nodes */
    window.ProcessMaker.EventBus.$emit('modeler-start', {
      loadXML: this.loadXML,
    });
  },
};
</script>

<style lang="scss">
@import '~jointjs/dist/joint.css';

$cursors: default, not-allowed;

.modeler {
  position: relative;
  width: inherit;
  max-width: inherit;
  height: inherit;
  max-height: inherit;
  overflow: hidden;

  .modeler-container {
    max-width: 100%;
    width: 100%;
    display: flex;
    flex-direction: row;

    .inspector {
      font-size: 0.75em;
      text-align: left;
      padding: 8px;
      width: 320px;
      background-color: #eee;
      border-left: 1px solid #aaa;
    }

    .paper-container {
      height: 100%;
      max-height: 100%;
      min-height: 100%;
      overflow: hidden;
    }

    @each $cursor in $cursors {
      .paper-container.#{$cursor} {
        .joint-paper,
        .joint-paper * {
          cursor: #{$cursor} !important;
        }
      }
    }
  }
}
</style>
