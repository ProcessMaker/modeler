<template>
  <b-container id="modeler-app" class="h-100 container position-relative p-0">

    <b-card no-body class="h-100 rounded-0">
      <b-card-header class="d-flex align-items-center header">
        <b-card-text class="m-0 font-weight-bolder">
          {{ $t('ProcessMaker Modeler') }}
        </b-card-text>

        <div class="ml-auto">
          <b-btn variant="secondary" size="sm" v-b-modal="'uploadmodal'" class="mr-2">
            <i class="fas fa-upload mr-1"/>
            {{ $t('Upload XML') }}
          </b-btn>
        </div>
      </b-card-header>
      <b-card-body class="overflow-hidden position-relative p-0 vh-100">
        <modeler ref="modeler" @set-xml-manager="xmlManager = $event" @validate="validationErrors = $event" @warnings="warnings = $event" :decorations="decorations" />
      </b-card-body>
      <validation-status ref="validationStatus"
        :validation-errors="validationErrors"
        :warnings="warnings"
        :xml-manager="xmlManager"
      >
        <component v-for="(component, index) in validationBar" :key="index" :is="component" />
      </validation-status>
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
import Modeler from './components/modeler/Modeler.vue';
import FileUpload from 'vue-upload-component';
import ValidationStatus from '@/components/validationStatus/ValidationStatus';
import undoRedoStore from '@/undoRedoStore';

const reader = new FileReader();

export default {
  name: 'ModelerApp',
  components: {
    Modeler,
    FileUpload,
    ValidationStatus,
  },
  data() {
    return {
      validationBar: [],
      decorations: {
        borderOutline: {},
      },
      validationErrors: {},
      uploadedXml: null,
      xmlFile: [],
      warnings: [],
      xmlManager: null,
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
    loadXmlIntoModeler() {
      this.$refs.modeler.loadXML(this.uploadedXml);
      undoRedoStore.dispatch('pushState', this.uploadedXml);
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
    window.ProcessMaker.$modeler = this.$refs.modeler;
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
</style>
