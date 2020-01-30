<template>
  <transition name="inspector">
    <b-col
      v-show="!compressed"
      class="pl-0 h-100 overflow-hidden inspector-column"
      :class="[{ 'ignore-pointer': canvasDragPosition, 'inspector-column-compressed' : compressed }]"
      data-test="inspector-column"
    >
      <b-card
        no-body class="inspector-container border-top-0 border-bottom-0 border-right-0 rounded-0"
        data-test="inspector-container"
        :style="{ height: parentHeight }"
      >
        <vue-form-renderer
          :key="config[0].name"
          v-if="highlightedNode"
          :data="data"
          @update="updateDefinition"
          :config="config"
          class="overflow-auto h-100 inspector-font-size"
          @focusout.native="updateState"
          ref="formRenderer"
        />
      </b-card>
    </b-col>
  </transition>
</template>

<script>
import Vue from 'vue';

import { renderer, VueFormRenderer } from '@processmaker/screen-builder';

import {
  FormAccordion,
  FormCheckbox,
  FormDatePicker,
  FormInput,
  FormMultiSelect,
  FormRadioButtonGroup,
  FormSelect,
  FormTextArea,
} from '@processmaker/vue-form-elements';
import '@processmaker/vue-form-elements/dist/vue-form-elements.css';
import store from '@/store';
import { id as sequenceFlowId } from '@/components/nodes/sequenceFlow';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';
import Process from './process';

Vue.component('FormText', renderer.FormText);
Vue.component('FormInput', FormInput);
Vue.component('FormSelect', FormSelect);
Vue.component('FormTextArea', FormTextArea);
Vue.component('FormCheckbox', FormCheckbox);
Vue.component('FormRadioButtonGroup', FormRadioButtonGroup);
Vue.component('FormAccordion', FormAccordion);
Vue.component('FormDatePicker', FormDatePicker);
Vue.component('VueFormRenderer', VueFormRenderer);
Vue.component('FormMultiSelect', FormMultiSelect);

export default {
  props: ['nodeRegistry', 'moddle', 'processNode', 'parentHeight', 'canvasDragPosition', 'compressed'],
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
        let helper = 'Enter the expression that describes the workflow condition ';
        helper += '<a href="https://processmaker.gitbook.io/processmaker/designing-processes/process-design/model-your-process/the-quick-toolbar#expression-syntax-components" target="_blank"><i class="far fa-question-circle mr-1"></a>';
        const expressionConfig = {
          component: 'FormInput',
          config: {
            label: 'Expression',
            helper,
            name: 'conditionExpression',
          },
        };

        sequenceFlowConfigurationFormElements.push(expressionConfig);
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
    isConnectedToSubProcess(definition) {
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
<style lang="scss" src="./inspector.scss" scoped />
