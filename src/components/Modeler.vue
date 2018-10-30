<template>
  <div class="modeler">
    <div class="modeler-container">
      <controls />

      <div ref="paper-container" class="paper-container" :class="cursor">
        <drop @drop="handleDrop" @dragover="validateDropTarget">
          <div ref="paper" />
        </drop>
      </div>

      <div class="inspector">
        <vue-form-renderer ref="inspector" :data="inspectorData" @update="inspectorHandler" :config="inspectorConfig" />
      </div>

    </div>
    <div class="definitions-container" v-if="definitions">
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
        :processNode="processNode"
        @add-node="addNode"
        @set-cursor="cursor = $event"
      />
    </div>
  </div>
</template>

<script>
import BpmnModdle from "bpmn-moddle";
import controls from "./controls";
import throttle from 'lodash/throttle';

// Our renderer for our inspector

// Our nodes
import task from "./nodes/task";
import startEvent from "./nodes/startEvent";
import endEvent from "./nodes/endEvent";
import sequenceFlow from "./nodes/sequenceFlow";
import association from "./nodes/association";
import exclusiveGateway from "./nodes/exclusiveGateway";
import textAnnotation from "./nodes/textAnnotation";
import {VueFormRenderer, renderer } from "@processmaker/vue-form-builder";
import pool from "./nodes/pool";
import processInspectorConfig from "./inspectors/process";

import { Drag, Drop } from 'vue-drag-drop';

// Bring in inspector items
import {
  FormInput,
  FormSelect,
  FormTextArea,
  FormCheckbox,
  FormRadioButtonGroup,
  FormDatePicker,
} from "@processmaker/vue-form-elements";


let version = "1.0";

if (!window.joint) {
  window.joint = require("jointjs");
}

const bpmnTypeMap = {
  'bpmn:StartEvent': 'startEvent',
  'bpmn:EndEvent': 'endEvent',
  'bpmn:Task': 'task',
  'bpmn:ExclusiveGateway': 'exclusiveGateway',
  'bpmn:SequenceFlow': 'sequenceFlow',
  'bpmn:Association': 'association',
  'bpmn:TextAnnotation': 'textAnnotation',
};

