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
    /**
     * Get the list of processes and subprocesses
     * [
     *   {value:'ProcessBpmnId-DBProcessId' , content: 'ProcessName'}, ...
     * ]
     */
    processList() {
      const list = [];
      store.getters.globalProcesses.forEach((process) => {
        const subprocessList = [];
        process.events.forEach((event) => {
          if (subprocessList.indexOf(event.ownerProcessId)===-1) {
            subprocessList.push(event.ownerProcessId);
            list.push(this.toDropdownFormat(process, event));
          }
        });
      });
      return list;
    },
  },
  methods: {
    containsMultipleProcesses(process) {
      const subprocessList = [];
      process.events.forEach((event) => {
        if (subprocessList.indexOf(event.ownerProcessId)===-1) {
          subprocessList.push(event.ownerProcessId);
        }
      });
      return subprocessList.length > 1;
    },
    toDropdownFormat(process, event) {
      return {
        value: event.ownerProcessId + '-' + process.id,
        content: (process.name || process.id) + ( this.containsMultipleProcesses(process) ? '(' + event.ownerProcessName + ')' : '')
      };
    },
  },
  created() {
    store.dispatch('fetchGlobalProcesses');
  },
};
</script>
