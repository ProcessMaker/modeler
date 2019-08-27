<template>
  <b-row class="modeler h-100">
    <b-tooltip
      v-if="tooltipTarget"
      :key="tooltipTarget.id"
      :target="getTooltipTarget"
      :title="tooltipTitle"
    />

    <b-col class="h-100 overflow-hidden controls-column" :class="{ 'ignore-pointer': canvasDragPosition }">
      <controls
        :controls="controls"
        :style="{ height: parentHeight }"
        :invalidDrop="validateDropTarget"
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
      <div class="btn-toolbar tool-buttons d-inline-block mt-3 position-relative" role="toolbar" aria-label="Toolbar" :class="{ 'ignore-pointer': canvasDragPosition }">
        <div class="btn-group btn-group-sm mr-2" role="group" aria-label="First group">
          <button type="button" class="btn btn-sm btn-secondary" @click="undo" :disabled="!canUndo" data-test="undo">{{ $t('Undo') }}</button>
          <button type="button" class="btn btn-sm btn-secondary" @click="redo" :disabled="!canRedo" data-test="redo">{{ $t('Redo') }}</button>
        </div>

        <div class="btn-group btn-group-sm mr-2" role="group" aria-label="Second group">
          <button type="button" class="btn btn-sm btn-secondary" @click="scale += scaleStep" data-test="zoom-in">
            <font-awesome-icon class="" :icon="plusIcon"/>
          </button>
          <button type="button" class="btn btn-sm btn-secondary" @click="scale = Math.max(minimumScale, scale -= scaleStep)" data-test="zoom-out">
            <font-awesome-icon class="" :icon="minusIcon"/>
          </button>
          <button type="button" class="btn btn-sm btn-secondary" @click="scale = initialScale" :disabled="scale === initialScale" data-test="zoom-reset">{{ $t('Reset') }}</button>
          <span class="btn btn-sm btn-secondary scale-value">{{ Math.round(scale*100) }}%</span>
        </div>

        <div class="mini-paper-container" @click="movePaper">
          <div v-show="toggleMiniMap" ref="miniPaper" class="mini-paper"/>
        </div>
      </div>

      <div ref="paper" data-test="paper" class="main-paper"/>

    </b-col>

    <b-col class="pl-0 h-100 overflow-hidden inspector-column" :class="{ 'ignore-pointer': canvasDragPosition }">
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
import { dia, g } from 'jointjs';
import BpmnModdle from 'bpmn-moddle';
import controls from './controls';
import { highlightPadding } from '@/mixins/crownConfig';
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

