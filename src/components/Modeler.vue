<template>
    <div class="modeler">
        <div class="modeler-container">
            <controls :controls="controls">

            </controls>
            <div ref="paper-container" class="paper-container">
                <drop @drop="test">
                    <div class="paper">
                    </div>
                </drop>
            </div>

            <div class="inspector">
                <vue-form-renderer ref="inspector" :data="inspectorData" @update="handleInspectorUpdate" :config="inspectorConfig" />
            </div>

        </div>
        <div class="definitions-container" v-if="definitions">
            <component :is="node.type" :key="id" v-for="(node, id) in nodes" :graph="graph" :node="node" :id="id"></component>
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
    VueFormRenderer
  },
  data() {
    return {
      // Our jointjs data graph model
      graph: null,
      // Our jointjs paper
      paper: null,
      definitions: null,
      planeElements: null,
      // This is our id based lookup model
      inspectors: {
        process: processInspectorConfig
      },
      processNode: null,
      inspectorNode: null,
      inspectorData: null,
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
    }
  },
  methods: {
    handleInspectorUpdate(value) {
      // Go through each property and rebind it to our inspectorNode
      for (var key in value) {
        // Only change if the value is different
        if (this.inspectorNode[key] != value[key]) {
          this.inspectorNode[key] = value[key];
        }
      }
      if (this.nodes[value.id].component) {
        this.nodes[value.id].component.updateShape();
      }
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
      let moddle = new BpmnModdle();
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
      let moddle = new BpmnModdle();
      moddle.toXML(this.definitions, cb);
    },
    test(transferData, event) {
      // Add to our processNode
      let definition = transferData.definition();

      let id = transferData.type + '_' + Object.keys(this.nodes).length;
      definition.id = id;
                                              
      this.processNode.get('flowElements').push(definition)
      // Now, let's modify planeElement
      let diagram = transferData.diagram();
      diagram.id = id + '_di';
      diagram.bpmnElement = definition;
      diagram.bounds.x = event.offsetX;
      diagram.bounds.y = event.offsetY;
      // Create diagram
      this.planeElements.push(diagram)
      // Our BPMN models are updated, now add to our nodes
      // @todo come up with random id
      this.$set(this.nodes, id, {
        type: transferData.type,
        definition: definition,
        diagram: diagram,
      });
    },
    handleResize() {
      let parent = this.$el.parentElement;
      this.$refs['paper-container'].style.width = parent.clientWidth + "px";
      this.$refs['paper-container'].style.height = parent.clientHeight + "px";
    },
    setInspector(node, config) {
      this.inspectorNode = node;
      this.inspectorConfig = config;
    }
  },
  mounted() {
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
    this.paper = new window.joint.dia.Paper({
      el: el,
      model: this.graph,
      gridSize: 10,
      width: this.$el.clientWidth,
      height: this.$el.clientHeight,
      drawGrid: true
    });
    this.paper.on("blank:pointerclick", () => {
      if (this.highlighted) {
        this.highlighted.unhighlight();
        this.highlighted = null;
      }
      this.inspectorNode = this.processNode;
      this.inspectorConfig = processInspectorConfig;
    });
    this.paper.on("cell:pointerclick", cellView => {
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
      overflow: scroll;
    }
  }
}
</style>


