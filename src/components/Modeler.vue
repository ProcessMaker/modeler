<template>
  <b-row class="modeler h-100">
    <b-tooltip
      v-if="tooltipTarget"
      :key="tooltipTarget.id"
      :target="getTooltipTarget"
      :title="tooltipTitle"
    />

    <b-col class="h-100 overflow-hidden controls-column" :class="[{ 'ignore-pointer': canvasDragPosition, 'controls-column-compressed' : panelsCompressed }]" data-test="controls-column">
      <controls
        :controls="controls"
        :panelsCompressed="panelsCompressed"
        :style="{ height: parentHeight }"
        :allowDrop="allowDrop"
        @drag="validateDropTarget"
        @handleDrop="handleDrop"
        class="controls h-100 rounded-0 border-top-0 border-bottom-0 border-left-0"
      />
    </b-col>

    <b-col
      class="paper-container h-100 pr-4"
      ref="paper-container"
      :class="[cursor, { 'grabbing-cursor' : isGrabbing }]"
      :style="{ width: parentWidth, height: parentHeight }"
    >
      <div class="toolbar d-inline-block mt-3 position-relative" role="toolbar" aria-label="Toolbar" :class="{ 'ignore-pointer': canvasDragPosition }">
        <div class="btn-group btn-group-sm mr-2" role="group" aria-label="Undo/redo controls">
          <button type="button" class="btn btn-sm btn-secondary" @click="undo" :disabled="!canUndo" data-test="undo">{{ $t('Undo') }}</button>
          <button type="button" class="btn btn-sm btn-secondary" @click="redo" :disabled="!canRedo" data-test="redo">{{ $t('Redo') }}</button>
        </div>

        <div class="btn-group btn-group-sm mr-2" role="group" aria-label="Zoom controls">
          <button type="button" class="btn btn-sm btn-secondary" @click="scale += scaleStep" data-test="zoom-in">
            <font-awesome-icon class="" :icon="plusIcon" />
          </button>
          <button type="button" class="btn btn-sm btn-secondary" @click="scale = Math.max(minimumScale, scale -= scaleStep)" data-test="zoom-out">
            <font-awesome-icon class="" :icon="minusIcon" />
          </button>
          <button type="button" class="btn btn-sm btn-secondary" @click="scale = initialScale" :disabled="scale === initialScale" data-test="zoom-reset">{{ $t('Reset') }}</button>
          <span class="btn btn-sm btn-secondary scale-value">{{ Math.round(scale*100) }}%</span>
        </div>

        <div class="btn-group btn-group-sm mr-2" role="group" aria-label="Additional controls">
          <button class="btn btn-sm btn-secondary ml-auto" data-test="panels-btn" @click="panelsCompressed = !panelsCompressed">
            <font-awesome-icon :icon="panelsCompressed ? expandIcon : compressIcon" />
          </button>

          <button class="btn btn-sm btn-secondary mini-map-btn ml-auto" data-test="mini-map-btn" @click="miniMapOpen = !miniMapOpen">
            <font-awesome-icon :icon="miniMapOpen ? minusIcon : mapIcon" />
          </button>
        </div>
      </div>

      <div ref="paper" data-test="paper" class="main-paper" />
    </b-col>

    <mini-paper :isOpen="miniMapOpen" :paperManager="paperManager" :graph="graph" :class="{ 'mini-paper-expanded' : panelsCompressed }" />

    <b-col
      v-show="!panelsCompressed"
      class="pl-0 h-100 overflow-hidden inspector-column"
      :class="[{ 'ignore-pointer': canvasDragPosition, 'inspector-column-compressed' : panelsCompressed }]"
      data-test="inspector-column"
    >
      <InspectorPanel
        ref="inspector-panel"
        :style="{ height: parentHeight }"
        :nodeRegistry="nodeRegistry"
        :moddle="moddle"
        :processNode="processNode"
        @save-state="pushToUndoStack"
        class="h-100"
      />
    </b-col>
    <component
      v-for="node in nodes"
      :is="node.type"
      :key="node._modelerId"
      :graph="graph"
      :paper="paper"
      :node="node"
      :id="node.definition.id"
      :highlighted="highlightedNode === node"
      :has-error="invalidNodes.includes(node.definition.id)"
      :collaboration="collaboration"
      :process-node="processNode"
      :processes="processes"
      :plane-elements="planeElements"
      :moddle="moddle"
      :nodeRegistry="nodeRegistry"
      :root-elements="definitions.get('rootElements')"
      :isRendering="isRendering"
      @add-node="addNode"
      @remove-node="removeNode"
      @set-cursor="cursor = $event"
      @set-pool-target="poolTarget = $event"
      @click="highlightNode(node)"
      @unset-pools="unsetPools"
      @set-pools="setPools"
      @save-state="pushToUndoStack"
      @set-shape-stacking="setShapeStacking"
      @setTooltip="tooltipTarget = $event"
    />
  </b-row>
