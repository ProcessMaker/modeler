<template>
  <b-container id="modeler-app" class="h-100 container position-relative">
    <div class="alert-container position-absolute w-100">
      <b-row class="justify-content-center">
        <b-col cols="6">
          <b-alert
            v-for="(item, index) in alerts"
            :key="index"
            class="d-none d-lg-block alertBox"
            :show="item.alertShow"
            :variant="item.alertVariant"
            dismissible
            fade
          >
            {{ item.alertText }}
          </b-alert>
        </b-col>
      </b-row>
    </div>

    <b-card no-body class="h-100">
      <b-card-header class="d-flex align-items-center header">
        <b-card-text class="m-0 font-weight-bolder">
          {{ $t('ProcessMaker Modeler') }}
        </b-card-text>

        <div class="ml-auto">
          <b-btn variant="secondary" size="sm" v-b-modal="'uploadmodal'" class="mr-2">
            <i class="fas fa-upload mr-1"/>
            {{ $t('Upload XML') }}
          </b-btn>
          <b-btn variant="secondary" size="sm" data-test="downloadXMLBtn" @click="download">
            <i class="fas fa-download mr-1"/>
            {{ $t('Download XML') }}
          </b-btn>
        </div>
      </b-card-header>

      <b-card-body class="overflow-hidden position-relative" data-test="body-container">
        <modeler ref="modeler" @validate="validationErrors = $event" />
      </b-card-body>

      <b-card-footer class="p-0 border-0">
        <statusbar>
          <validation-status :validation-errors="validationErrors"/>
        </statusbar>
      </b-card-footer>
    </b-card>

    <b-modal
      ref="uploadmodal"
      id="uploadmodal"
      :title="$t('Upload BPMN File')"
      :cancel-title="$t('Cancel')"
      :ok-title="$t('Upload')"
      :ok-disabled="!uploadedXml"
      cancel-variant="outline-secondary"
      ok-variant="secondary"
      @hidden="this.clearUpload"
      @ok="this.loadXmlIntoModeler"
    >
      <file-upload class="btn btn-primary" v-model="xmlFile">
        {{ $t('Select file') }}
      </file-upload>

      <span class="ml-3" v-if="xmlFile[0]">{{ xmlFile[0].name }}</span>
    </b-modal>
  </b-container>
</template>

<script>
import Modeler from './components/Modeler.vue';
import Statusbar from './components/Statusbar.vue';
import FileUpload from 'vue-upload-component';
import FilerSaver from 'file-saver';
import ValidationStatus from '@/components/ValidationStatus';
import store from '@/store';

/* Add reference to store on window–this is used in testing to verify rendered nodes */
window.store = store;

const reader = new FileReader();

export default {
  name: 'ModelerApp',
  components: {
    Modeler,
    FileUpload,
    ValidationStatus,
    Statusbar,
  },
  data() {
    return {
      validationErrors: {},
      alerts: [],
      uploadedXml: null,
      xmlFile: [],
    };
  },
  watch: {
    xmlFile([fileObject]) {
      if (fileObject) {
        reader.readAsText(fileObject.file);
      }
    },
  },
  methods: {
    runningInCypressTest() {
      return !!window.Cypress;
    },
    download() {
      this.$refs.modeler.toXML((err, xml) => {
        if (err) {
          alert(err);
        } else {
          if (this.runningInCypressTest()) {
            /* Save XML string to window–this is used in testing to compare against known valid XML */
            window.xml = xml;
            return;
          }
          let file = new File([xml], 'bpmnProcess.xml', {type: 'text/xml'});
          FilerSaver.saveAs(file);
        }
      });
    },
    loadXmlIntoModeler() {
      this.$refs.modeler.loadXML(this.uploadedXml);
    },
    clearUpload() {
      this.uploadedXml = null;
      this.xmlFile = [];
    },
    setUploadedXml(event) {
      this.uploadedXml = event.target.result;
    },
  },
  created() {
    reader.onload = this.setUploadedXml;
  },
  mounted() {
    /* Add a start event on initial load */
    this.$refs.modeler.$once('parsed', () => this.$refs.modeler.addStartEvent());

    window.ProcessMaker.EventBus.$on('alert', alerts => this.alerts = alerts);
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

.alert-container {
  z-index: 2;
  top: 4rem;
  left: 0;
}
</style>
