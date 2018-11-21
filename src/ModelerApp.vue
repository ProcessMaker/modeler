<template>
  <div id="modeler-app">
    <div class="navbar">
      <div>ProcessMaker Modeler</div>
      <div class="actions">
        <b-btn v-b-modal="'uploadmodal'">Upload XML</b-btn>
        <button class="button" @click="download">Download XML</button>
      </div>
    </div>
    <div class="modeler-container">
      <modeler ref="modeler"   @parsed.once="addStartEvent" @initialize="modelerInitialize" @ready="modelerReady"/>
    </div>
    <statusbar>
      {{statusText}}
      <font-awesome-icon :style="{color: statusColor}" :icon="statusIcon" />
    </statusbar>

    <b-modal ref="uploadmodal" id="uploadmodal" title="Upload BPMN File">
      <file-upload ref="upload" @input="handleUpload">
        Upload file
      </file-upload>
    </b-modal>
  </div>
</template>

<script>
import Modeler from './components/Modeler.vue';
import statusbar from './components/statusbar.vue';
import FileUpload from 'vue-upload-component';
import FilerSaver from 'file-saver';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

//Extenssion example
import bpmnExtension from '@processmaker/processmaker-bpmn-moddle/resources/processmaker.json';

// Our initial node types to register with our modeler
import {
  association,
  endEvent,
  exclusiveGateway,
  inclusiveGateway,
  parallelGateway,
  sequenceFlow,
  startEvent,
  task,
  textAnnotation,
  pool,
  poolLane,
} from './components/nodes';

let nodeTypes = [
  startEvent,
  endEvent,
  task,
  exclusiveGateway,
  inclusiveGateway,
  parallelGateway,
  sequenceFlow,
  textAnnotation,
  association,
  pool,
  poolLane,
];

