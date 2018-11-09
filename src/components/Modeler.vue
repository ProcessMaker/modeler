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
</template>

<script>
import Vue from 'vue';
import BpmnModdle from 'bpmn-moddle';
import controls from './controls';

// Our renderer for our inspector
import { Drag, Drop } from 'vue-drag-drop';

// Bring in our own form controls
import {
  FormInput,
  FormSelect,
  FormTextArea,
  FormCheckbox,
  FormRadioButtonGroup,
} from '@processmaker/vue-form-elements';

import processInspectorConfig from './inspectors/process';
import sequenceExpressionInspectorConfig from './inspectors/sequenceExpression';

import {
  VueFormRenderer,
  renderer
} from "@processmaker/vue-form-builder";
// Register those components
Vue.component('FormText', renderer.FormText);
Vue.component('FormInput', FormInput);
Vue.component('FormSelect', FormSelect);
Vue.component('FormTextArea', FormTextArea);
Vue.component('FormCheckbox', FormCheckbox);
Vue.component('FormRadioButtonGroup', FormRadioButtonGroup);

Vue.component('VueFormRenderer', VueFormRenderer);


let version = '1.0';

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
      // What bpmn moddle extensions should we register
      extensions: [

      ],
      // What is our bpmn type mappings
      bpmnTypeMap: {

      },
      // Our controls/nodes to show in our palette
      controls: {

      },
      // Our node types, keyed by the id
      nodeRegistry: {

      },
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
      sequenceExpressionInspectorConfig: sequenceExpressionInspectorConfig,
      nodes: {},
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
          if (key == '') {
            return value;
          }
          if (typeof value == 'object') {
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
    // This registers a node to use in the bpmn modeler
    registerNode(node) {
      this.inspectorConfigurations[node.id] = node.inspectorConfig;
      this.nodeRegistry[node.id] = node;
      Vue.component(node.id, node.component);
      this.bpmnTypeMap[node.bpmnType] = node.id;
      if(node.control) {
        // Register the control for our control palette
        if(typeof this.controls[node.category] == 'undefined') {
          this.$set(this.controls, node.category, []);
        }
        this.controls[node.category].push({
          type: node.id,
          icon: node.icon,
          label: node.label,
        });
      }
    },
    // Parses our definitions and graphs and stores them in our id based lookup model
    parse() {
      // get the top level process objects
      // All root elements are bpmn:process types
      this.definitions.rootElements.forEach(process => {
        this.processNode = process;
        this.inspectorConfig = this.inspectors['process'];
        this.inspectorNode = this.processNode;

        // Now iterate through all the elements in processes
        process.get('flowElements').forEach(element => {
          const type = this.bpmnTypeMap[element.$type];

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
        this.planeElements = diagram.plane.get('planeElement');

        this.planeElements.forEach(diagramElement => {
          if (this.nodes[diagramElement.bpmnElement.id]) {
            this.$set(
              this.nodes[diagramElement.bpmnElement.id],
              'diagram',
              diagramElement
            );
          }
        });
      });
      this.$emit('parsed')
    },
    loadXML(xml) {
      const moddle = new BpmnModdle(this.extensions);
      moddle.fromXML(xml, (err, definitions) => {
        if (!err) {
          // Update definitions export to our own information
          definitions.exporter = 'ProcessMaker Modeler';
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
      let type = transferData.type;
      // Add to our processNode
      let definition = this.nodeRegistry[type].definition();

      // Now, let's modify planeElement
      let diagram = this.nodeRegistry[type].diagram();
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
      const id = `node_${Object.keys(this.nodes).length}`;
      definition.id = id;
      diagram.id = `${id}_di`;
      diagram.bpmnElement = definition;

      this.planeElements.push(diagram);
      this.processNode.get('flowElements').push(definition);
      this.$set(this.nodes, id, { type, definition, diagram });
    },
    handleResize() {
      let parent = this.$el.parentElement;
      this.$refs['paper-container'].style.width = parent.clientWidth + 'px';
      this.$refs['paper-container'].style.height = parent.clientHeight + 'px';
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
    loadInspector(type, data, component) {
      this.inspectorNode = data;
      if(type === 'processmaker-modeler-sequence-flow' && data.sourceRef.$type === 'bpmn:ExclusiveGateway') {
        this.inspectorConfig = this.sequenceExpressionInspectorConfig;
      } else {
        this.inspectorConfig = this.nodeRegistry[type].inspectorConfig;
      }
      this.inspectorHandler = (value) => {
        this.nodeRegistry[type].inspectorHandler(value, data, component);
      };
    },
  },
  mounted() {
    // Handle window resize
    this.handleResize();
    window.addEventListener('resize', this.handleResize);

    let el = this.$el.getElementsByClassName('paper').item(0);
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
      perpendicularLinks: true,
      interactive: this.graph.get('interactiveFunc'),
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
      this.canvasDragPosition = {x: x, y: y};
    });
    this.paper.on('cell:pointerup blank:pointerup', () => {
      this.canvasDragPosition = null;
    });

    this.$el.addEventListener('mousemove', (event) => {
      if(this.canvasDragPosition) {
        this.paper.translate(event.offsetX - this.canvasDragPosition.x, event.offsetY - this.canvasDragPosition.y);
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
  }
};
</script>

<style lang="scss" scoped>
@import '~jointjs/dist/joint.css';

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


