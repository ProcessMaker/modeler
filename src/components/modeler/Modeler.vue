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
      @saveBpmn="saveBpmn"
      @close="close"
      @save-state="pushToUndoStack"
      @clearSelection="clearSelection"
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
        v-show="!(highlightedNodes.length > 1)"
        :style="{ height: parentHeight }"
        :nodeRegistry="nodeRegistry"
        :moddle="moddle"
        :definitions="definitions"
        :processNode="processNode"
        @save-state="pushToUndoStack"
        class="inspector h-100"
        :parent-height="parentHeight"
        :canvas-drag-position="canvasDragPosition"
        :compressed="panelsCompressed && noElementsSelected"
        @shape-resize="shapeResize"
      />

      <component
        v-for="node in nodes"
        :is="node.type"
        :key="node._modelerId"
        ref="nodeComponent"
        :graph="graph"
        :paper="paper"
        :node="node"
        :id="node.id"
        :highlighted="highlightedNodes.includes(node)"
        :has-error="invalidNodes.includes(node)"
        :border-outline="borderOutline(node.id)"
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
        :node-id-generator="nodeIdGenerator"
        @add-node="addNode"
        @remove-node="removeNode"
        @set-cursor="cursor = $event"
        @set-pool-target="poolTarget = $event"
        @unset-pools="unsetPools"
        @clearSelection="clearSelection"
        @set-pools="setPools"
        @save-state="pushToUndoStack"
        @set-shape-stacking="setShapeStacking"
        @setTooltip="tooltipTarget = $event"
        @replace-node="replaceNode"
        @replace-generic-flow="replaceGenericFlow"
        @copy-element="copyElement"
        @default-flow="toggleDefaultFlow"
        @shape-resize="shapeResize"
      />
      <selection
        v-if="paper"
        ref="selector"
        :graph="graph"
        :paperManager="paperManager"
        :useModelGeometry="false"
        @remove-nodes="removeNodes"
        :processNode="processNode"
        @save-state="pushToUndoStack"
      />
    </b-row>
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
import InspectorPanel from '@/components/inspectors/InspectorPanel';
import undoRedoStore from '@/undoRedoStore';
import { Linter } from 'bpmnlint';
import linterConfig from '../../../.bpmnlintrc';
import NodeIdGenerator from '../../NodeIdGenerator';
import Process from '../inspectors/process';
import runningInCypressTest from '@/runningInCypressTest';
import getValidationProperties from '@/targetValidationUtils';
import MiniPaper from '@/components/miniPaper/MiniPaper';
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
import ToolBar from '@/components/toolbar/ToolBar';
import Node from '@/components/nodes/node';
import { addNodeToProcess } from '@/components/nodeManager';
import hotkeys from '@/components/hotkeys/main';
import TimerEventNode from '@/components/nodes/timerEventNode';
import focusNameInputAndHighlightLabel from '@/components/modeler/focusNameInputAndHighlightLabel';
import XMLManager from '@/components/modeler/XMLManager';
import { removeNodeFlows, removeNodeMessageFlows, removeNodeAssociations, removeOutgoingAndIncomingRefsToFlow, removeBoundaryEvents, removeSourceDefault } from '@/components/crown/utils';
import { getInvalidNodes } from '@/components/modeler/modelerUtils';
import { NodeMigrator } from '@/components/modeler/NodeMigrator';
import addLoopCharacteristics from '@/setup/addLoopCharacteristics';

import ProcessmakerModelerGenericFlow from '@/components/nodes/genericFlow/genericFlow';

import Selection from './Selection';

