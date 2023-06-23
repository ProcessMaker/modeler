<template>
  <span data-test="body-container">
    <div class="modeler h-100">
      <controls
        v-if="showControls"
        class="controls h-100 rounded-0 border-top-0 border-bottom-0 border-left-0"
        :nodeTypes="nodeTypes"
        :compressed="panelsCompressed"
        :parent-height="parentHeight"
        :allowDrop="allowDrop"
        :canvas-drag-position="canvasDragPosition"
        @drag="validateDropTarget"
        @handleDrop="handleDrop"
      />
      <b-col
        ref="paper-container"
        class="paper-container h-100 pr-4"
        :class="[cursor, { 'grabbing-cursor' : isGrabbing }]"
        :style="{ width: parentWidth, height: parentHeight }"
      >

        <div ref="paper" data-test="paper" class="main-paper" />
      </b-col>

      <component
        ref="nodeComponent"
        v-for="node in nodes"
        :is="node.type"
        :key="node._modelerId"
        :graph="graph"
        :paper="paper"
        :node="node"
        :id="node.id"
        :border-outline="borderOutline(node.id)"
        :collaboration="collaboration"
        :process-node="processNode"
        :processes="processes"
        :plane-elements="planeElements"
        :moddle="moddle"
        :nodeRegistry="nodeRegistry"
        :root-elements="definitions.get('rootElements')"
        :paperManager="paperManager"
        :auto-validate="autoValidate"
        :node-id-generator="nodeIdGenerator"
        :highlighted="highlightedNodes.includes(node)"
        :is-active="node === activeNode"
        :is-rendering="isRendering"
        :is-completed="requestCompletedNodes.includes(node.definition.id)"
        :is-in-progress="requestInProgressNodes.includes(node.definition.id)"
        :is-idle="requestIdleNodes.includes(node.definition.id)"
        @add-node="addNode"
        @set-cursor="cursor = $event"
        @set-pool-target="poolTarget = $event"
        @unset-pools="unsetPools"
        @clearSelection="clearSelection"
        @set-pools="setPools"
        @set-shape-stacking="setShapeStacking"
        @default-flow="toggleDefaultFlow"
      />

      <div class="rail-container">
        <div class="rail-left">
          <ZoomControl
            :paper-manager="paperManager"
          />
        </div>
      </div>

      <Selection
        v-if="paper"
        ref="selector"
        :graph="graph"
        :paperManager="paperManager"
        :useModelGeometry="false"
        :processNode="processNode"
      />
    </div>
  </span>
</template>

<script>
import Vue from 'vue';
import _ from 'lodash';
import { dia } from 'jointjs';
import boundaryEventConfig from '../nodes/boundaryEvent';
import BpmnModdle from 'bpmn-moddle';
import controls from '../controls/controls';
import pull from 'lodash/pull';
import remove from 'lodash/remove';
import store from '@/store';
import nodeTypesStore from '@/nodeTypesStore';
import undoRedoStore from '@/undoRedoStore';
import { Linter } from 'bpmnlint';
import linterConfig from '../../../.bpmnlintrc';
import { getNodeIdGenerator } from '../../NodeIdGenerator';
import Process from '../inspectors/process';
import runningInCypressTest from '@/runningInCypressTest';
import getValidationProperties from '@/targetValidationUtils';
import { id as laneId } from '@/components/nodes/poolLane/config';
import { id as sequenceFlowId } from '../nodes/sequenceFlow';
import { id as associationId } from '../nodes/association';
import { id as messageFlowId } from '../nodes/messageFlow/config';
import { id as dataOutputAssociationFlowId } from '../nodes/dataOutputAssociation/config';
import { id as dataInputAssociationFlowId } from '../nodes/dataInputAssociation/config';
import { id as genericFlowId } from '@/components/nodes/genericFlow/config';

import PaperManager from '../paperManager';
import registerInspectorExtension from '@/components/InspectorExtensionManager';

