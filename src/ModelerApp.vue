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
      <modeler ref="modeler" />
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
import Modeler from "./components/Modeler.vue";
import statusbar from "./components/statusbar.vue";

import FileUpload from "vue-upload-component";

import { library } from "@fortawesome/fontawesome-svg-core";
import {
  faCheckCircle,
  faTimesCircle
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

// Our initial node types
const initialNodes = [
  require('./components/nodes/startEvent/index.js').default,
  require('./components/nodes/endEvent/index.js').default,
  require('./components/nodes/task/index.js').default,
  require('./components/nodes/exclusiveGateway/index.js').default,
  require('./components/nodes/sequenceFlow/index.js').default,
  require('./components/nodes/textAnnotation/index.js').default,
  require('./components/nodes/association/index.js').default

]

export default {
  name: "ModelerApp",
  components: {
    Modeler,
    FileUpload,
    statusbar,
    FontAwesomeIcon
  },
  data() {
    return {
      statusText: "No errors detected",
      statusIcon: faCheckCircle,
      statusColor: "green"
    };
  },
  mounted() {
    let blank = `
    <?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="Definitions_03dabax" targetNamespace="http://bpmn.io/schema/bpmn" exporter="Camunda Modeler" exporterVersion="2.0.3">
  <bpmn:process id="Process_1" isExecutable="true">
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1">
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>

    `;

    this.$refs.modeler.loadXML(blank);
    for(var node of initialNodes) {
      this.$refs.modeler.registerNode(node)
    }
  },
  methods: {
    download() {
      this.$refs.modeler.toXML(function(err, xml) {
        if (err) {
          alert(err);
        } else {
          alert(xml);
        }
      });
    },
    handleUpload(files) {
      const reader = new FileReader();
      reader.onloadend = () => {
        this.$refs.modeler.loadXML(reader.result);
        this.$refs.uploadmodal.hide();
      };
      reader.readAsText(files[0].file);
    }
  }
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
  font-family: "Open Sans", Helvetica, Arial, sans-serif;
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