export default {
  components: {
    ToolBar,
    controls,
    InspectorPanel,
    MiniPaper,
    ProcessmakerModelerGenericFlow,
    Selection,
  },
  props: {
    owner: Object,
    decorations: {
      type: Object,
      default() {
        return {};
      },
    },
  },
  mixins: [hotkeys],
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
      keyMod: this.isAppleOS() ? 'Command' : 'Control',
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
      return getInvalidNodes(this.validationErrors, this.nodes);
    },
  },
  methods: {
    isAppleOS() {
      return typeof navigator !== 'undefined' && /Mac|iPad|iPhone/.test(navigator.platform);
    },
    async shapeResize() {
      await this.$nextTick();
      await this.paperManager.awaitScheduledUpdates();
      this.$refs.selector.updateSelectionBox(true);
    },
    toggleDefaultFlow(flow) {
      const source = flow.definition.sourceRef;
      if (source.default && source.default.id === flow.id) {
        flow = null;
      }
      source.set('default', flow);
    },
    copyElement(node, copyCount) {
      const clonedNode = node.clone(this.nodeRegistry, this.moddle, this.$t);
      const yOffset = (node.diagram.bounds.height + 30) * copyCount;

      clonedNode.diagram.bounds.y += yOffset;
      this.addNode(clonedNode);
    },
    async close() {
      this.$emit('close');
    },
    async saveBpmn() {
      const svg = document.querySelector('.mini-paper svg');
      const css = 'text { font-family: sans-serif; }';
      const style = document.createElement('style');
      style.appendChild(document.createTextNode(css));

      svg.appendChild(style);
      const xml = await this.getXmlFromDiagram();
      const svgString = (new XMLSerializer()).serializeToString(svg);

      this.$emit('saveBpmn', { xml, svg: svgString });
    },
    borderOutline(nodeId) {
      return this.decorations.borderOutline && this.decorations.borderOutline[nodeId];
    },
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
      try {
        const xml = await this.getXmlFromDiagram();
        undoRedoStore.dispatch('pushState', xml);
        window.ProcessMaker.EventBus.$emit('modeler-change');
      } catch (invalidXml) {
        // eslint-disable-next-line no-console
        console.warn(invalidXml.message);
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

      return new Promise(resolve => {
        setTimeout(() => {
          this.pushToUndoStack();
          resolve();
        });
      });
    },
    async removeNode(node, { removeRelationships = true } = {}) {
      if (removeRelationships) {
        removeNodeFlows(node, this);
        removeNodeMessageFlows(node, this);
        removeNodeAssociations(node, this);
      }
      removeOutgoingAndIncomingRefsToFlow(node);
      removeBoundaryEvents(this.graph, node, this.removeNode);
      removeSourceDefault(node);

      this.removeNodesFromLane(node);
      this.removeNodesFromPool(node);
      store.commit('removeNode', node);
      store.commit('highlightNode', this.processNode);
      this.$refs.selector.clearSelection();
      await this.$nextTick();
      this.pushToUndoStack();
    },
    async removeNodes() {
      this.performSingleUndoRedoTransaction(async() => {
        await this.paperManager.performAtomicAction(async() => {
          const waitPromises = [];
          this.highlightedNodes.forEach((node) =>
            waitPromises.push(this.removeNode(node, { removeRelationships: true }))
          );
          await Promise.all(waitPromises);
          store.commit('highlightNode');
        });
      });
    },
    replaceNode({ node, typeToReplaceWith }) {
      this.performSingleUndoRedoTransaction(async() => {
        await this.paperManager.performAtomicAction(async() => {
          const { x: clientX, y: clientY } = this.paper.localToClientPoint(node.diagram.bounds);
          const newNode = await this.handleDrop({
            clientX, clientY,
            control: { type: typeToReplaceWith },
            nodeThatWillBeReplaced: node,
          });

          await this.removeNode(node, { removeRelationships: false });
          this.highlightNode(newNode);
          this.selectNewNode(newNode);
        });
      });
    },
    replaceGenericFlow({ actualFlow, genericFlow, targetNode }) {
      this.performSingleUndoRedoTransaction(async() => {
        await this.paperManager.performAtomicAction(async() => {
          await this.highlightNode(null);
          await this.$nextTick();
          await this.addNode(actualFlow);
          await store.commit('removeNode', genericFlow);
          await this.$nextTick();
          await this.highlightNode(targetNode);
        });
      });
    },
    async performSingleUndoRedoTransaction(cb) {
      undoRedoStore.commit('disableSavingState');
      await cb();
      undoRedoStore.commit('enableSavingState');
      this.pushToUndoStack();
    },
    removeNodesFromLane(node) {
      const containingLane = node.pool && node.pool.component.laneSet &&
        node.pool.component.laneSet.get('lanes').find(lane => {
          return lane.get('flowNodeRef').includes(node.definition);
        });

      if (!containingLane) {
        return;
      }

      pull(containingLane.get('flowNodeRef'), node.definition);
    },
    removeNodesFromPool(node) {
      if (node.type === 'processmaker-modeler-pool' && node.definition.processRef) {
        if (node.definition.processRef.artifacts) {
          node.definition.processRef.artifacts.forEach(artifact => {
            const nodeToRemove = this.nodes.find(n => n.definition === artifact);
            if (nodeToRemove) {
              this.removeNode(nodeToRemove);
            }
          });
        }
        if (node.definition.processRef.flowElements) {
          node.definition.processRef.flowElements.forEach(flowElement => {
            const nodeToRemove = this.nodes.find(n => n.definition === flowElement);
            if (nodeToRemove) {
              this.removeNode(nodeToRemove);
            }
          });
        }
        let laneSets = node.definition.processRef.laneSets;
        if (!!laneSets && laneSets.length > 0) {
          laneSets[0].lanes.forEach(lane => {
            const nodeToRemove = this.nodes.find(n => n.definition === lane);
            if (nodeToRemove) {
              this.removeNode(nodeToRemove);
            }
          });
        }
      }
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
    showSavedNotification() {
      undoRedoStore.dispatch('saved');
    },
    enableVersions() {
      undoRedoStore.dispatch('enableVersions');
    },
    setVersionIndicator(isDraft) {
      undoRedoStore.dispatch('setVersionIndicator', isDraft);
    },
    setLoadingState(isLoading) {
      undoRedoStore.dispatch('setLoadingState', isLoading);
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
    async pointerDowInShape(event, element) {
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
    pointerDownHandler(event) {
      const { clientX: x, clientY: y } = event;
      this.isDragging = false;
      this.isSelecting = false;
      this.isIntoTheSelection = false;
      this.dragStart = { x, y };
      // Verify if is in the selection box
      if (this.isPointInSelection(event)) {
        this.isIntoTheSelection = true;
        this.$refs.selector.startDrag({
          clientX: event.clientX,
          clientY: event.clientY,
        });
      } else {
        this.isSelecting = true;
        this.$refs.selector.startSelection(event);
      }
    },
    pointerMoveHandler(event) {
      const { clientX: x, clientY: y } = event;
      if (this.dragStart && (Math.abs(x - this.dragStart.x) > 5 || Math.abs(y - this.dragStart.y) > 5)) {
        this.isDragging = true;
        this.dragStart = null;
      } else {
        if (this.isSelecting) {
          this.$refs.selector.updateSelection(event);
        } else {
          if (this.isDragging) {
            this.$refs.selector.drag(event);
          }
        }
      }
    },
    pointerUpHandler(event, cellView) {
      if (!this.isDragging && this.dragStart) {
        // is clicked over the shape
        if (cellView) {
          this.$refs.selector.stopDrag(event);
          this.$refs.selector.selectElement(cellView, event.shiftKey);
        } else {
          this.clearSelection();
        }
      } else {
        if (this.isSelecting) {
          this.$refs.selector.endSelection(this.paperManager.paper);
        } else {
          this.$refs.selector.stopDrag(event);
        }
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
      registerStatusBar: this.registerStatusBar,
    });

    this.moddle = new BpmnModdle(this.extensions);
    this.linter = new Linter(linterConfig);
    this.xmlManager = new XMLManager(this.moddle);
    this.$emit('set-xml-manager', this.xmlManager);
  },
  mounted() {
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
      if (this.isGrabbing) return;
      const scale = this.paperManager.scale;
      this.canvasDragPosition = { x: x * scale.sx, y: y * scale.sy };
      this.isOverShape = false;
      this.pointerDownHandler(event);
    }, this);
    this.paperManager.addEventHandler('blank:pointerup', (event) => {
      this.canvasDragPosition = null;
      this.activeNode = null;
      this.pointerUpHandler(event);
    }, this);
    this.paperManager.addEventHandler('cell:pointerup', (cellView, event) => {
      this.canvasDragPosition = null;
      this.activeNode = null;
      this.pointerUpHandler(event, cellView);
    }, this);

    this.$el.addEventListener('mousemove', event => {
      this.pointerMoveHandler(event);
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

      shape.component.$emit('click', event);
    });

    this.paperManager.addEventHandler('cell:pointerdown', ({ model: shape }, event) => {
      if (!this.isBpmnNode(shape)) {
        return;
      }
      this.setShapeStacking(shape);
      this.activeNode = shape.component.node;
      this.isOverShape = true;
      this.pointerDowInShape(event, shape);
    });

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