</template>

<script>
import Vue from 'vue';
import { dia } from 'jointjs';
import boundaryEventConfig from './nodes/boundaryEvent';
import BpmnModdle from 'bpmn-moddle';
import controls from './controls';
import pull from 'lodash/pull';
import remove from 'lodash/remove';
import { startEvent } from '@/components/nodes';
import store from '@/store';
import InspectorPanel from '@/components/inspectors/InspectorPanel';
import undoRedoStore from '@/undoRedoStore';
import { Linter } from 'bpmnlint';
import linterConfig from '../../.bpmnlintrc';
import NodeIdGenerator from '../NodeIdGenerator';
import Process from './inspectors/process';
import runningInCypressTest from '@/runningInCypressTest';
import getValidationProperties from '@/targetValidationUtils';
import MiniPaper from '@/components/MiniPaper';

import { faCompress, faExpand, faMapMarked, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { id as poolId } from './nodes/pool';
import { id as laneId } from './nodes/poolLane';
import { id as sequenceFlowId } from './nodes/sequenceFlow';
import { id as associationId } from './nodes/association';
import { id as messageFlowId } from './nodes/messageFlow';

import PaperManager from './paperManager';
import registerInspectorExtension from '@/components/InspectorExtensionManager';

import initAnchor from '@/mixins/linkManager.js';
import { addIdToNodeAndSetUpDiagramReference, addNodeToProcess, getTargetProcess } from '@/components/nodeManager';

const version = '1.0';

export default {
  components: {
    controls,
    InspectorPanel,
    FontAwesomeIcon,
    MiniPaper,
  },
  data() {
    return {
      tooltipTarget: null,

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
      paper: null,
      paperManager: null,

      definitions: null,
      nodeIdGenerator: null,
      planeElements: null,
      canvasDragPosition: null,
      processNode: null,
      collaboration: null,
      moddle: null,
      allowDrop: true,
      poolTarget: null,
      processes: [],
      cursor: null,
      parentHeight: null,
      parentWidth: null,
      linter: null,
      validationErrors: {},
      scale: 1,
      initialScale: 1,
      minimumScale: 0.2,
      scaleStep: 0.1,
      miniMapOpen: false,
      panelsCompressed: false,
      isGrabbing: false,
      isRendering: false,
      allWarnings: [],
      mapIcon: faMapMarked,
      plusIcon: faPlus,
      minusIcon: faMinus,
      expandIcon: faExpand,
      compressIcon: faCompress,
    };
  },
  watch: {
    isRendering() {
      if (this.isRendering) {
        document.body.style.cursor = 'wait !important';
        this.cursor = 'wait';
        return;
      }

      document.body.style.cursor = 'auto';
      this.cursor = null;
    },
    scale(scale) {
      this.paperManager.scale = scale;
    },
    currentXML() {
      this.validateIfAutoValidateIsOn();
    },
    definitions() {
      this.validateIfAutoValidateIsOn();
    },
    autoValidate() {
      this.validateIfAutoValidateIsOn();
    },
  },
  computed: {
    tooltipTitle() {
      if (this.tooltipTarget) {
        return this.tooltipTarget.$el.data('title');
      }
      return undefined;
    },
    autoValidate: () => store.getters.autoValidate,
    nodes: () => store.getters.nodes,
    canUndo() {
      return undoRedoStore.getters.canUndo;
    },
    canRedo() {
      return undoRedoStore.getters.canRedo;
    },
    currentXML() {
      return undoRedoStore.getters.currentState;
    },
    highlightedNode: () => store.getters.highlightedNode,
    invalidNodes() {
      return Object.entries(this.validationErrors).reduce((invalidIds, [, errors]) => {
        invalidIds.push(...errors.map(error => error.id));
        return invalidIds;
      }, []);
    },
  },
  methods: {
    addWarning(warning) {
      this.allWarnings.push(warning);
      this.$emit('warnings', this.allWarnings);
    },
    validateAndCleanPlaneElements() {
      remove(this.planeElements, diagram => {
        if (!diagram.bpmnElement) {
          this.addWarning(
            {
              title: this.$t('Non-existent Element'),
              text: this.$t('bpmdi:BPMNShape ') + diagram.id + this.$t(' references a non-existent element and was not parsed'),
            });
          return true;
        }
      });
    },
    getTooltipTarget() {
      return this.tooltipTarget.$el[0];
    },
    validateIfAutoValidateIsOn() {
      if (this.autoValidate) {
        this.validateBpmnDiagram();
      }
    },
    translateConfig(inspectorConfig) {
      if (inspectorConfig.config) {
        const config = inspectorConfig.config;

        config.label = this.$t(config.label);
        config.helper = this.$t(config.helper);
      }

      if (inspectorConfig.items) {
        inspectorConfig.items.forEach(this.translateConfig);
      }
    },
    async pushToUndoStack() {
      const xml = await this.getXmlFromDiagram();
      undoRedoStore.dispatch('pushState', xml);

      window.ProcessMaker.EventBus.$emit('modeler-change');
    },
    getXmlFromDiagram() {
      return new Promise((resolve, reject) => {
        this.toXML((error, xml) => {
          if (error) {
            reject(error);
          } else {
            resolve(xml);
          }
        });
      });
    },
    async validateBpmnDiagram() {
      const validationErrors = await this.linter.lint(this.definitions);
      this.validationErrors = validationErrors;
      this.$emit('validate', validationErrors);
    },
    undo() {
      if (this.isRendering) {
        return;
      }
      undoRedoStore
        .dispatch('undo')
        .then(this.loadXML)
        .then(() => window.ProcessMaker.EventBus.$emit('modeler-change'));
    },
    redo() {
      if (this.isRendering) {
        return;
      }
      undoRedoStore
        .dispatch('redo')
        .then(this.loadXML)
        .then(() => window.ProcessMaker.EventBus.$emit('modeler-change'));
    },
    setPools(poolDefinition) {
      if (!this.collaboration) {
        this.collaboration = this.moddle.create('bpmn:Collaboration');
        this.definitions.get('rootElements').push(this.collaboration);
        this.collaboration.set('id', 'collaboration_0');
        this.plane.set('bpmnElement', this.collaboration);
      }

      if (poolDefinition.get('processRef')) {
        if (!this.collaboration.get('participants').includes(poolDefinition)) {
          this.collaboration.get('participants').push(poolDefinition);
        }

        return;
      }

      let process;
      if (this.collaboration.get('participants').length === 0) {
        process = this.processNode.definition;
      } else {
        process = this.moddle.create('bpmn:Process');
        this.processes.push(process);
        process.set('id', `process_${this.processes.length}`);

        this.definitions.get('rootElements').push(process);
      }

      poolDefinition.set('processRef', process);
      this.collaboration.get('participants').push(poolDefinition);
    },
    unsetPools() {
      pull(this.definitions.get('rootElements'), this.collaboration);
      this.plane.set('bpmnElement', this.processNode.definition);
      this.collaboration = null;
    },
    highlightNode(node) {
      store.commit('highlightNode', node);
    },
    /**
     * Register a mixin into a node component.
     * Used during "modeler-before-init"
     *
     */
    registerComponentMixin(component, mixin) {
      if (!component.mixins) {
        component.mixins = [];
      }
      component.mixins.push(mixin);
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
    registerNode(nodeType, customParser) {
      const defaultParser = () => nodeType.id;
      const implementationParser = definition => {
        if (definition.get('implementation') === nodeType.implementation) {
          return nodeType.id;
        }
      };

      this.translateConfig(nodeType.inspectorConfig[0]);
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
          bpmnType: nodeType.bpmnType,
        });
      }

      const types = Array.isArray(nodeType.bpmnType)
        ? nodeType.bpmnType
        : [nodeType.bpmnType];

      types.forEach(bpmnType => {
        if (!this.parsers[bpmnType]) {
          this.parsers[bpmnType] = { custom: [], implementation: [], default: [] };
        }

        if (customParser) {
          this.parsers[bpmnType].custom.push(customParser);
          return;
        }

        if (nodeType.implementation) {
          this.parsers[bpmnType].implementation.push(implementationParser);
          return;
        }

        this.parsers[bpmnType].default.push(defaultParser);
      });
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

      this.validateAndCleanPlaneElements();

      this.processNode = {
        type: 'processmaker-modeler-process',
        definition: this.processes[0],
        diagram: this.planeElements.find(diagram => diagram.bpmnElement.id === this.processes[0].id),
      };

      /* Add any pools */
      if (this.collaboration) {
        this.collaboration.get('participants').forEach(this.setNode);
      }

      /* Iterate through all elements in each process. */
      this.processes.forEach(process => {
        this.ensureCancelActivityIsAddedToBoundaryEvents(process);

        /* Add any lanes */
        if (process.get('laneSets')[0]) {
          process.laneSets[0].lanes.forEach(this.setNode);
        }

        /* Add all other elements */

        const flowElements = process.get('flowElements');
        const artifacts = process.get('artifacts');

        /* First load the flow elements */
        flowElements
          .filter(definition => definition.$type !== 'bpmn:SequenceFlow')
          .forEach(definition => this.setNode(definition, flowElements, artifacts));

        /* Then the sequence flows */
        flowElements
          .filter(definition => {
            if (definition.$type !== 'bpmn:SequenceFlow') {
              return false;
            }

            return this.hasSourceAndTarget(definition);
          })
          .forEach(definition => this.setNode(definition, flowElements, artifacts));

        /* Then the artifacts */
        artifacts
          .filter(definition => definition.$type !== 'bpmn:Association')
          .forEach(definition => this.setNode(definition, flowElements, artifacts));

        /* Then the associations */
        artifacts
          .filter(definition => {
            if (definition.$type !== 'bpmn:Association') {
              return false;
            }

            return this.hasSourceAndTarget(definition);
          })
          .forEach(definition => this.setNode(definition, flowElements, artifacts));
      });

      store.commit('setRootElements', this.definitions.rootElements);

      /* Add any message flows */
      if (this.collaboration) {
        this.collaboration
          .get('messageFlows')
          .filter(this.hasSourceAndTarget)
          .forEach(this.setNode);
      }

      store.commit('highlightNode', this.processNode);
    },
    removeUnsupportedElementAttributes(definition) {
      const unsupportedElements = ['documentation', 'extensionElements'];

      unsupportedElements.filter(name => definition.get(name))
        .forEach(name => definition.set(name, undefined));
    },
    setNode(definition, flowElements, artifacts) {
      /* Get the diagram element for the corresponding flow element node. */
      const diagram = this.planeElements.find(diagram => diagram.bpmnElement.id === definition.id);
      const bpmnType = definition.$type;
      const parsers = this.parsers[bpmnType];

      if (!parsers) {
        this.addWarning({
          title: this.$t('Unsupported Element'),
          text: bpmnType + this.$t(' is an unsupported element type in parse'),
        });

        pull(flowElements, definition);
        pull(artifacts, definition);
        pull(this.planeElements, diagram);
        if (this.collaboration) {
          pull(this.collaboration.get('messageFlows'), definition);
        }

        const incomingFlows = definition.get('incoming');
        if (incomingFlows) {
          pull(flowElements, incomingFlows);
        }

        const outgoingFlows = definition.get('outgoing');
        if (outgoingFlows) {
          pull(flowElements, outgoingFlows);
        }

        return;
      }

      this.removeUnsupportedElementAttributes(definition);

      const customParser = parsers.custom.find(parser => parser(definition, this.moddle));
      const implementationParser = parsers.implementation.find(parser => parser(definition, this.moddle));
      const defaultParser = parsers.default.find(parser => parser(definition, this.moddle));

      const type = (customParser || implementationParser || defaultParser)(definition, this.moddle);

      const unnamedElements = ['bpmn:TextAnnotation', 'bpmn:Association'];
      const requireName = unnamedElements.indexOf(bpmnType) === -1;
      if (requireName && !definition.get('name')) {
        definition.set('name', '');
      }

      store.commit('addNode', {
        type,
        definition,
        diagram,
      });
    },
    hasSourceAndTarget(definition) {
      const hasSource = definition.sourceRef && this.parsers[definition.sourceRef.$type];
      const hasTarget = definition.targetRef && this.parsers[definition.targetRef.$type];

      return hasSource && hasTarget;
    },
    async waitForCursorToChange() {
      const cursorWaitTime = 300;
      await this.$nextTick();
      return new Promise(resolve => setTimeout(resolve, cursorWaitTime));
    },
    async renderPaper() {
      await this.$nextTick();
      await this.paperManager.performAtomicAction(async() => {
        this.isRendering = true;
        await this.waitForCursorToChange();
        this.paperManager.addOnceHandler('render:done', () => this.isRendering = false);
        this.parse();
      });
      this.$emit('parsed');
      this.removeLoaderIfProcessIsEmpty();
    },
    removeLoaderIfProcessIsEmpty() {
      const emptyProcess = store.getters.nodes.length === 0;
      if (!emptyProcess) {
        return;
      }
      this.isRendering = false;
    },
    loadXML(xml = this.currentXML) {
      this.moddle.fromXML(xml, (err, definitions) => {
        if (err) {
          return;
        }
        definitions.exporter = 'ProcessMaker Modeler';
        definitions.exporterVersion = version;
        this.definitions = definitions;
        this.nodeIdGenerator = new NodeIdGenerator(definitions);
        store.commit('clearNodes');
        this.renderPaper();
      });
    },

    getBoundaryEvents(process) {
      return process.get('flowElements').filter(({ $type }) => $type === 'bpmn:BoundaryEvent');
    },
    createBoundaryEvent(definition) {
      const boundaryEvent = boundaryEventConfig.definition(this.moddle, this.$t);
      boundaryEvent.set('id', definition.get('id'));
      boundaryEvent.set('name', definition.get('name'));
      boundaryEvent.set('eventDefinitions', definition.get('eventDefinitions'));
      boundaryEvent.set('cancelActivity', definition.get('cancelActivity'));
      boundaryEvent.set('attachedToRef', definition.get('attachedToRef'));
      boundaryEvent.$parent = definition.$parent;
      if (definition.get('outgoing').length > 0) {
        boundaryEvent.set('outgoing', definition.get('outgoing'));
      }
      return boundaryEvent;
    },
    replaceDefinition(definition, boundaryEvent, process) {
      const definitionIndex = process.get('flowElements').indexOf(definition);
      process.flowElements[definitionIndex] = boundaryEvent;
    },
    ensureCancelActivityIsAddedToBoundaryEvents(process) {
      this.getBoundaryEvents(process).forEach(definition => {
        const boundaryEvent = this.createBoundaryEvent(definition);
        definition.get('outgoing').forEach(outgoing => outgoing.set('sourceRef', boundaryEvent));
        this.replaceDefinition(definition, boundaryEvent, process);
      });
    },
    toXML(cb) {
      this.moddle.toXML(this.definitions, { format: true }, cb);
    },
    handleDrop({ clientX, clientY, control }) {
      this.validateDropTarget({ clientX, clientY, control });

      if (!this.allowDrop) {
        return;
      }

      const definition = this.nodeRegistry[control.type].definition(this.moddle, this.$t);
      const diagram = this.nodeRegistry[control.type].diagram(this.moddle);

      const { x, y } = this.paperManager.clientToGridPoint(clientX, clientY);
      diagram.bounds.x = x;
      diagram.bounds.y = y;

      if (this.isBoundaryEvent(definition)) {
        this.setShapeCenterUnderCursor(diagram);
      }

      const node = {type: control.type, definition, diagram};
      this.highlightNode(node);
      this.addNode(node);
    },
    isBoundaryEvent(definition) {
      return definition.$type === 'bpmn:BoundaryEvent';
    },
    setShapeCenterUnderCursor(diagram) {
      diagram.bounds.x = diagram.bounds.x - (diagram.bounds.width / 2);
      diagram.bounds.y = diagram.bounds.y - (diagram.bounds.height / 2);
    },
    addNode(node) {
      node.pool = this.poolTarget;

      const targetProcess = getTargetProcess(node, this.processes, this.processNode);
      addNodeToProcess(node, targetProcess);
      addIdToNodeAndSetUpDiagramReference(node, this.nodeIdGenerator);

      this.planeElements.push(node.diagram);

      store.commit('addNode', node);

      if (![sequenceFlowId, laneId, associationId, messageFlowId].includes(node.type)) {
        setTimeout(() => this.pushToUndoStack());
      }

      this.poolTarget = null;
    },
    removeNode(node) {
      this.removeNodeFromLane(node);
      store.commit('removeNode', node);
      store.commit('highlightNode', this.processNode);
      this.$nextTick(() => {
        this.pushToUndoStack();
      });
    },
    removeNodeFromLane(node) {
      const containingLane = node.pool && node.pool.component.laneSet &&
        node.pool.component.laneSet.get('lanes').find(lane => {
          return lane.get('flowNodeRef').includes(node.definition);
        });

      if (!containingLane) {
        return;
      }

      pull(containingLane.get('flowNodeRef'), node.definition);
    },
    handleResize() {
      const { clientWidth, clientHeight } = this.$el.parentElement;
      this.parentWidth = clientWidth + 'px';
      this.parentHeight = clientHeight + 'px';

      this.paperManager.setPaperDimensions(clientWidth, clientHeight);
    },
    validateDropTarget({ clientX, clientY, control }) {
      const { allowDrop, poolTarget } = getValidationProperties(clientX, clientY, control, this.paperManager.paper, this.graph, this.collaboration, this.$refs['paper-container']);
      this.allowDrop = allowDrop;
      this.poolTarget = poolTarget;
    },
    addStartEvent() {
      /* Add an initial startEvent node if the graph is empty */
      if (this.nodes.length > 0) {
        return;
      }

      const definition = startEvent.definition(this.moddle, this.$t);
      const diagram = startEvent.diagram(this.moddle);

      diagram.bounds.x = 150;
      diagram.bounds.y = 150;

      this.addNode({
        definition,
        diagram,
        type: startEvent.id,
      });

      setTimeout(() => undoRedoStore.dispatch('resetHistory'));
    },
    isBpmnNode(shape) {
      return shape.component != null;
    },
    isNotLane(shape) {
      return shape.component.node.type !== laneId;
    },
    bringPoolToFront(poolShape) {
      this.bringShapeToFront(poolShape);
    },
    bringShapeToFront(shape) {
      shape.toFront({ deep: true });
    },
    getElementPool(shape) {
      return shape.component.node.pool;
    },
    isPool(shape) {
      return shape.component.node.type === poolId;
    },
    setShapeStacking(shape) {
      this.paperManager.performAtomicAction(() => {
        if (this.isPool(shape)) {
          this.bringPoolToFront(shape);
        }

        const parentPool = this.getElementPool(shape);
        if (parentPool) {
          this.bringPoolToFront(parentPool);
        }

        if (this.isNotLane(shape) && !this.isPool(shape)) {
          this.bringShapeToFront(shape);
        }
      });
    },
  },
  created() {
    if (runningInCypressTest()) {
      /* Add reference to store on window; this is used in testing to verify rendered nodes */
      window.store = store;
    }

    this.$t = this.$t.bind(this);
    /**
     * Before Initialize the BpmnModdle and its extensions.
     * In this stage the node components were not yet registered,
     * so they could be extended.
     *
     */
    window.ProcessMaker.EventBus.$emit('modeler-before-init', {
      registerComponentMixin: this.registerComponentMixin,
    });

    this.registerNode(Process);
    /* Initialize the BpmnModdle and its extensions */
    window.ProcessMaker.EventBus.$emit('modeler-init', {
      registerInspectorExtension,
      registerBpmnExtension: this.registerBpmnExtension,
      registerNode: this.registerNode,
    });

    this.moddle = new BpmnModdle(this.extensions);

    this.linter = new Linter(linterConfig);
  },
  mounted() {
    this.graph = new dia.Graph();
    store.commit('setGraph', this.graph);
    this.graph.set('interactiveFunc', cellView => {
      return {
        elementMove: cellView.model.get('elementMove'),
      };
    });

    this.paperManager = PaperManager.factory(this.$refs.paper, this.graph.get('interactiveFunc'), this.graph);
    this.paper = this.paperManager.paper;

    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    store.commit('setPaper', this.paperManager.paper);

    this.paperManager.addEventHandler('blank:pointerclick', () => {
      store.commit('highlightNode', this.processNode);
    }, this);

    this.paperManager.addEventHandler('blank:pointerdown', (event, x, y) => {
      const scale = this.paperManager.scale;
      this.canvasDragPosition = { x: x * scale.sx, y: y * scale.sy };
      this.isGrabbing = true;
    }, this);
    this.paperManager.addEventHandler('cell:pointerup blank:pointerup', () => {
      this.canvasDragPosition = null;
      this.isGrabbing = false;
    }, this);

    this.$el.addEventListener('mousemove', event => {
      if (this.canvasDragPosition) {
        this.paperManager.translate(
          event.offsetX - this.canvasDragPosition.x,
          event.offsetY - this.canvasDragPosition.y,
        );
      }
    }, this);

    this.paperManager.addEventHandler('cell:pointerclick', (cellView, evt, x, y) => {
      const clickHandler = cellView.model.get('onClick');
      if (clickHandler) {
        clickHandler(cellView, evt, x, y);
      }
    });

    this.paperManager.addEventHandler('cell:pointerdown', cellView => {
      const shape = cellView.model;

      if (!this.isBpmnNode(shape)) {
        return;
      }

      this.setShapeStacking(shape);

      shape.component.$emit('click');
    });

    initAnchor();

    /* Register custom nodes */
    window.ProcessMaker.EventBus.$emit('modeler-start', {
      loadXML: xml => {
        this.loadXML(xml);
        undoRedoStore.dispatch('pushState', xml);
      },
      addWarnings: warnings => this.$emit('warnings', warnings),
    });
  },
};
</script>