import ensureShapeIsNotCovered from '@/components/shapeStackUtils';
import Node from '@/components/nodes/node';
import { addNodeToProcess } from '@/components/nodeManager';
import TimerEventNode from '@/components/nodes/timerEventNode';
import focusNameInputAndHighlightLabel from '@/components/modeler/focusNameInputAndHighlightLabel';
import XMLManager from '@/components/modeler/XMLManager';
import { NodeMigrator } from '@/components/modeler/NodeMigrator';
import addLoopCharacteristics from '@/setup/addLoopCharacteristics';
import Selection from './Selection';
import ZoomControl from '@/components/railBottom/zoomControl/ZoomControl.vue';

export default {
  components: {
    controls,
    Selection,
    ZoomControl,
  },
  props: {
    owner: Object,
    decorations: {
      type: Object,
      default() {
        return {};
      },
    },
    readOnly: {
      type: Boolean,
      default: true,
    },
    requestIdleNodes: {
      type: Array,
      default: () => [],
    },
    requestCompletedNodes: {
      type: Array,
      default: () => [],
    },
    requestInProgressNodes: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      pasteInProgress: false,
      cloneInProgress: false,
      internalClipboard: [],

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
      pmBlockNodes: [],
      activeNode: null,
      xmlManager: null,
      previouslyStackedShape: null,
      canvasScale: 1,
      initialScale: 1,
      minimumScale: 0.2,
      scaleStep: 0.1,
      isDragging: false,
      isSelecting: false,
      isIntoTheSelection: false,
      dragStart: null,
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
    canvasScale(canvasScale) {
      this.paperManager.scale = canvasScale;
    },
  },
  computed: {
    showControls() {
      return !this.readOnly;
    },
    autoValidate: () => store.getters.autoValidate,
    nodes: () => store.getters.nodes,
    currentXML() {
      return undoRedoStore.getters.currentState;
    },
    /* connectors expect a highlightedNode property */
    highlightedNode: () => store.getters.highlightedNodes[0],
    highlightedNodes: () => store.getters.highlightedNodes,
  },
  methods: {
    toggleDefaultFlow(flow) {
      const source = flow.definition.sourceRef;
      if (source.default && source.default.id === flow.id) {
        flow = null;
      }
      source.set('default', flow);
    },
    borderOutline(nodeId) {
      return this.decorations.borderOutline && this.decorations.borderOutline[nodeId];
    },
    cleanPlaneElements() {
      remove(this.planeElements, diagram => !diagram.bpmnElement);
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
      if (!store.getters.globalProcesses || store.getters.globalProcesses.length === 0) {
        await store.dispatch('fetchGlobalProcesses');
      }
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
      if (!node || !this.highlightedNode) {
        return;
      }

      if (event && event.shiftKey) {
        store.commit('addToHighlightedNodes', [node]);
        return;
      }

      let isSameHighlightedNode = _.isEqual(node.id, this.highlightedNode.id);

      if (!isSameHighlightedNode) {
        store.commit('highlightNode', node);
      }

      return;
    },
    blurFocusedScreenBuilderElement() {
      const elementsToBlur = ['INPUT', 'SELECT'];
      if (elementsToBlur.includes(document.activeElement && document.activeElement.tagName)) {
        document.activeElement.blur();
      }
    },
    registerStatusBar(component) {
      this.owner.validationBar.push(component);
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
      addLoopCharacteristics(nodeType);
      this.nodeRegistry[nodeType.id] = nodeType;

      Vue.component(nodeType.id, nodeType.component);
      this.nodeTypes.push(nodeType);

      const types = Array.isArray(nodeType.bpmnType)
        ? nodeType.bpmnType
        : [nodeType.bpmnType];

      types.forEach(bpmnType => {
        if (!this.parsers[bpmnType]) {
          this.parsers[bpmnType] = { custom: [], implementation: [], default: []};
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
    registerPmBlock(pmBlockNode, customParser) {
      const defaultParser = () => pmBlockNode.id;

      this.translateConfig(pmBlockNode.inspectorConfig[0]);
      addLoopCharacteristics(pmBlockNode);
      this.nodeRegistry[pmBlockNode.id] = pmBlockNode;

      Vue.component(pmBlockNode.id, pmBlockNode.component);
      this.pmBlockNodes.push(pmBlockNode);

      const types = Array.isArray(pmBlockNode.bpmnType)
        ? pmBlockNode.bpmnType
        : [pmBlockNode.bpmnType];

      types.forEach(bpmnType => {
        if (customParser) {
          this.parsers[bpmnType].custom.push(customParser);
          return;
        }
        this.parsers[bpmnType].default.push(defaultParser);
      });
      nodeTypesStore.commit('setPmBlockNodeTypes', this.pmBlockNodes);
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
    loadDataAssociations(flowElements) {
      const tasksThatHaveDataOutputAssociations = flowElements.filter(task => task.get('dataOutputAssociations') &&
          task.get('dataOutputAssociations').length > 0);

      tasksThatHaveDataOutputAssociations.forEach(task => {
        task.get('dataOutputAssociations').forEach(dataAssociationLink => {
          this.setNode(dataAssociationLink, flowElements);
        });
      });

      const tasksThatHaveDataInputAssociations = flowElements.filter(task => task.get('dataInputAssociations') &&
          task.get('dataInputAssociations').length > 0);

      tasksThatHaveDataInputAssociations.forEach(task => {
        task.get('dataInputAssociations').forEach(dataAssociationLink => {
          this.setNode(dataAssociationLink, flowElements);
        });
      });
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
        this.loadDataAssociations(flowElements);
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

      const unnamedElements = ['bpmn:TextAnnotation', 'bpmn:Association', 'bpmn:DataOutputAssociation', 'bpmn:DataInputAssociation'];
      const requireName = unnamedElements.indexOf(bpmnType) === -1;
      if (requireName && !definition.get('name')) {
        definition.set('name', '');
      }

      const node = this.createNode(type, definition, diagram);

      store.commit('addNode', node);
    },
    createNode(type, definition, diagram) {
      if (Node.isTimerType(type)) {
        return new TimerEventNode(type, definition, diagram);
      }
      // Remove undefined or null properties
      Object.keys(definition).forEach(key => {
        if (definition[key] === undefined || definition[key] === null) {
          delete definition[key];
        }
      });
      return new Node(type, definition, diagram);
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
    async loadXML(xml = null) {
      let emitChangeEvent = false;
      if (xml === null) {
        xml = this.currentXML;
        emitChangeEvent = true;
      }
      this.definitions = await this.xmlManager.getDefinitionsFromXml(xml);
      this.xmlManager.definitions = this.definitions;
      this.nodeIdGenerator = getNodeIdGenerator(this.definitions);
      store.commit('clearNodes');
      await this.renderPaper();
      if (emitChangeEvent) {
        window.ProcessMaker.EventBus.$emit('modeler-change');
      }
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
      boundaryEvent.set('color', definition.get('color'));
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
    async handleDrop({ clientX, clientY, control, nodeThatWillBeReplaced }) {
      this.validateDropTarget({ clientX, clientY, control });

      if (!this.allowDrop) {
        return;
      }

      const definition = this.nodeRegistry[control.type].definition(this.moddle, this.$t);

      const diagram = this.nodeRegistry[control.type].diagram(this.moddle);

      const { x, y } = this.paperManager.clientToGridPoint(clientX, clientY);
      diagram.bounds.x = x;
      diagram.bounds.y = y;

      const newNode = this.createNode(control.type, definition, diagram);

      if (newNode.isBpmnType('bpmn:BoundaryEvent')) {
        this.setShapeCenterUnderCursor(diagram);
      }

      this.highlightNode(newNode);
      await this.addNode(newNode);
      if (!nodeThatWillBeReplaced) {
        return;
      }

      const nodeMigrator = new NodeMigrator(
        nodeThatWillBeReplaced,
        definition,
        this.graph,
        newNode,
        this.processes,
        this.collaboration,
      );
      nodeMigrator.migrate();

      return newNode;
    },
    setShapeCenterUnderCursor(diagram) {
      diagram.bounds.x -= (diagram.bounds.width / 2);
      diagram.bounds.y -= (diagram.bounds.height / 2);
    },
    async selectNewNode(node) {
      await this.$nextTick();
      await this.paperManager.awaitScheduledUpdates();
      const newNodeComponent = this.$refs.nodeComponent.find(component => component.node === node);
      const view = newNodeComponent.shapeView;
      await this.$refs.selector.selectElement(view);
    },
    async addNode(node) {
      if (!node.pool) {
        node.pool = this.poolTarget;
      }

      const targetProcess = node.getTargetProcess(this.processes, this.processNode);
      addNodeToProcess(node, targetProcess);
      node.setIds(this.nodeIdGenerator);

      this.planeElements.push(node.diagram);
      store.commit('addNode', node);
      this.poolTarget = null;

      // add processmaker-modeler-generic-flow
      if ([
        sequenceFlowId,
        laneId,
        associationId,
        messageFlowId,
        dataOutputAssociationFlowId,
        dataInputAssociationFlowId,
        genericFlowId,
      ].includes(node.type)) {
        return;
      }

      // Select the node after it has been added to the store (does not apply to flows)
      this.selectNewNode(node);
    },
    async addClonedNodes(nodes) {
      nodes.forEach(node => {
        if (!node.pool) {
          node.pool = this.poolTarget;
        }

        const targetProcess = node.getTargetProcess(this.processes, this.processNode);
        addNodeToProcess(node, targetProcess);

        this.planeElements.push(node.diagram);
        store.commit('addNode', node);
        this.poolTarget = null;
      });
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
    clearSelection(){
      this.$refs.selector.clearSelection();
    },
    isPointInSelection(event) {
      const selector = this.$refs.selector.$el;
      if (typeof selector.getBoundingClientRect === 'function') {
        // check if mouse was clicked inside the selector
        const { x: sx, y: sy, width:swidth, height: sheight } = selector.getBoundingClientRect();
        if (event.clientX >= sx && event.clientX <= sx + swidth && event.clientY >= sy && event.clientY <= sy + sheight) {
          return true;
        }
      }
      return false;
    },
    async pointerDownInShape(event, element) {
      const { clientX: x, clientY: y } = event;
      const shapeView = this.paper.findViewByModel(element);
      this.isDragging = false;
      this.isSelecting = false;
      this.isIntoTheSelection = false;
      this.dragStart = { x, y };
      // Verify if is in the selection box
      if (this.isPointInSelection(event)) {
        this.isIntoTheSelection = true;
      } else {
        if (!event.shiftKey) {
          await this.$refs.selector.selectElement(shapeView);
          await this.$nextTick();
        }
      }
      this.$refs.selector.startDrag({
        clientX: event.clientX,
        clientY: event.clientY,
      });
    },
    pointerUpHandler(event, cellView) {
      // is clicked over the shape
      if (cellView) {
        this.$refs.selector.selectElement(cellView);
      } else {
        this.clearSelection();
      }

      this.isDragging = false;
      this.dragStart = null;
      this.isSelecting = false;
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
      registerStatusBar: this.registerStatusBar,
      registerPmBlock: this.registerPmBlock,
    });

    this.moddle = new BpmnModdle(this.extensions);
    this.linter = new Linter(linterConfig);
    this.xmlManager = new XMLManager(this.moddle);
    this.$emit('set-xml-manager', this.xmlManager);
  },
  mounted() {
    store.commit('setReadOnly', this.readOnly);

    this.graph = new dia.Graph();
    store.commit('setGraph', this.graph);
    this.graph.set('interactiveFunc', cellView => {
      const isPoolEdge = cellView.model.get('type') === 'standard.EmbeddedImage';
      return {
        elementMove: isPoolEdge,
        labelMove: false,
      };
    });

    this.paperManager = PaperManager.factory(this.$refs.paper, this.graph.get('interactiveFunc'), this.graph);
    this.paper = this.paperManager.paper;

    this.paperManager.addEventHandler('cell:pointerdblclick', focusNameInputAndHighlightLabel);

    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    store.commit('setPaper', this.paperManager.paper);

    this.paperManager.addEventHandler('element:pointerclick', this.blurFocusedScreenBuilderElement, this);

    this.paperManager.addEventHandler('blank:pointerdown', (event, x, y) => {
      const scale = this.paperManager.scale;
      this.canvasDragPosition = { x: x * scale.sx, y: y * scale.sy };
      this.isGrabbing = true;
    }, this);

    this.paperManager.addEventHandler('cell:mouseover element:mouseover', ({ model: shape }) => {
      if (this.isBpmnNode(shape) && shape.attr('body/cursor') !== 'default' && !this.isGrabbing) {
        shape.attr('body/cursor', 'move');
      }
      // If the user is panning the Paper while hovering an element, ignore the default move cursor
      if (this.isGrabbing && this.isBpmnNode(shape)) {
        shape.attr('body/cursor', 'grabbing');
      }
    });
    this.paperManager.addEventHandler('blank:pointerup', (event) => {
      this.canvasDragPosition = null;
      this.isGrabbing = false;
      this.activeNode = null;
      this.pointerUpHandler(event);
    }, this);

    this.paperManager.addEventHandler('cell:pointerup', (cellView, event) => {
      this.canvasDragPosition = null;
      this.activeNode = null;
      this.pointerUpHandler(event, cellView);
    }, this);

    this.$el.addEventListener('mousemove', event => {
      if (this.canvasDragPosition) {
        this.paperManager.translate(
          event.offsetX - this.canvasDragPosition.x,
          event.offsetY - this.canvasDragPosition.y,
        );
      }
    }, this);

    this.$el.addEventListener('mouseenter', () => {
      store.commit('setClientLeftPaper', false);
    });

    this.$el.addEventListener('mouseleave', () => {
      this.paperManager.removeEventHandler('blank:pointermove');
      store.commit('setClientLeftPaper', true);
    });

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

      // ignore click event if the user is grabbing the paper.
      if (this.isGrabbing) {
        return;
      }

      shape.component.$emit('click', event);
      this.$emit('click', {
        event,
        node: this.highlightedNode.definition,
      });
    });

    this.paperManager.addEventHandler('cell:pointerdown', ({ model: shape }, event) => {
      if (!this.isBpmnNode(shape)) {
        return;
      }
      // If the user is pressing Space (grabbing) and clicking on a Cell, return
      if (this.isGrabbing) {
        return;
      }
      this.setShapeStacking(shape);
      this.activeNode = shape.component.node;
      this.isOverShape = true;
      this.pointerDownInShape(event, shape);
    });
    // If the user is grabbing the paper while he clicked in a cell, move the paper and not the cell
    this.paperManager.addEventHandler('cell:pointermove', (_, event, x, y) => {
      if (this.isGrabbing) {
        if (!this.canvasDragPosition) {
          const scale = this.paperManager.scale;
          this.canvasDragPosition = { x: x * scale.sx, y: y * scale.sy };
        }
        if (this.canvasDragPosition && !this.clientLeftPaper) {
          this.paperManager.translate(
            event.offsetX - this.canvasDragPosition.x,
            event.offsetY - this.canvasDragPosition.y
          );
        }
      }
    });

    /* Register custom nodes */
    window.ProcessMaker.EventBus.$emit('modeler-start', {
      loadXML: async(xml) => {
        await this.loadXML(xml);
      },
    });
  },
};
</script>
<style lang="scss" src="./modeler.scss" />
<style lang="scss">
svg {
  overflow: visible !important;
}

.rail {
  &-container {
    position: relative;
    bottom: 60px;
    display: inline-block;
    height: 48px;
    max-height: 48px;
    z-index: 2;
  }

  &-left {
    position: absolute;
    display: inline;
    width: auto;
    padding: 0 12px;
  }
}
</style>
