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
      <p>A process has not been configured in the connected Call Activity task.</p>
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
        ? this.eventList
        : [];
    },
    eventList() {
      const list = [];
      store.getters.globalProcesses.forEach((process) => {
        process.events.forEach((event) => {
          if (this.targetCallActivity.calledElement === event.ownerProcessId + '-' + String(process.id)) {
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

<style scoped>
.error-title {
  color: #d9534f;
  font-size: 1rem;
}
</style>