export default {
  components: {
    Drag,
    Drop,
    controls,
    task,
    startEvent,
    endEvent,
    sequenceFlow,
    association,
    exclusiveGateway,
    textAnnotation,
    pool,
    VueFormRenderer,
  },
  data() {
    return {
      // What bpmn moddle extensions should we register
      extensions: [

      ],
      // Our jointjs data graph model
      graph: null,
      // Our jointjs paper
      paper: null,
      definitions: null,
      planeElements: null,
      canvasDragPosition: null,
      // This is our id based lookup model
      inspectors: {
        process: processInspectorConfig,
      },
      processNode: null,
      inspectorNode: null,
      inspectorData: null,
      inspectorHandler: () => {},
      highlighted: null,
      inspectorConfig: [
        {
          name: "Empty",
          items: [],
        },
      ],
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
      this.inspectorData = JSON.parse(
        JSON.stringify(this.inspectorNode, function(key, value) {
          // Empty key is the object itself
          if (key == "") {
            return value;
          }
          if (typeof value == "object") {
            return undefined;
          }
          return value;
        })
      );
    },
  },
  methods: {
    /**
     * Register a BPMN Moddle extension in order to support extensions to the bpmn xml format.
     * This is used to support new attributes and elements that would be needed for specific
     * bpmn execution environments.
     */
    registerBpmnExtension(namespace, extension) {
      this.extensions[namespace] = extension;
    },
    // Parses our definitions and graphs and stores them in our id based lookup model
    parse() {
      // get the top level process objects
      // All root elements are bpmn:process types
      this.definitions.rootElements.forEach(process => {
        this.processes.push(process);
        this.processNode = process;
        this.inspectorConfig = this.inspectors["process"];
        this.inspectorNode = this.processNode;

        // Now iterate through all the elements in processes
        process.get('flowElements').forEach(element => {
          const type = bpmnTypeMap[element.$type];

          if (!type) {
            throw new Error(`Unsupported element type in parse: ${element.$type}`);
          }

          if (!element.get('name')) {
            element.set('name', '');
          }

          this.$set(this.nodes, element.id, { type, definition: element });
        });
      });

      // Okay, now let's get the diagrams
      this.definitions.diagrams.forEach(diagram => {
        this.plane = diagram.plane;
        this.planeElements = this.plane.get('planeElement');

        this.planeElements.forEach(diagramElement => {
          if (this.nodes[diagramElement.bpmnElement.id]) {
            this.$set(
              this.nodes[diagramElement.bpmnElement.id],
              "diagram",
              diagramElement
            );
          }
        });
      });
    },
    loadXML(xml) {
      this.moddle.fromXML(xml, (err, definitions) => {
        if (!err) {
          // Update definitions export to our own information
          definitions.exporter = "ProcessMaker Modeler";
          definitions.exporterVersion = version;
          this.definitions = definitions;
          this.parse();
        }
      });
    },
    toXML(cb) {
      this.moddle.toXML(this.definitions, cb);
    },

    handleCanvasMove() {

    },

    handleDrop(transferData, event) {
      if (!this.allowDrop) {
        return;
      }

      // Add to our processNode
      const definition = transferData.definition();

      // Now, let's modify planeElement
      const diagram = transferData.diagram();
      // Handle transform

      diagram.bounds.x = event.offsetX - this.paper.options.origin.x;
      diagram.bounds.y = event.offsetY - this.paper.options.origin.y;

      // Our BPMN models are updated, now add to our nodes
      // @todo come up with random id
      this.addNode({
        type: transferData.type,
        definition,
        diagram,
      });
    },
    addNode({ type, definition, diagram }) {
      /*

      If we are adding a pool, first, create a bpmn:Collaboration, or
      get the current bpmn:Collaboration, is one exists,

      For each process, bpmn:Collaboration will contain a bpmn:participant (a "pool")
      if there are currently no pools, don't create a new process, use the current one instead,
      and add (embed) all current flow elements to it.

      For lanes, it will be bpmn:laneSet > bpmn:lanes (will do later)

      bpmndi:BPMNPlane should reference collaboration element instead of Process_1

      */
      if (type === 'pool') {
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
        const targetProcess =  this.poolTarget
          ? this.processes.find(({ id }) => id === this.poolTarget.component.node.definition.get('processRef').id)
          : this.processNode;

        targetProcess.get('flowElements').push(definition);
      }

      const id = `${type}_${Object.keys(this.nodes).length}`;
      definition.id = id;
      diagram.id = `${id}_di`;
      diagram.bpmnElement = definition;

      this.planeElements.push(diagram);
      this.$set(this.nodes, id, { type, definition, diagram, pool: this.poolTarget });
    },
    handleResize() {
      let parent = this.$el.parentElement;
      this.$refs['paper-container'].style.width = parent.clientWidth + "px";
      this.$refs['paper-container'].style.height = parent.clientHeight + "px";
    },
    handleProcessInspectorUpdate(value) {
      // Go through each property and rebind it to our data
      for (var key in value) {
        // Only change if the value is different
        if (this.processNode[key] != value[key]) {
          this.processNode.definition[key] = value[key];
        }
      }
    },
    setInspector(node, config, handler) {
      this.inspectorNode = node;
      this.inspectorConfig = config;
      this.inspectorHandler = handler ? handler : (() => {});
    },
    validateDropTarget(transferData, { clientX, clientY }) {
      if (transferData.type === 'pool') {
        return;
      }

      /* If there are any pools on the grid, only allow dragging components over pools */
      if (!this.collaboration || this.collaboration.get('participants').length === 0) {
        return;
      }

      const { x, y } = this.dragPoint;
      if (clientX === x && clientY === y) {
        /* We don't need to re-calcaulte values if mouse position hasn't changed */
        return;
      }

      this.dragPoint = { x: clientX, y: clientY };

      const localMousePosition = this.paper.clientToLocalPoint({ x: clientX, y: clientY });
      const pool = this.graph.findModelsFromPoint(localMousePosition).find(({ component }) => {
        return component && component.node.type === 'pool';
      });

      if (!pool) {
        this.allowDrop = false;
        this.poolTarget = null;
      } else {
        this.allowDrop = true;
        this.poolTarget = pool;
      }
    },
  },
  created() {
    this.moddle = new BpmnModdle(this.extensions);
    this.validateDropTarget = throttle(this.validateDropTarget, 100, { leading: true });
  },
  mounted() {
    // Register controls with inspector
    this.$refs.inspector.$options.components["FormText"] = renderer.FormText;
    this.$refs.inspector.$options.components["FormInput"] = FormInput;
    this.$refs.inspector.$options.components["FormDatePicker"] = FormDatePicker;
    this.$refs.inspector.$options.components[
      "FormRadioButtonGroup"
    ] = FormRadioButtonGroup;
    this.$refs.inspector.$options.components["FormCheckbox"] = FormCheckbox;
    this.$refs.inspector.$options.components["FormTextArea"] = FormTextArea;
    this.$refs.inspector.$options.components["FormSelect"] = FormSelect;

    // Handle window resize
    this.handleResize();
    window.addEventListener("resize", this.handleResize);

    this.graph = new window.joint.dia.Graph();
    this.graph.set('interactiveFunc', cellView => {
      if (
        cellView.model.getParentCell() &&
        !cellView.model.component
      ) {
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
      perpendicularLinks: true,
      interactive: this.graph.get('interactiveFunc'),
    });
    this.paper.on("blank:pointerclick", () => {
      if (this.highlighted) {
        this.highlighted.unhighlight();
        this.highlighted = null;
      }
      this.inspectorNode = this.processNode;
      this.inspectorConfig = processInspectorConfig;
    });

    this.paper.on("blank:pointerdown", (event, x, y) => {
      this.canvasDragPosition = {x: x, y: y};
    });
    this.paper.on('cell:pointerup blank:pointerup', () => {
      this.canvasDragPosition = null;
    });

    this.$el.addEventListener('mousemove', (event) => {
      if (this.canvasDragPosition) {
        this.paper.translate(event.offsetX - this.canvasDragPosition.x, event.offsetY - this.canvasDragPosition.y);
      }
    });

    this.paper.on("cell:pointerclick", (cellView, evt, x, y) => {
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

        this.highlighted = cellView;
        cellView.model.component.handleClick();
      }
    });
    this.paper.on("link:pointerclick", cellView => {
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
