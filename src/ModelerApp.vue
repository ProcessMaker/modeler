<template>
  <div id="modeler-app">
    <div class="navbar">
      <div>ProcessMaker Modeler</div>
      <div class="actions">
        <b-btn v-b-modal="'uploadmodal'">Upload XML</b-btn>
        <button class="button" data-test="downloadXMLBtn" @click="download">Download XML</button>
      </div>
    </div>
    <div class="modeler-container">
      <modeler ref="modeler" @validate="validationErrors = $event" />
    </div>
    <statusbar>
      {{statusText}}
      <font-awesome-icon :style="{color: statusColor}" :icon="statusIcon" />
    </statusbar>

    <b-modal ref="uploadmodal" id="uploadmodal" title="Upload BPMN File">
      <file-upload @input-file="handleUpload">
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

const reader = new FileReader();

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
      statusIcon: faCheckCircle,
      validationErrors: null,
    };
  },
  computed: {
    statusColor() {
      return this.hasValidationErrors
        ? 'red'
        : 'green';
    },
    hasValidationErrors() {
      return this.numberOfValidationErrors > 0;
    },
    numberOfValidationErrors() {
      if (!this.validationErrors) {
        return 0;
      }

      return Object.entries(this.validationErrors).reduce((numberOfErrors, [,errors]) => {
        return numberOfErrors + errors.length;
      }, 0);
    },
    statusText() {
      return this.hasValidationErrors
        ? `${this.numberOfValidationErrors} error${this.numberOfValidationErrors === 1 ? '' : 's'} detected`
        : 'No errors detected';
    },
  },
  methods: {
    download() {
      this.$refs.modeler.toXML(function(err, xml) {
        if (err) {
          alert(err);
        } else {
          let file = new File([xml], 'bpmnProcess.xml', {type: 'text/xml'});
          FilerSaver.saveAs(file);

          /* Save XML string to window–this is used in testing to compare against known valid XML */
          window.xml = xml;
        }
      });
    },
    handleUpload(fileObject) {
      if (!fileObject) {
        return;
      }

      reader.readAsText(fileObject.file);
    },
  },
  mounted() {
    reader.onloadend = () => {
      this.$refs.modeler.loadXML(reader.result);
      this.$refs.uploadmodal.hide();
    };

    /* Add a start event on initial load */
    this.$refs.modeler.$once('parsed', this.$refs.modeler.addStartEvent);
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
