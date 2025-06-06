<template>
  <transition name="inspector">
    <b-col
      id="inspector"
      class="pl-0 h-100 overflow-hidden inspector-column"
      :class="[{ 'ignore-pointer': canvasDragPosition, 'ai-inspector': isAiInspector }]"
      data-test="inspector-column"
    >
      <b-card
        no-body class="inspector-container border-top-0 border-bottom-0 border-right-0 rounded-0"
        data-test="inspector-container"
        :style="{ height: parentHeight }"
        data-cy="inspector-panel"
      >
        <template #header>
          <div class="inspector-header">
            <div class="inspector-header-title">
              {{ inspectorHeaderTitle }}
            </div>
            <button
              type="button"
              aria-label="Close"
              class="close"
              @click="onClose"
              data-cy="inspector-close-button"
            >
              ×
            </button>
          </div>
        </template>
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
  components: { },
  props: ['nodeRegistry', 'moddle', 'processNode', 'parentHeight', 'canvasDragPosition', 'definitions'],
  data() {
    return {
      data: {},
      config: [],
      inspectorHandler: null,
      translated: [],
      isVisible: true,
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
    'highlightedNode.definition.allowInterstitial'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.interstitialScreenRef'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.screenRef'(current, previous) { this.handleAssignmentChanges(current, previous); },
    'highlightedNode.definition.scriptRef'(current, previous) { this.handleAssignmentChanges(current, previous); },
  },
  computed: {
    inspectorHeaderTitle() {
      if (this.data.implementation === 'package-ai/processmaker-ai-assistant') {
        return this.$t('AI Assistant');
      }

      return this.$t('Configuration');
    },
    isAiInspector() {
      return this.data.implementation === 'package-ai/processmaker-ai-assistant';
    },
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
          this.multiplayerHook('documentation', documentation, store.state.isMultiplayer);
        }

        inspectorHandler(omit(value, ['documentation']), store.state.isMultiplayer);
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
    /**
     * On Close even handler
     */
    onClose(){
      this.$emit('toggleInspector', false);
    },
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
        helper += ' <a href=https://docs.processmaker.com/docs/feel-expression-syntax" target="_blank"><i class="far fa-question-circle mr-1"></a>';
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
    customInspectorHandler(value, isMultiplayer) {
      return this.nodeRegistry[this.highlightedNode.type].inspectorHandler(value, this.highlightedNode, this.setNodeProp, this.moddle, this.definitions, this.defaultInspectorHandler, isMultiplayer);
    },
    processNodeInspectorHandler(value, isMultiplayer) {
      return this.defaultInspectorHandler(omit(value, ['artifacts', 'flowElements', 'laneSets']), isMultiplayer);
    },
    setNodeProp(node, key, value) {
      this.$emit('shape-resize');
      store.commit('updateNodeProp', { node, key, value });
    },
    defaultInspectorHandler(value, isMultiplayer) {
      /* Go through each property and rebind it to our data */
      for (const key in omit(value, ['$type', 'eventDefinitions'])) {
        if (this.highlightedNode.definition.get(key) !== value[key]) {
          this.multiplayerHook(key, value[key], isMultiplayer);
          this.setNodeProp(this.highlightedNode, key, value[key]);
        }
      }
    },
    updateState() {
      this.$emit('save-state');
    },
    multiplayerHook(key, value, isMultiplayer) {
      if (isMultiplayer) {
        window.ProcessMaker.EventBus.$emit('multiplayer-updateInspectorProperty', {
          id: this.highlightedNode.definition.id , key, value,
        });
      }
    },
  },
};
</script>
<style lang="scss" src="./inspector.scss" scoped />
