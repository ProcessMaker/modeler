<template>
  <form-select
    v-bind="$attrs"
    v-on="$listeners"
    :disabled="processList.length === 0"
    :options="dropdownList"
  />
</template>

<script>
import store from '@/store';

export default {
  computed: {
    dropdownList() {
      return this.processList.length > 0
        ? this.processList
        : null;
    },
    processList() {
      return store.getters.rootElements
        .filter(this.isProcess)
        .filter(this.containsStartEvent)
        .map(this.toDropdownFormat);
    },
  },
  methods: {
    isProcess(element) {
      return element.$type === 'bpmn:Process';
    },
    containsStartEvent(process) {
      return process.get('flowElements').some(element => element.$type === 'bpmn:StartEvent');
    },
    toDropdownFormat(element) {
      return { value: element.id, content: element.name || element.id };
    },
  },
};
</script>
