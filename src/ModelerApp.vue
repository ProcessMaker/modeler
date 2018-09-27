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

    <b-modal ref="uploadmodal" id="uploadmodal" title="Upload BPMN File">
      <file-upload ref="upload" @input="handleUpload">
        Upload file
      </file-upload>
    </b-modal>
  </div>
</template>

<script>
import Modeler from "./components/Modeler.vue";

import FileUpload from "vue-upload-component";

export default {
  name: "ModelerApp",
  components: {
    Modeler,
    FileUpload
  },
  mounted() {
    let blank =
      '<?xml version="1.0" encoding="UTF-8"?>' +
      '<bpmn2:definitions xmlns:bpmn2="http://www.omg.org/spec/BPMN/20100524/MODEL" ' +
      'id="empty-definitions" ' +
      'targetNamespace="http://bpmn.io/schema/bpmn">' +
        '<bpmn2:process id="process_1" name="Blank Process"></bpmn2:process>' +
      "</bpmn2:definitions>";
    this.$refs.modeler.loadXML(blank);
  },
  methods: {
    download() {
      this.$refs.modeler.toXML(function(err, xml) {
        alert(xml);
      });
    },
    handleUpload(files) {
      let reader = new FileReader();
      reader.onloadend = () => {
        this.$refs.modeler.loadXML(reader.result);
        this.$refs.uploadmodal.hide();
      }
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