<style lang="scss">
@import '~jointjs/dist/joint.min.css';

$cursors: default, not-allowed, wait;
$inspector-column-max-width: 265px;
$controls-column-max-width: 265px;
$controls-column-compressed-max-width: 95px;
$toolbar-height: 2rem;
$vertex-error-color: #ED4757;

.ignore-pointer {
  pointer-events: none;
}

.modeler {
  .inspector-column {
    max-width: $inspector-column-max-width;
  }

  .controls-column {
    max-width: $controls-column-max-width;
  }

  .controls-column-compressed {
    max-width: $controls-column-compressed-max-width;
  }

  .main-paper {
    position: absolute;
    height: 100%;
    max-height: 100%;
    min-height: 100%;
    left: 0;
    top: 0;
  }

  .controls {
    z-index: 1;
  }

  .grabbing-cursor {
    cursor: grabbing !important;
  }

  .paper-container {
    position: initial !important;
    cursor: grab;
    user-select: none;

    .toolbar {
      z-index: 1;
      height: $toolbar-height;
      cursor: auto;

      > button {
        cursor: pointer;
      }
    }
  }

  @each $cursor in $cursors {
    .paper-container.#{$cursor} {
      .joint-paper,
      .joint-paper * {
        cursor: #{$cursor} !important;
      }
    }
  }

  .joint-marker-vertex:hover {
    fill: $vertex-error-color;
    cursor: url('../assets/delete-icon-vertex.png') 0 0, pointer;
  }
}
</style>
