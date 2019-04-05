<template>
  <form-select
    v-bind="$attrs"
    v-on="$listeners"
    :disabled="eventList.length === 0"
    :options="dropdownList"
  />
</template>

<script>
import store from '@/store';

export default {
  inheritAttrs: false,
  props: {
    targetCallActivity: { type: Object, required: true },
  },
  computed: {
    dropdownList() {
      return this.eventList.length > 0
        ? this.eventList
        : null;
    },
    eventList() {
      const targetProcess = store.getters.globalProcesses
        .find(process => process.id === Number(this.targetCallActivity.calledElement));

      return targetProcess
        ? targetProcess.events.map(this.toDropdownFormat)
        : [];
    },
  },
  methods: {
    toDropdownFormat(event) {
      return { value: event.id, content: event.name || event.id };
    },
  },
  created() {
    store.dispatch('fetchGlobalProcesses');
  },
};
</script>
