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
import uniqBy from 'lodash/uniqBy';

export default {
  computed: {
    dropdownList() {
      return this.processList.length > 0
        ? [{ value: '', content: '[Select Active Process]' }, ...this.processList]
        : null;
    },
    processList() {
      const list = [];

      store.getters.globalProcesses.forEach(process => {
        uniqBy(process.events, 'ownerProcessId').forEach(event => {
          list.push(this.toDropdownFormat(process, event));
        });

        // const subprocessList = [];

        // process.events.forEach(event => {
        //   if (!subprocessList.includes(event.ownerProcessId)) {
        //     subprocessList.push(event.ownerProcessId);
        //     list.push(this.toDropdownFormat(process, event));
        //   }
        // });
      });

      return list;
    },
  },
  methods: {
    containsMultipleProcesses(process) {
      return uniqBy(process.events, 'ownerProcessId').length > 1;
      // const subprocessList = [];
      // process.events.forEach((event) => {
      //   if (!subprocessList.includes(event.ownerProcessId)) {
      //     subprocessList.push(event.ownerProcessId);
      //   }
      // });
      // return subprocessList.length > 1;
    },
    toDropdownFormat(process, event) {
      return {
        value: `${event.ownerProcessId}-${process.id}`,
        content: this.containsMultipleProcesses(process)
          ? `${process.name} (${event.ownerProcessName})`
          : process.name,
      };
    },
  },
  created() {
    store.dispatch('fetchGlobalProcesses');
  },
};
</script>
