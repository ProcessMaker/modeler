<template>
  <div>
    <form-select
      v-if="targetCallActivity.calledElement"
      v-bind="$attrs"
      v-on="$listeners"
      :disabled="eventList.length === 0"
      :options="dropdownList"
    />
    <div v-else>
      <div class="error-title">
        <font-awesome-icon :icon="faExclamationTriangle" />
        Call Activity Start Event
      </div>
      <p>A process has not been configred in the connnected Call Acitivty task.</p>
    </div>
  </div>
</template>

<script>
import store from '@/store';
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

export default {
  inheritAttrs: false,
  components : {
    FontAwesomeIcon,
  },
  data() {
    return { faExclamationTriangle };
  },
  props: {
    targetCallActivity: { type: Object, required: true },
  },
  computed: {
    dropdownList() {
      return this.eventList.length > 0
        ? [{ value: '', content: 'Select Start Event' }, ...this.eventList]
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

<style scoped>
.error-title {
  color: #d9534f;
  font-size: 1rem;
}
</style>
