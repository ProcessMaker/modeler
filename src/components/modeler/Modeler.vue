<template>
  <span data-test="body-container">
    <tool-bar
      :canvas-drag-position="canvasDragPosition"
      :cursor="cursor"
      :is-rendering="isRendering"
      :paper-manager="paperManager"
      :breadcrumb-data="breadcrumbData"
      :panelsCompressed="panelsCompressed"
      @load-xml="loadXML"
      @toggle-panels-compressed="panelsCompressed = !panelsCompressed"
      @toggle-mini-map-open="miniMapOpen = $event"
      @saveBpmn="$emit('saveBpmn')"
      @save-state="pushToUndoStack"
    />
    <b-row class="modeler h-100">
      <b-tooltip
        v-if="tooltipTarget"
        :key="tooltipTarget.id"
        :target="getTooltipTarget"
        :title="tooltipTitle"
      />

      <controls
        :nodeTypes="nodeTypes"
        :compressed="panelsCompressed"
        :parent-height="parentHeight"
        :allowDrop="allowDrop"
        @drag="validateDropTarget"
        @handleDrop="handleDrop"
        class="controls h-100 rounded-0 border-top-0 border-bottom-0 border-left-0"
        :canvas-drag-position="canvasDragPosition"
      />
      <b-col
        class="paper-container h-100 pr-4"
        ref="paper-container"
        :class="[cursor, { 'grabbing-cursor' : isGrabbing }]"
        :style="{ width: parentWidth, height: parentHeight }"
      >

        <div ref="paper" data-test="paper" class="main-paper" />
      </b-col>

      <mini-paper
        :isOpen="miniMapOpen"
        :paperManager="paperManager"
        :graph="graph"
        :class="{ 'expanded' : panelsCompressed }"
      />

      <InspectorPanel
        ref="inspector-panel"
        :style="{ height: parentHeight }"
        :nodeRegistry="nodeRegistry"
        :moddle="moddle"
        :processNode="processNode"
        @save-state="pushToUndoStack"
        class="inspector h-100"
        :parent-height="parentHeight"
        :canvas-drag-position="canvasDragPosition"
        :compressed="panelsCompressed && noElementsSelected"
      />

      <component
        v-for="node in nodes"
        :is="node.type"
        :key="node._modelerId"
        :graph="graph"
        :paper="paper"
        :node="node"
        :id="node.id"
        :highlighted="highlightedNodes.includes(node)"
        :has-error="invalidNodes.includes(node.id)"
        :collaboration="collaboration"
        :process-node="processNode"
        :processes="processes"
        :plane-elements="planeElements"
        :moddle="moddle"
        :nodeRegistry="nodeRegistry"
        :root-elements="definitions.get('rootElements')"
        :isRendering="isRendering"
        :paperManager="paperManager"
        :auto-validate="autoValidate"
        :is-active="node === activeNode"
        @add-node="addNode"
        @remove-node="removeNode"
        @set-cursor="cursor = $event"
        @set-pool-target="poolTarget = $event"
        @click="highlightNode(node, $event)"
        @unset-pools="unsetPools"
        @set-pools="setPools"
        @save-state="pushToUndoStack"
        @set-shape-stacking="setShapeStacking"
        @setTooltip="tooltipTarget = $event"
        @replace-node="replaceNode"
      />
    </b-row>
  </span>
</template>

<script>
import Vue from 'vue';
import { dia } from 'jointjs';
import boundaryEventConfig from '../nodes/boundaryEvent';
import BpmnModdle from 'bpmn-moddle';
import controls from '../controls/controls';
import pull from 'lodash/pull';
import remove from 'lodash/remove';
import store from '@/store';
import InspectorPanel from '@/components/inspectors/InspectorPanel';
import undoRedoStore from '@/undoRedoStore';
import { Linter } from 'bpmnlint';
import linterConfig from '../../../.bpmnlintrc';
import NodeIdGenerator from '../../NodeIdGenerator';
import Process from '../inspectors/process';
import runningInCypressTest from '@/runningInCypressTest';
import getValidationProperties from '@/targetValidationUtils';
import MiniPaper from '@/components/miniPaper/MiniPaper';

