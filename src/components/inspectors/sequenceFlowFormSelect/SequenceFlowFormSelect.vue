<template>
  <div>
    <form-select
      v-if="targetSubProcess.calledElement"
      v-bind="$attrs"
      v-on="$listeners"
      :disabled="eventList.length === 0"
      :options="dropdownList"
    />
    <div v-else>
      <div class="error-title">
        <font-awesome-icon :icon="faExclamationTriangle" />
        Sub Process Start Event
      </div>
      <p>A process has not been configured in the connected Sub Process task.</p>
    </div>
  </div>
</template>

<script>
import store from '@/store';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  inheritAttrs: false,
  components: {
    FontAwesomeIcon,
  },
  data() {
    return { faExclamationTriangle };
  },
  props: {
    targetSubProcess: { type: Object, required: true },
  },
  computed: {
    dropdownList() {
      return this.eventList.length > 0
        ? this.eventList
        : [];
    },
    eventList() {
      const list = [];
      store.getters.globalProcesses.forEach((process) => {
        process.events.forEach((event) => {
          if (this.targetSubProcess.calledElement === event.ownerProcessId + '-' + String(process.id)) {
            list.push(this.toDropdownFormat(event));
          }
        });
      });
      return list;
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
<style lang="scss" src="./sequenceFlowFormSelect.scss" scoped />
