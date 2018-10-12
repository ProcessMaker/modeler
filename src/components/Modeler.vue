<template>
    <div class="modeler">
        <div class="modeler-container">
            <controls :controls="controls">

            </controls>
            <div ref="paper-container" class="paper-container">
                <drop @drop="handleDrop">
                    <div class="paper">
                    </div>
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
              @add-node="addNode"
            />
        </div>
    </div>
</template>

<script>
import BpmnModdle from "bpmn-moddle";
import controls from "./controls";

// Our renderer for our inspector

// Our nodes
import task from "./nodes/task";
import startEvent from "./nodes/startEvent";
import endEvent from "./nodes/endEvent";
import sequenceFlow from "./nodes/sequenceFlow";
import exclusiveGateway from "./nodes/exclusiveGateway";
import VueFormRenderer from "@processmaker/vue-form-builder/src/components/vue-form-renderer";
import processInspectorConfig from "./inspectors/process";

import { Drag, Drop } from 'vue-drag-drop';

// Bring in inspector items
import {
  FormInput,
  FormSelect,
  FormTextArea,
  FormCheckbox,
  FormRadioButtonGroup,
  FormDatePicker
} from "@processmaker/vue-form-elements/src/components";

import FormText from "@processmaker/vue-form-builder/src/components/renderer/form-text";

import processMakerModdle from "@processmaker/processmaker-bpmn-moddle/resources/processmaker";

let version = "1.0";

if (!window.joint) {
  window.joint = require("jointjs");
}

export default {
  props: [
    'controls'
  ],
  components: {
    Drag,
    Drop,
    controls,
    task,
    startEvent,
    endEvent,
    sequenceFlow,
    exclusiveGateway,
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
        process: processInspectorConfig
      },
      processNode: null,
      inspectorNode: null,
      inspectorData: null,
      inspectorHandler: null,
      highlighted: null,
      inspectorConfig: [
        {
          name: "Empty",
          items: []
        }
      ],
      nodes: {}
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
      let processes = this.definitions.rootElements;
      if (processes) {
        for (var process of processes) {
          this.processNode = process;
          this.inspectorConfig = this.inspectors["process"];
          this.inspectorNode = this.processNode;

          // Now iterate through all the elements in processes
          if (process.flowElements) {
            for (var element of process.flowElements) {
              if (element.$type == "bpmn:StartEvent") {
                this.$set(this.nodes, element.id, {
                  type: "startEvent",
                  definition: element
                });
              } else if (element.$type == "bpmn:EndEvent") {
                this.$set(this.nodes, element.id, {
                  type: "endEvent",
                  definition: element
                });
              } else if (element.$type == "bpmn:Task") {
                this.$set(this.nodes, element.id, {
                  type: "task",
                  definition: element
                });
              } else if (element.$type == "bpmn:ExclusiveGateway") {
                this.$set(this.nodes, element.id, {
                  type: "exclusiveGateway",
                  definition: element
                });
              } else if (element.$type == "bpmn:SequenceFlow") {
                this.$set(this.nodes, element.id, {
                  type: "sequenceFlow",
                  definition: element
                });
              } else {
                console.log("UNKNOWN TYPE: " + element.$type);
              }
            }
          }
        }
      }
      // Okay, now let's get the diagrams
      let diagrams = this.definitions.diagrams;
      if (diagrams) {
        for (var diagram of diagrams) {
          var plane = diagram.plane;
          var elements = plane.planeElement;
          if(!plane.planeElement) {
            plane.planeElement = [];
          }
          this.planeElements = plane.planeElement;
          for (var diagramElement of this.planeElements) {
            if (this.nodes[diagramElement.bpmnElement.id]) {
              this.$set(
                this.nodes[diagramElement.bpmnElement.id],
                "diagram",
                diagramElement
              );
            }
          }
        }
      }
    },
    loadXML(xml) {
      let moddle = new BpmnModdle(this.extensions);
      moddle.fromXML(xml, (err, definitions) => {
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
      let moddle = new BpmnModdle(this.extensions);
      moddle.toXML(this.definitions, cb);
    },

    handleCanvasMove() {

    },

    handleDrop(transferData, event) {
      // Add to our processNode
      let definition = transferData.definition();

      // Now, let's modify planeElement
      let diagram = transferData.diagram();
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
      const id = `${type}_${Object.keys(this.nodes).length}`
      definition.id = id;
      diagram.id = `${id}_di`;
      diagram.bpmnElement = definition;

      this.planeElements.push(diagram);
      this.processNode.get('flowElements').push(definition);
      this.$set(this.nodes, id, { type, definition, diagram });
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
  },
  mounted() {
    // Register our bpmn moddle extension
    this.registerBpmnExtension('processmaker', processMakerModdle);
    // Register controls with inspector
    this.$refs.inspector.$options.components["FormText"] = FormText;
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

    let el = this.$el.getElementsByClassName("paper").item(0);
    this.graph = new window.joint.dia.Graph();
    this.graph.set('interactiveFunc', cellView => {
      if (cellView.model.get('onClick')) {
        return false;
      }

      return { labelMove: false };
    });
    this.paper = new window.joint.dia.Paper({
      el: el,
      model: this.graph,
      gridSize: 10,
      width: this.$refs['paper-container'].clientWidth,
      height: this.$refs['paper-container'].clientHeight,
      drawGrid: true,
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
    this.paper.on('cell:pointerup blank:pointerup', (cellView, x, y) => {
      this.canvasDragPosition = null;
    });

    this.$el.addEventListener('mousemove', (event) => {
      if(this.canvasDragPosition) {
        this.paper.translate(event.offsetX - this.canvasDragPosition.x, event.offsetY - this.canvasDragPosition.y);
      }
    })

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

  }
};
</script>

<style lang="scss" scoped>
@import "~jointjs/dist/joint.css";

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
      background-color: #eeeeee;
      border-left: 1px solid #aaaaaa;
    }

    .paper-container {
      height: 100%;
      max-height: 100%;
      min-height: 100%;

      /*
            width: 100%;
            height: 100%;
            min-width: 100%;
            max-height: 100%;
            */
      overflow: hidden;
    }
  }
}
</style>