import { faMapMarked, faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

import { id as poolId } from './nodes/pool';
import { id as laneId } from './nodes/poolLane';
import { id as sequenceFlowId } from './nodes/sequenceFlow';
import { id as associationId } from './nodes/association';
import { id as messageFlowId } from './nodes/messageFlow';

const version = '1.0';

export default {
  components: {
    controls,
    InspectorPanel,
    FontAwesomeIcon,
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

      // Our jointjs paper
      paper: null,
      miniPaper: null,

      definitions: null,
      nodeIdGenerator: null,
      planeElements: null,
      canvasDragPosition: null,
      processNode: null,
      collaboration: null,
      moddle: null,
      dragPoint: { x: null, y: null },
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
      toggleMiniMap: false,
      isGrabbing: false,
      isRendering: false,
    };
  },
  watch: {
    scale(scale) {
      this.paper.scale(scale);
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
    mapIcon() {
      return faMapMarked;
    },
    plusIcon() {
      return faPlus;
    },
    minusIcon() {
      return faMinus;
    },
  },
  methods: {
    validateAndCleanPlaneElements() {
      remove(this.planeElements, diagram => {
        if (!diagram.bpmnElement) {
          window.ProcessMaker.alert(`bpmndi:BPMNShape ${diagram.id} references a non-existant element and was not parsed`, 'warning');
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
     * Register an inspector component to configure extended attributes and elements
     * for specific bpmn extensions and execution environments. If the inspector
     * component is already registered, it is replaced by the new one.
     */
    registerInspectorExtension(node, config) {
      this.addToInspector(
        this.inspectorItemsToAddTo(node, config),
        this.existingConfigIndex(node, config),
        config,
      );
    },
    addToInspector(inspectorItems, existingIndex, config) {
      if (existingIndex === -1) {
        inspectorItems.push(config);
      } else {
        inspectorItems[existingIndex] = config;
      }
    },
    existingConfigIndex(node, config) {
      return this.inspectorItems(node).findIndex(item => {
        return config.id && config.id === item.id;
      });
    },
    isContainer(config) {
      return typeof config.container !== 'undefined';
    },
    inspectorItemsToAddTo(node, config) {
      if (this.isContainer(config)) {
        return this.inspectorItems(node);
      } else {
        // if the config we're adding is not a container, put it in the default container
        return this.defaultContainerItems(node);
      }
    },
    defaultContainerItems(node) {
      return this.inspectorItems(node)[0].items;
    },
    inspectorItems(node) {
      return node.inspectorConfig[0].items;
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

      store.commit('setRootElements', this.definitions.rootElements);

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

      /* Add any message flows */
      if (this.collaboration) {
        this.collaboration
          .get('messageFlows')
          .filter(this.hasSourceAndTarget)
          .forEach(this.setNode);
      }

      store.commit('highlightNode', this.processNode);
    },
    setNode(definition, flowElements, artifacts) {
      /* Get the diagram element for the corresponding flow element node. */
      const diagram = this.planeElements.find(diagram => diagram.bpmnElement.id === definition.id);
      const bpmnType = definition.$type;
      const parsers = this.parsers[bpmnType];

      if (!parsers) {
        window.ProcessMaker.alert(`Unsupported element type in parse: ${bpmnType}`, 'warning');

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
    renderPaper() {
      this.$nextTick(() => {
        this.paper.freeze();
        this.isRendering = true;
        this.paper.once('render:done', () => this.isRendering = false);
        this.parse();
        this.paper.unfreeze();
        this.$emit('parsed');
      });
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
    toXML(cb) {
      this.moddle.toXML(this.definitions, { format: true }, cb);
    },
    handleDrop({ clientX, clientY, control }) {
      this.validateDropTarget({ clientX, clientY, control });

      if (!this.allowDrop) {
        return;
      }

      // Add to our processNode
      const definition = this.nodeRegistry[control.type].definition(this.moddle, this.$t);

      // Now, let's modify planeElement
      const diagram = this.nodeRegistry[control.type].diagram(this.moddle);

      // Handle transform
      const paperOrigin = this.paper.localToPagePoint(0, 0);
      const scale = this.paper.scale();

      diagram.bounds.x = (clientX - paperOrigin.x) / scale.sx;
      diagram.bounds.y = (clientY - paperOrigin.y) / scale.sy;

      // Our BPMN models are updated, now add to our nodes
      // @todo come up with random id
      this.addNode({ type: control.type, definition, diagram });
    },
    addNode({ type, definition, diagram }) {
      /*
       * If we are adding a pool, first, create a bpmn:Collaboration, or get the current bpmn:Collaboration,
       * if one exists.
       *
       * For each process, bpmn:Collaboration will contain a bpmn:participant (a pool is a graphical represnetation of a participant).
       * If there are currently no pools, don't create a new process, use the current one instead, and add (embed) all current flow
       * elements to it.
       */
      if (type !== poolId) {
        /* Check if this.poolTarget is set, and if so, add to appropriate process. */
        const targetProcess = this.poolTarget
          ? this.processes.find(({ id }) => id === this.poolTarget.component.node.definition.get('processRef').id)
          : this.processNode.definition;

        if (type === laneId) {
          targetProcess
            .get('laneSets')[0]
            .get('lanes')
            .push(definition);
        } else if (definition.$type === 'bpmn:TextAnnotation' || definition.$type === 'bpmn:Association') {
          targetProcess.get('artifacts').push(definition);
        } else if (definition.$type !== 'bpmn:MessageFlow') {
          targetProcess.get('flowElements').push(definition);
        }
      }

      const id = definition.id || this.nodeIdGenerator.generateUniqueNodeId();
      definition.id = id;

      if (diagram) {
        diagram.id = `${id}_di`;
        diagram.bpmnElement = definition;
      }

      this.planeElements.push(diagram);

      store.commit('addNode', {
        type,
        definition,
        diagram,
        pool: this.poolTarget,
      });

      if (![sequenceFlowId, laneId, associationId, messageFlowId].includes(type)) {
        setTimeout(() => this.pushToUndoStack());
      }

      this.poolTarget = null;
    },
    removeNode(node) {
      store.commit('removeNode', node);
      store.commit('highlightNode', this.processNode);
      this.$nextTick(() => {
        this.pushToUndoStack();
      });
    },
    handleResize() {
      const { clientWidth, clientHeight } = this.$el.parentElement;
      this.parentWidth = clientWidth + 'px';
      this.parentHeight = clientHeight + 'px';

      this.paper.setDimensions(clientWidth, clientHeight);
    },
    isPointOverPaper(mouseX, mouseY) {
      const { left, top, width, height } = this.$refs['paper-container'].getBoundingClientRect();
      const rect = new g.rect(left, top, width, height);
      const point = new g.Point(mouseX, mouseY);

      return rect.containsPoint(point);
    },
    validateDropTarget({ clientX, clientY, control }) {

      if (!this.isPointOverPaper(clientX, clientY)) {
        this.allowDrop = false;
        return;
      }

      const localMousePosition = this.paper.clientToLocalPoint({
        x: clientX,
        y: clientY,
      });

      /* You can drop a pool anywhere (a pool will not be embedded into another pool) */
      if (control.type === poolId) {
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
      this.paper.freeze();

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

      this.paper.unfreeze();
    },
    movePaper({ offsetX, offsetY }) {
      const { x, y } = this.miniPaper.paperToLocalPoint(offsetX, offsetY);
      const scale = this.paper.scale();

      this.paper.translate(
        (this.$refs.paper.clientWidth / 2) - (x * scale.sx),
        (this.$refs.paper.clientHeight / 2) - (y * scale.sy),
      );
    },
  },
  created() {
    if (runningInCypressTest()) {
      /* Add reference to store on window; this is used in testing to verify rendered nodes */
      window.store = store;
    }

    this.$t = this.$t.bind(this);
    this.registerNode(Process);

    /* Initialize the BpmnModdle and its extensions */
    window.ProcessMaker.EventBus.$emit('modeler-init', {
      registerInspectorExtension: this.registerInspectorExtension,
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

    this.paper = new dia.Paper({
      async: true,
      el: this.$refs.paper,
      model: this.graph,
      sorting: 'sorting-approximate',
      gridSize: 10,
      drawGrid: true,
      clickThreshold: 10,
      perpendicularLinks: true,
      interactive: this.graph.get('interactiveFunc'),
      highlighting: {
        default: { options: { padding: highlightPadding } },
      },
    });

    this.paper.translate(168, 20);

    this.miniPaper = new dia.Paper({
      el: this.$refs.miniPaper,
      model: this.graph,
      width: 300,
      height: 200,
      interactive: false,
    });

    this.miniPaper.scale(0.15);

    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    store.commit('setPaper', this.paper);

    this.paper.on('blank:pointerclick', () => {
      store.commit('highlightNode', this.processNode);
    });

    this.paper.on('blank:pointerdown', (event, x, y) => {
      const scale = this.paper.scale();
      this.canvasDragPosition = { x: x * scale.sx, y: y * scale.sy };
      this.isGrabbing = true;
    });
    this.paper.on('cell:pointerup blank:pointerup', () => {
      this.canvasDragPosition = null;
      this.isGrabbing = false;
    });

    this.$el.addEventListener('mousemove', event => {
      if (this.canvasDragPosition) {
        this.paper.translate(
          event.offsetX - this.canvasDragPosition.x,
          event.offsetY - this.canvasDragPosition.y,
        );
      }
    });

    this.paper.on('cell:pointerclick', (cellView, evt, x, y) => {
      const clickHandler = cellView.model.get('onClick');
      if (clickHandler) {
        clickHandler(cellView, evt, x, y);
      }
    });

    this.paper.on('cell:pointerdown', cellView => {
      const shape = cellView.model;

      if (!this.isBpmnNode(shape)) {
        return;
      }

      this.setShapeStacking(shape);

      shape.component.$emit('click');
    });

    /* Register custom nodes */
    window.ProcessMaker.EventBus.$emit('modeler-start', {
      loadXML: xml => {
        this.loadXML(xml);
        undoRedoStore.dispatch('pushState', xml);
      },
    });

    window.ProcessMaker.EventBus.$on('modeler-change', () => {
      setTimeout(() => {
        this.miniPaper.scaleContentToFit({ padding: 10, maxScaleX: 0.5, maxScaleY: 0.5 });
      });
    });
  },
};
</script>

<style lang="scss">
  @import '~jointjs/dist/joint.min.css';

  $cursors: default, not-allowed;

  .ignore-pointer {
    pointer-events: none;
  }

  .mini-paper-container {
    position: absolute;
    top: 2.5rem;
    right: 0;
    z-index: 2;
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.19), 0 6px 6px rgba(0, 0, 0, 0.23);
    border: 1px solid #e9ecef;
    cursor: pointer;

    .mini-paper {
      pointer-events: none;
    }
  }

  .modeler {
    .inspector-column {
      max-width: 265px;
    }

    .controls-column {
      max-width: 185px;
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

      .tool-buttons {
        z-index: 1;

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
      fill: #ED4757;
      cursor: url('../assets/delete-icon-vertex.png') 0 0, pointer;
    }
  }
</style>
