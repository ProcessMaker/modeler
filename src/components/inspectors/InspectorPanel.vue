<template>
  <div class="inspector-container">
    <vue-form-renderer
      v-if="highlightedNode"
      :data="data"
      @update="updateDefinition"
      :config="config"
      @focusout.native="updateState"
    />
  </div>
</template>

<script>
import Vue from 'vue';

import { VueFormRenderer, renderer } from '@processmaker/vue-form-builder';

import {
  FormInput,
  FormSelect,
  FormTextArea,
  FormCheckbox,
  FormRadioButtonGroup,
  FormCodeEditor,
  FormAccordion,
} from '@processmaker/vue-form-elements';
import '@processmaker/vue-form-elements/dist/vue-form-elements.css';
import store from '@/store';
import { id as sequenceFlowId } from '@/components/nodes/sequenceFlow';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import processInspectorConfig from './process';
import sequenceExpression from './sequenceExpression';
import sequenceCallActivity from './sequenceCallActivity';

Vue.component('FormText', renderer.FormText);
Vue.component('FormInput', FormInput);
Vue.component('FormSelect', FormSelect);
Vue.component('FormTextArea', FormTextArea);
Vue.component('FormCheckbox', FormCheckbox);
Vue.component('FormRadioButtonGroup', FormRadioButtonGroup);
Vue.component('FormCodeEditor', FormCodeEditor);
Vue.component('FormAccordion', FormAccordion);
Vue.component('VueFormRenderer', VueFormRenderer);

export default {
  props: ['nodeRegistry', 'moddle', 'processNode'],
  data() {
    return {
      inspectorHandler: null,
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
        return processInspectorConfig;
      }

      if (this.isSequenceFlow(type) && this.isConnectedToGateway(definition)) {
        return sequenceExpression;
      }

      if (this.isSequenceFlow(type) && this.isConnectedToCallActivity(definition)) {
        sequenceCallActivity[0].items.find(item => {
          return item.config.name === 'calledElementStartEvent';
        }).config.targetCallActivity = definition.targetRef;

        return sequenceCallActivity;
      }

      return this.nodeRegistry[type].inspectorConfig;
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

<style>
.inspector-container {
  overflow-y: auto;
  font-size: 0.75em;
  text-align: left;
  padding: 8px;
  width: 320px;
  background-color: #eee;
  border-left: 1px solid #aaa;
}
</style>
