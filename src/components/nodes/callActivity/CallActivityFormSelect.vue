<template>
  <div>
    <form-multi-select
      v-bind="$attrs"
      @input="$emit('input', $event ? $event.value : '')"
      :value="selectValue"
      :disabled="processList.length === 0"
      :options="dropdownList"
      optionValue="value"
      optionContent="content"
      class="p-0 mb-2"
    />

    <a
      v-if="value"
      :href="`/modeler/${selectedProcessId}`"
      target="_blank"
    >
      Open Process
      <i class="ml-1 fas fa-external-link-alt"/>
    </a>
  </div>
</template>

<script>
import store from '@/store';
import uniqBy from 'lodash/uniqBy';

export default {
  inheritAttrs: false,
  props: ['value'],
  computed: {
    selectValue() {
      return this.dropdownList.find(option => option.value === this.value);
    },
    selectedProcessId() {
      return this.processList.find(({ value }) => value === this.value).processId;
    },
    dropdownList() {
      return this.processList.length > 0
        ? this.processList
        : [];
    },
    processList() {
      const list = [];

      store.getters.globalProcesses.forEach(process => {
        uniqBy(process.events, 'ownerProcessId').forEach(event => {
          list.push(this.toDropdownFormat(process, event));
        });
      });

      return list;
    },
  },
  methods: {
    containsMultipleProcesses(process) {
      return uniqBy(process.events, 'ownerProcessId').length > 1;
    },
    toDropdownFormat(process, event) {
      return {
        processId: process.id,
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
