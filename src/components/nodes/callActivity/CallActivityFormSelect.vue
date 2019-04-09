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
        ? [{ value: '', content: 'Select Active Process' }, ...this.processList]
        : null;
    },
    processList() {
      return store.getters.globalProcesses
        .filter(this.containsStartEvent)
        .map(this.toDropdownFormat);
    },
  },
  methods: {
    containsStartEvent(process) {
      return process.events.length > 0;
    },
    toDropdownFormat(process) {
      return { value: process.id, content: process.name || process.id };
    },
  },
  created() {
    store.dispatch('fetchGlobalProcesses');
  },
};
</script>
