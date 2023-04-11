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
          :key="highlightedNode._modelerId"
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

import { renderer } from '@processmaker/screen-builder';

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
import isString from 'lodash/isString';

Vue.component('FormText', renderer.FormText);
Vue.component('FormInput', FormInput);
Vue.component('FormSelect', FormSelect);
Vue.component('FormTextArea', FormTextArea);
Vue.component('FormCheckbox', FormCheckbox);
Vue.component('FormRadioButtonGroup', FormRadioButtonGroup);
Vue.component('FormAccordion', FormAccordion);
Vue.component('FormDatePicker', FormDatePicker);
Vue.component('FormMultiSelect', FormMultiSelect);

export default {
  props: ['nodeRegistry', 'moddle', 'processNode', 'parentHeight', 'canvasDragPosition', 'compressed', 'definitions'],
  data() {
    return {
      data: {},
      config: [],
      inspectorHandler: null,
      translated: [],
    };
  },
  watch: {
    highlightedNode() {
      document.activeElement.blur();
      this.prepareData();
      this.prepareConfig();
    },
    'highlightedNode.definition.assignment'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.assignmentLock'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.allowReassignment'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.assignedUsers'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.assignedGroups'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.assignmentRules'(current, previous) { this.handleAssignmentChanges(current, previous); },
  },
  computed: {
    highlightedNode() {
      return store.getters.highlightedNodes[0];
    },
    isAnyNodeActive() {
      return this.highlightedNode;
    },
    updateDefinition() {
      if (!this.isAnyNodeActive) {
        return noop;
      }

      let inspectorHandler = this.defaultInspectorHandler;

      if (this.isProcessNodeActive) {
        inspectorHandler = this.processNodeInspectorHandler;
      }

      if (this.hasCustomInspectorHandler) {
        inspectorHandler = this.customInspectorHandler;
      }

      return value => {
        if (!value) {
          return;
        }
        if (isString(value.documentation) && get(this.highlightedNode.definition.get('documentation')[0], 'text') !== value.documentation) {

          const documentation = value.documentation
            ? [this.moddle.create('bpmn:Documentation', { text: value.documentation })]
            : undefined;

          this.setNodeProp(this.highlightedNode, 'documentation', documentation);
        }

        inspectorHandler(omit(value, ['documentation']));
      };
    },
    hasCustomInspectorHandler() {
      return this.nodeRegistry[this.highlightedNode.type].inspectorHandler;
    },
    isProcessNodeActive() {
      return this.highlightedNode === this.processNode;
    },
  },
  methods: {
    handleAssignmentChanges(currentValue, previousValue) {
      if (currentValue === previousValue) {
        return;
      }
      this.prepareData();
    },
    prepareConfig() {
      if (!this.highlightedNode) {
        return this.config = {
          name: 'Empty',
          items: [],
        };
      }

      const { type, definition } = this.highlightedNode;

      if (this.highlightedNode === this.processNode) {
        return this.config = Process.inspectorConfig;
      }

      const inspectorConfig = cloneDeep(this.nodeRegistry[type].inspectorConfig);
      const sequenceFlowConfigurationFormElements = get(inspectorConfig, '[0].items[0].items');

      if (this.isSequenceFlow(type) && this.isConnectedToGateway(definition)) {
        let helper = this.$t('Enter the expression that describes the workflow condition');
        helper += ' <a href="https://processmaker.gitbook.io/processmaker/v/processmaker-4.3/designing-processes/expression-syntax-components" target="_blank"><i class="far fa-question-circle mr-1"></a>';
        const expressionConfig = {
          component: 'FormInput',
          config: {
            label: this.$t('Expression'),
            helper,
            name: 'conditionExpression',
          },
        };

        // Always move the Expression Field below the Name field in the inspector
        const nameField = sequenceFlowConfigurationFormElements.find(x => x.config && x.config.label === 'Name');
        const nameFieldIndex = sequenceFlowConfigurationFormElements.indexOf(nameField);
        if (nameField && nameFieldIndex >= 0) {
          sequenceFlowConfigurationFormElements.splice(nameFieldIndex + 1, 0, expressionConfig);
        }
        else {
          sequenceFlowConfigurationFormElements.push(expressionConfig);
        }

      }

      return this.config = inspectorConfig;
    },
    prepareData() {
      if (!this.highlightedNode) {
        return {};
      }

      const type = this.highlightedNode && this.highlightedNode.type;

      const defaultDataTransform = (node) => Object.entries(node.definition).reduce((data, [key, value]) => {
        data[key] = value;

        return data;
      }, {});

      this.data = type && this.nodeRegistry[type].inspectorData
        ? this.nodeRegistry[type].inspectorData(this.highlightedNode, defaultDataTransform, this)
        : defaultDataTransform(this.highlightedNode);
    },
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
      return this.nodeRegistry[this.highlightedNode.type].inspectorHandler(value, this.highlightedNode, this.setNodeProp, this.moddle, this.definitions, this.defaultInspectorHandler);
    },
    processNodeInspectorHandler(value) {
      return this.defaultInspectorHandler(omit(value, ['artifacts', 'flowElements', 'laneSets']));
    },
    setNodeProp(node, key, value) {
      this.$emit('shape-resize');
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
