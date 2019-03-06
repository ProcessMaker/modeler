<template>
  <div>
    <form-select
      label="Call Activity Type"
      name="callActivityType"
      helper="Please select how this call activity will work"
      :options="activityTypeOptions"
      @input="onChange('callActivityType', $event)"
    />

    <form-select
      :label="dropdownLabel"
      name="calledElement"
      :disabled="processList == null"
      :options="processList"
      @input="onChange('calledElement', $event)"
    />

    <form-checkbox
      v-if="isProcessActivityType"
      label="Run process asynchronously"
      name="runAsynchronously"
      @change="onChange('runAsynchronously', $event)"
    />
  </div>
</template>

<script>
import store from '@/store';

export default {
  data() {
    const activityTypes = { process: 'process', globalTask: 'globalTask' };

    return {
      activityType: activityTypes.process,
      activityTypes,
      activityTypeOptions: [
        { value: activityTypes.process, content: 'Process' },
        { value: activityTypes.globalTask, content: 'Global Task' },
      ],
    };
  },
  computed: {
    dropdownLabel() {
      return this.isProcessActivityType ? 'Processes' : 'Global Tasks';
    },
    dropdownList() {
      const list = this.isProcessActivityType
        ? this.processList
        : this.globalTaskList;

      return list.length > 0 ? list : null;
    },
    isProcessActivityType() {
      return this.activityType === this.activityTypes.process;
    },
    calledElementLabel() {
      return 'Processes';
    },
    processList() {
      return store.getters.rootElements
        .filter(this.isProcess)
        .filter(this.containsStartEvent)
        .map(this.toDropdownFormat);
    },
    globalTaskList() {
      return store.getters.rootElements
        .filter(this.isGlobalTask)
        .map(this.toDropdownFormat);
    },
  },
  methods: {
    onChange(key, value) {
      this.$emit('input', { [key]: value });
    },
    isGlobalTask(element) {
      return element.$type === 'bpmn:GlobalTask';
    },
    isProcess(element) {
      return element.$type === 'bpmn:Process';
    },
    toDropdownFormat(element) {
      return { value: element.id, content: element.name || element.id };
    },
    containsStartEvent(process) {
      return process.flowElements.some(element => element.$type === 'bpmn:StartEvent');
    },
  },
};
</script>