import { id as laneId } from '../nodes/poolLane';
import { id as sequenceFlowId } from '../nodes/sequenceFlow';
import { id as associationId } from '../nodes/association';
import { id as messageFlowId } from '../nodes/messageFlow';

import PaperManager from '../paperManager';
import registerInspectorExtension from '@/components/InspectorExtensionManager';

import initAnchor from '@/mixins/linkManager.js';
import ensureShapeIsNotCovered from '@/components/shapeStackUtils';
import ToolBar from '@/components/toolbar/ToolBar';
import Node from '@/components/nodes/node';
import { addNodeToProcess } from '@/components/nodeManager';
import moveShapeByKeypress from '@/components/modeler/moveWithArrowKeys';
import setUpSelectionBox from '@/components/modeler/setUpSelectionBox';
import focusNameInputAndHighlightLabel from '@/components/modeler/focusNameInputAndHighlightLabel';
import XMLManager from '@/components/modeler/XMLManager';

export default {
  components: {
    ToolBar,
    controls,
    InspectorPanel,
    MiniPaper,
  },
  data() {
    return {
      tooltipTarget: null,

      /* Custom parsers for handling certain bpmn node types */
      parsers: {},

      // What bpmn moddle extensions should we register
      extensions: [],
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
      miniMapOpen: false,
      panelsCompressed: false,
      isGrabbing: false,
      isRendering: false,
      allWarnings: [],
      nodeTypes: [],
      breadcrumbData: [],
      activeNode: null,
      xmlManager: null,
      previouslyStackedShape: null,
    };
  },
  watch: {
    isRendering() {
      const loadingMessage = 'Loading process, please be patient.';

      if (this.isRendering) {
        window.ProcessMaker.alert(loadingMessage, 'warning');
        document.body.style.cursor = 'wait !important';
        this.cursor = 'wait';
        return;
      }

      window.ProcessMaker.navbar.alerts = window.ProcessMaker.navbar.alerts.filter(alert => {
        return alert.alertText !== loadingMessage;
      });
      document.body.style.cursor = 'auto';
      this.cursor = null;
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
    noElementsSelected() {
      return this.highlightedNodes.filter(node => !node.isType('processmaker-modeler-process')).length === 0;
    },
    tooltipTitle() {
      if (this.tooltipTarget) {
        return this.tooltipTarget.$el.data('title');
      }
      return undefined;
    },
    autoValidate: () => store.getters.autoValidate,
    nodes: () => store.getters.nodes,
    currentXML() {
      return undoRedoStore.getters.currentState;
    },
    /* connectors expect a highlightedNode property */
    highlightedNode: () => store.getters.highlightedNodes[0],
    highlightedNodes: () => store.getters.highlightedNodes,
    invalidNodes() {
      return Object.entries(this.validationErrors)
        .flatMap(([, errors]) => errors.map(error => error.id));
    },
  },
  methods: {
    addWarning(warning) {
      this.allWarnings.push(warning);
      this.$emit('warnings', this.allWarnings);
    },
    validatePlaneElements() {
      this.planeElements
        .filter(diagram => !diagram.bpmnElement)
        .map(diagram => ({
          title: this.$t('Non-existent Element'),
          text: this.$t('bpmdi:BPMNShape ') + diagram.id + this.$t(' references a non-existent element and was not parsed'),
        }))
        .forEach(warning => this.addWarning(warning));
    },
    cleanPlaneElements() {
      remove(this.planeElements, diagram => !diagram.bpmnElement);
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
      this.validationErrors = await this.linter.lint(this.definitions);
      this.$emit('validate', this.validationErrors);
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
    highlightNode(node, event) {
      if (event && event.shiftKey) {
        store.commit('addToHighlightedNodes', [node]);
        return;
      }

      store.commit('highlightNode', node);
    },
    blurFocusedScreenBuilderElement() {
      const elementsToBlur = ['INPUT', 'SELECT'];
      if (elementsToBlur.includes(document.activeElement && document.activeElement.tagName)) {
        document.activeElement.blur();
      }
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
    registerNode(nodeType, customParser) {
      const defaultParser = () => nodeType.id;
      const implementationParser = definition => {
        if (definition.get('implementation') === nodeType.implementation) {
          return nodeType.id;
        }
        return undefined;
      };

      this.translateConfig(nodeType.inspectorConfig[0]);
      this.nodeRegistry[nodeType.id] = nodeType;

      Vue.component(nodeType.id, nodeType.component);
      this.nodeTypes.push(nodeType);

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
    addMessageFlows() {
      if (this.collaboration) {
        this.collaboration
          .get('messageFlows')
          .filter(this.hasSourceAndTarget)
          .forEach(this.setNode);
      }
    },
    loadAssociations(flowElements, artifacts) {
      artifacts
        .filter(definition => definition.$type === 'bpmn:Association' && this.hasSourceAndTarget(definition))
        .forEach(definition => this.setNode(definition, flowElements, artifacts));
    },
    loadArtifacts(flowElements, artifacts) {
      artifacts
        .filter(definition => definition.$type !== 'bpmn:Association')
        .forEach(definition => this.setNode(definition, flowElements, artifacts));
    },
    loadSequenceFlows(flowElements, artifacts) {
      flowElements
        .filter(definition => definition.$type === 'bpmn:SequenceFlow' && this.hasSourceAndTarget(definition))
        .forEach(definition => this.setNode(definition, flowElements, artifacts));
    },
    loadFlowElements(flowElements, artifacts) {
      flowElements
        .filter(definition => definition.$type !== 'bpmn:SequenceFlow')
        .forEach(definition => this.setNode(definition, flowElements, artifacts));
    },
    addLanes(process) {
      if (process.get('laneSets')[0]) {
        process.laneSets[0].lanes.forEach(this.setNode);
      }
    },
    addPools() {
      if (!this.collaboration) {
        return;
      }
      this.collaboration.get('participants').forEach(this.setNode);
    },
    setUpDiagram() {
      this.processes.forEach(process => {
        this.ensureCancelActivityIsAddedToBoundaryEvents(process);

        this.addLanes(process);

        const flowElements = process.get('flowElements');
        const artifacts = process.get('artifacts');

        this.loadFlowElements(flowElements, artifacts);
        this.loadSequenceFlows(flowElements, artifacts);
        this.loadArtifacts(flowElements, artifacts);
        this.loadAssociations(flowElements, artifacts);
      });

      store.commit('setRootElements', this.definitions.rootElements);

      this.addMessageFlows();

      store.commit('highlightNode', this.processNode);
    },
    getCollaboration() {
      return this.definitions.rootElements.find(({ $type }) => $type === 'bpmn:Collaboration');
    },
    getProcesses() {
      return this.definitions.rootElements.filter(({ $type }) => $type === 'bpmn:Process');
    },
    getPlane() {
      return this.definitions.diagrams[0].plane;
    },
    getPlaneElements() {
      return this.plane.get('planeElement');
    },
    parse() {
      this.collaboration = this.getCollaboration();
      this.processes = this.getProcesses();
      this.plane = this.getPlane();
      this.planeElements = this.getPlaneElements();

      this.validatePlaneElements();
      this.cleanPlaneElements();

      this.processNode = new Node(
        'processmaker-modeler-process',
        this.processes[0],
        this.planeElements.find(diagram => diagram.bpmnElement.id === this.processes[0].id),
      );
    },
    removeUnsupportedElementAttributes(definition) {
      const unsupportedElements = ['extensionElements'];

      unsupportedElements.filter(name => definition.get(name))
        .forEach(name => definition.set(name, undefined));
    },
    getCustomParser(definition) {
      const parsers = this.parsers[(definition.$type)];

      if (!parsers) {
        return;
      }

      const customParser = parsers.custom.find(parser => parser(definition, this.moddle));
      const implementationParser = parsers.implementation.find(parser => parser(definition, this.moddle));
      const defaultParser = parsers.default.find(parser => parser(definition, this.moddle));

      return customParser || implementationParser || defaultParser;
    },
    handleUnsupportedElement(bpmnType, flowElements, definition, artifacts, diagram) {
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
    },
    setNode(definition, flowElements, artifacts) {
      const diagram = this.planeElements.find(diagram => diagram.bpmnElement.id === definition.id);
      const bpmnType = definition.$type;
      const parser = this.getCustomParser(definition);

      if (!parser) {
        this.handleUnsupportedElement(bpmnType, flowElements, definition, artifacts, diagram);
        return;
      }

      this.removeUnsupportedElementAttributes(definition);
      const type = parser(definition, this.moddle);

      const unnamedElements = ['bpmn:TextAnnotation', 'bpmn:Association'];
      const requireName = unnamedElements.indexOf(bpmnType) === -1;
      if (requireName && !definition.get('name')) {
        definition.set('name', '');
      }

      store.commit('addNode', new Node(type, definition, diagram));
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
      this.isRendering = true;
      await this.paperManager.performAtomicAction(async() => {
        await this.waitForCursorToChange();
        this.parse();
        this.addPools();
        this.setUpDiagram();
      });
      await this.paperManager.awaitScheduledUpdates();
      this.isRendering = false;
      this.$emit('parsed');
    },
    async loadXML(xml = this.currentXML) {
      this.definitions = await this.xmlManager.getDefinitionsFromXml(xml);
      this.xmlManager.definitions = this.definitions;
      this.nodeIdGenerator = new NodeIdGenerator(this.definitions);
      store.commit('clearNodes');
      this.renderPaper();
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
    ensureCancelActivityIsAddedToBoundaryEvents(process) {
      this.getBoundaryEvents(process).forEach(definition => {
        const boundaryEvent = this.createBoundaryEvent(definition);
        definition.get('outgoing').forEach(outgoing => outgoing.set('sourceRef', boundaryEvent));
        this.replaceDefinition(definition, boundaryEvent, process);
      });
    },
    replaceDefinition(definition, boundaryEvent, process) {
      const definitionIndex = process.get('flowElements').indexOf(definition);
      process.flowElements[definitionIndex] = boundaryEvent;
      const boundaryEventDiagram = this.planeElements.find((diagram) => {
        return diagram.bpmnElement === definition;
      });
      boundaryEventDiagram.bpmnElement = boundaryEvent;
    },
    toXML(cb) {
      this.moddle.toXML(this.definitions, { format: true }, cb);
    },
    handleDrop({ clientX, clientY, control, name }) {
      this.validateDropTarget({ clientX, clientY, control });

      if (!this.allowDrop) {
        return;
      }

      let definition = this.nodeRegistry[control.type].definition(this.moddle, this.$t);
      if (name) {
        definition.name = name;
      }
      const diagram = this.nodeRegistry[control.type].diagram(this.moddle);

      const { x, y } = this.paperManager.clientToGridPoint(clientX, clientY);
      diagram.bounds.x = x;
      diagram.bounds.y = y;

      const node = new Node(control.type, definition, diagram);

      if (node.isBpmnType('bpmn:BoundaryEvent')) {
        this.setShapeCenterUnderCursor(diagram);
      }

      this.highlightNode(node);
      this.addNode(node);
    },
    setShapeCenterUnderCursor(diagram) {
      diagram.bounds.x -= (diagram.bounds.width / 2);
      diagram.bounds.y -= (diagram.bounds.height / 2);
    },
    addNode(node) {
      node.pool = this.poolTarget;

      const targetProcess = node.getTargetProcess(this.processes, this.processNode);
      addNodeToProcess(node, targetProcess);
      node.setIds(this.nodeIdGenerator);

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
    replaceNode({ node, typeToReplaceWith }) {
      const { x: clientX, y: clientY } = this.paper.localToClientPoint(node.diagram.bounds);
      this.removeNode(node);
      this.handleDrop({
        clientX, clientY,
        control: { type: typeToReplaceWith },
        name: node.definition.get('name'),
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
    keydownListener(event) {
      const focusIsOutsideDiagram = !event.target.toString().toLowerCase().includes('body');
      if (focusIsOutsideDiagram) {
        return;
      }

      moveShapeByKeypress(
        event.key,
        store.getters.highlightedShapes,
        this.pushToUndoStack,
      );
    },
    validateDropTarget({ clientX, clientY, control }) {
      const { allowDrop, poolTarget } = getValidationProperties(clientX, clientY, control, this.paperManager.paper, this.graph, this.collaboration, this.$refs['paper-container']);
      this.allowDrop = allowDrop;
      this.poolTarget = poolTarget;
    },
    isBpmnNode(shape) {
      return shape.component != null;
    },
    setShapeStacking(shape) {
      if (this.isRendering || (!shape.component.node.isType('processmaker-modeler-pool') && shape === this.previouslyStackedShape)) {
        return;
      }

      this.previouslyStackedShape = shape;
      this.paperManager.performAtomicAction(() => ensureShapeIsNotCovered(shape, this.graph));
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
    this.xmlManager = new XMLManager(this.moddle);
    this.$emit('set-xml-manager', this.xmlManager);
  },
  mounted() {
    document.addEventListener('keydown', this.keydownListener);

    this.graph = new dia.Graph();
    store.commit('setGraph', this.graph);
    this.graph.set('interactiveFunc', cellView => {
      return {
        elementMove: cellView.model.get('elementMove'),
      };
    });

    this.paperManager = PaperManager.factory(this.$refs.paper, this.graph.get('interactiveFunc'), this.graph);
    this.paper = this.paperManager.paper;

    this.paperManager.addEventHandler('cell:pointerdblclick', focusNameInputAndHighlightLabel);

    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    store.commit('setPaper', this.paperManager.paper);

    this.paperManager.addEventHandler('blank:pointerclick', () => {
      store.commit('highlightNode', this.processNode);
    }, this);

    this.paperManager.addEventHandler('element:pointerclick', this.blurFocusedScreenBuilderElement, this);

    this.paperManager.addEventHandler('blank:pointerdown', (event, x, y) => {
      const scale = this.paperManager.scale;
      this.canvasDragPosition = { x: x * scale.sx, y: y * scale.sy };
      this.isGrabbing = true;
    }, this);
    this.paperManager.addEventHandler('cell:pointerup blank:pointerup', () => {
      this.canvasDragPosition = null;
      this.isGrabbing = false;
      this.activeNode = null;
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

    this.paperManager.addEventHandler('cell:pointerclick', ({ model: shape }, event) => {
      if (!this.isBpmnNode(shape)) {
        return;
      }

      shape.component.$emit('click', event);
    });

    this.paperManager.addEventHandler('cell:pointerdown', ({ model: shape }) => {
      if (!this.isBpmnNode(shape)) {
        return;
      }

      this.setShapeStacking(shape);
      this.activeNode = shape.component.node;
    });

    initAnchor();

    let cursor;
    const setCursor = () => {
      cursor = this.cursor;
      this.cursor = 'crosshair';
    };
    const resetCursor = () => this.cursor = cursor;
    setUpSelectionBox(setCursor, resetCursor, this.paperManager, this.graph);

    /* Register custom nodes */
    window.ProcessMaker.EventBus.$emit('modeler-start', {
      loadXML: xml => {
        this.loadXML(xml);
        undoRedoStore.dispatch('pushState', xml);
      },
      addWarnings: warnings => this.$emit('warnings', warnings),
      addBreadcrumbs: breadcrumbs => this.breadcrumbData.push(breadcrumbs),
    });
  },
};
</script>
<style lang="scss" src="./modeler.scss" />