export default {
  name: 'ModelerApp',
  components: {
    Modeler,
    FileUpload,
    statusbar,
    FontAwesomeIcon,
  },
  data() {
    return {
      statusText: 'No errors detected',
      statusIcon: faCheckCircle,
      statusColor: 'green',
    };
  },
  mounted() {
    //Before ready: To load BPMN extensions and Node types
    this.$emit('beforeReady');
    //The modeler app is ready to be used with extensions and custom nodes
    this.$emit('ready');

  },
  methods: {
    /**
     * Add a BPMN extension
     */
    testAddBpmnExtension (modeler) {
      modeler.registerBpmnExtension('pm', bpmnExtension);
    },
    /**
     * Add custom properties to inspector
     */
    testAddInspectorExtensions (modeler) {
      // Add email
      modeler.registerInspectorExtension(task, {
        id: 'pm-due-in',
        component: 'FormInput',
        config: {
          type: 'number',
          label: 'Due In',
          placeholder: '72 hours',
          helper: 'Time when the task will due (hours)',
          name: 'dueIn',
        },
      });
    },
    /**
     * Add a custom node example
     */
    testAddNodeType (modeler) {
      const component = {
        extends: task.component,
        methods: {
          handleClick () {
            this.$parent.loadInspector('processmaker-connectors-social-twitter-send', this.node.definition, this);
          }
        },
      };
      const nodeType = {
        id: 'processmaker-connectors-social-twitter-send',
        component: component,
        bpmnType: 'bpmn:ServiceTask',
        control: true,
        category: 'Social',
        icon: require('./assets/toolpanel/task.svg'),
        label: 'Send Tweet',
        definition: function(moddle) {
          return moddle.create('bpmn:ServiceTask', {
            name: 'Send Tweet',
            implementation: 'processmaker-social-twitter-send',
          });
        },
        diagram: function(moddle) {
          return moddle.create('bpmndi:BPMNShape', {
            bounds: moddle.create('dc:Bounds', {
              height: 80,
              width: 100,
            }),
          });
        },
        inspectorHandler: function(value, definition, component) {
          // Go through each property and rebind it to our data
          for (var key in value) {
            // Only change if the value is different
            if (definition[key] != value[key]) {
              definition[key] = value[key];
            }
          }
          component.updateShape();
        },
        inspectorConfig: [
          {
            name: 'Send Tweet',
            items: [
              {
                component: 'FormText',
                config: {
                  label: 'Send Tweet',
                  fontSize: '2em',
                },
              },
              {
                component: 'FormInput',
                config: {
                  label: 'Identifier',
                  helper: 'The id field should be unique across all elements in the diagram',
                  name: 'id',
                },
              },
              {
                component: 'FormTextArea',
                config: {
                  label: 'Tweet Body',
                  helper: 'The Body Of The Tweet to Send',
                  name: 'tweet',
                },
              },
            ],
          },
        ],
      };
      modeler.registerNodeType(nodeType);
    },
    testLoadBPMN (modeler) {
      let blank = `<?xml version="1.0" encoding="UTF-8"?>
        <bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="2.0.3">
          <bpmn:process id="Process_1" isExecutable="true">
          </bpmn:process>
          <bpmndi:BPMNDiagram id="BPMNDiagram_1">
            <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
            </bpmndi:BPMNPlane>
          </bpmndi:BPMNDiagram>
        </bpmn:definitions>
      `;
      modeler.loadXML(blank);
    },
    /**
     * The modeler is initializing.
     */
    modelerInitialize(modeler) {
      // Here the application could register BPMN extensions
      this.$emit('modeler-init', modeler);
      // Register basic nodeTypes
      for (let nodeType of nodeTypes) {
        modeler.registerNodeType(nodeType);
      }
      // Example of extension
      this.testAddBpmnExtension(modeler);
      this.testAddInspectorExtensions(modeler);
      this.testAddNodeType(modeler);
    },
    /**
     * The modeler is ready to be used
     */
    modelerReady() {
      // Here the modeler is ready to be used
      this.$emit('modeler-ready', this.$refs.modeler);
      // Load a BPMN of example
      this.testLoadBPMN(this.$refs.modeler);
    },
    download() {
      this.$refs.modeler.toXML(function(err, xml) {
        if (err) {
          alert(err);
        } else {
          let file = new File([xml], 'bpmnProcess.xml', {type: 'text/xml'});
          FilerSaver.saveAs(file);
        }
      });
    },
    addStartEvent() {
      const definition = startEvent.definition(this.$refs.modeler.moddle);
      const diagram = startEvent.diagram(this.$refs.modeler.moddle);

      diagram.bounds.x = 150;
      diagram.bounds.y = 150;

      this.$refs.modeler.addNode({
        definition,
        diagram,
        type: startEvent.id,
      });
    },
    handleUpload(files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.$refs.modeler.loadXML(reader.result);
        this.$refs.uploadmodal.hide();
      };
      reader.readAsText(files[0].file);
    },
  },
};
</script>

<style lang="scss">
body,
html {
    margin: 0;
    padding: 0;
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    max-height: 100vh;
}

#modeler-app {
    font-family: 'Open Sans', Helvetica, Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-align: center;
    color: #2c3e50;
    display: flex;
    flex-direction: column;
    width: 100vw;
    max-width: 100vw;
    height: 100vh;
    max-height: 100vh;

    .modeler-container {
        flex-grow: 1;
        overflow: hidden;
    }

    .navbar {
        font-weight: bold;
        height: 42px;
        min-height: 42px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background-color: #3397e1;
        color: white;
        border-bottom: 1px solid grey;
        padding-right: 16px;
        padding-left: 16px;

        .actions {
            button {
                border-radius: 4px;
                display: inline-block;
                padding-top: 4px;
                padding-bottom: 4px;
                padding-left: 8px;
                padding-right: 8px;
                background-color: grey;
                color: white;
                border-width: 1px;
                border-color: darkgrey;
                margin-right: 8px;
                font-weight: bold;
            }
        }
    }
}
</style>
