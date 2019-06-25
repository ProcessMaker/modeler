<template>
  <b-card no-body class="inspector-container" data-test="inspector-container">
    <div class="card-header">{{ $t('Inspector') }}</div>
    <vue-form-renderer
      v-if="highlightedNode"
      :data="data"
      @update="updateDefinition"
      :config="config"
      class="overflow-auto h-100"
      @focusout.native="updateState"
      ref="formRenderer"
    />
  </b-card>
</template>

<script>
import Vue from 'vue';

import { VueFormRenderer, renderer } from '@processmaker/screen-builder';

import {
  FormInput,
  FormSelect,
  FormTextArea,
  FormCheckbox,
  FormRadioButtonGroup,
  FormCodeEditor,
  FormAccordion,
  FormDatePicker,
} from '@processmaker/vue-form-elements';
import '@processmaker/vue-form-elements/dist/vue-form-elements.css';
import store from '@/store';
import { id as sequenceFlowId } from '@/components/nodes/sequenceFlow';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import Process from './process';
import SequenceFlowFormSelect from './SequenceFlowFormSelect.vue';

Vue.component('FormText', renderer.FormText);
Vue.component('FormInput', FormInput);
Vue.component('FormSelect', FormSelect);
Vue.component('FormTextArea', FormTextArea);
Vue.component('FormCheckbox', FormCheckbox);
Vue.component('FormRadioButtonGroup', FormRadioButtonGroup);
Vue.component('FormCodeEditor', FormCodeEditor);
Vue.component('FormAccordion', FormAccordion);
Vue.component('FormDatePicker', FormDatePicker);
Vue.component('VueFormRenderer', VueFormRenderer);

export default {
  props: ['nodeRegistry', 'moddle', 'processNode'],
  data() {
    return {
      inspectorHandler: null,
      translated: [],
    };
  },
  watch: {
    highlightedNode() {
      document.activeElement.blur();
    },
  },
  computed: {
    highlightedNode() {
      return store.getters.highlightedNode;
    },
    inspectorStyles() {
      this.$nextTick(() => {
        const inspectorHeader = this.$refs.formRenderer.$children[0].$el;
        inspectorHeader.classList.add('card-header', 'text-sm');
      });

      return 'card-body p-0';
    },
    config() {
      if (!this.highlightedNode) {
        return {
          name: 'Empty',
          items: [],
        };
      }

      const { type, definition } = this.highlightedNode;

      if (this.highlightedNode === this.processNode) {
        return Process.inspectorConfig;
      }

      const inspectorConfig = cloneDeep(this.nodeRegistry[type].inspectorConfig);
      const sequenceFlowConfigurationFormElements = get(inspectorConfig, '[0].items[0].items');

      if (this.isSequenceFlow(type) && this.isConnectedToGateway(definition)) {
        const expressionConfig = {
          component: 'FormInput',
          config: {
            label: 'Expression',
            helper: 'Enter the expression that describes the workflow condition',
            name: 'conditionExpression',
          },
        };

        sequenceFlowConfigurationFormElements.push(expressionConfig);
      }

      if (this.isSequenceFlow(type) && this.isConnectedToCallActivity(definition)) {
        const startEventConfig = {
          component: SequenceFlowFormSelect,
          config: {
            label: 'Call Activity Start Event',
            name: 'startEvent',
            targetCallActivity: definition.targetRef,
            helper: definition.targetRef.calledElement
              ? ''
              : 'Please select a valid process on the connected call activity.',
          },
        };

        sequenceFlowConfigurationFormElements.push(startEventConfig);
      }

      return inspectorConfig;
    },
    isAnyNodeActive() {
      return this.highlightedNode;
    },
    updateDefinition() {
      if (!this.isAnyNodeActive) {
        return noop;
      }

      if (this.isProcessNodeActive) {
        return this.processNodeInspectorHandler;
      }

      if (this.hasCustomInspectorHandler) {
        return this.customInspectorHandler;
      }

      return this.defaultInspectorHandler;
    },
    hasCustomInspectorHandler() {
      return this.nodeRegistry[this.highlightedNode.type].inspectorHandler;
    },
    isProcessNodeActive() {
      return this.highlightedNode === this.processNode;
    },
    data() {
      if (!this.highlightedNode) {
        return {};
      }

      const type = this.highlightedNode && this.highlightedNode.type;

      return type && this.nodeRegistry[type].inspectorData
        ? this.nodeRegistry[type].inspectorData(this.highlightedNode)
        : Object.entries(this.highlightedNode.definition).reduce((data, [key, value]) => {
          data[key] = value;
          return data;
        }, {});
    },
  },
  methods: {
    isSequenceFlow(type) {
      return type === sequenceFlowId;
    },
    isConnectedToGateway(definition) {
      return ['bpmn:ExclusiveGateway', 'bpmn:InclusiveGateway'].includes(definition.sourceRef.$type);
    },
    isConnectedToCallActivity(definition) {
      return definition.targetRef.$type === 'bpmn:CallActivity';
    },
    customInspectorHandler(value) {
      return this.nodeRegistry[this.highlightedNode.type].inspectorHandler(value, this.highlightedNode, this.setNodeProp, this.moddle);
    },
    processNodeInspectorHandler(value) {
      return this.defaultInspectorHandler(omit(value, ['artifacts', 'flowElements', 'laneSets']));
    },
    setNodeProp(node, key, value) {
      store.commit('updateNodeProp', { node, key, value });
    },
    defaultInspectorHandler(value) {
      /* Go through each property and rebind it to our data */
      for (const key in omit(value, ['$type', 'eventDefinitions'])) {
        if (this.highlightedNode.definition.get(key) !== value[key]) {
          this.setNodeProp(this.highlightedNode, key, value[key]);
        }
      }
    },
    updateState() {
      this.$emit('save-state');
    },
  },
};
</script>

<style lang="scss">
.inspector-container {
  text-align: left;
  user-select: none;
}

.form-accordtion-container {
  padding: 0;
}

.form-group {
  padding: 0 0.5rem;
}
</style>
