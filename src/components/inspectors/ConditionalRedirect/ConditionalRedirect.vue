<template>
  <div>
    <label>{{ $t(label) }}</label>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <label for="conditionalRedirectEnabled" class="text-muted small">
        {{ $t("Enable to add rules that route users to different tasks. If none match, the default destination is used.") }}
      </label>
      <b-form-checkbox
        id="conditionalRedirectEnabled"
        v-model="isEnabled"
        name="conditionalRedirectEnabled"
        :aria-checked="isEnabled"
        switch
      />
    </div>
    <div v-if="isEnabled">
      <button type="button" class="btn btn-light" @click="addCondition">
        <i class="fas fa-plus-circle" />
      </button>

      <div v-for="condition in conditions" :key="condition.id">
        <TaskDestination
          :value="condition"
          :taskDestinationOptions="taskDestinationOptions"
          :conditionId="condition.id"
          @input="onSaveCondition"
          @duplicate="onDuplicateCondition"
          @remove="onRemoveCondition"
        />
      </div>
    </div>
  </div>
</template>

<script>
import TaskDestination from './TaskDestination.vue';
import { v4 as uuidv4 } from 'uuid';
import isEqual from 'lodash/isEqual';

const MAX_CONDITIONS = 10;

export default {
  components: {
    TaskDestination,
  },
  props: {
    value: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    options: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isEnabled: false,
      conditions: [],
      taskDestinationOptions: [],
    };
  },
  watch: {
    /* conditionalRedirect: {
      handler(newValue, oldValue) {
        if (newValue && !isEqual(newValue, oldValue)) {
          this.updateConditionalRedirect(newValue);
        }
      },
      deep: true,
    }, */
    isEnabled: {
      handler() {
        this.updateConditionalRedirect();
      },
    },
  },
  mounted() {
    this.initTaskDestinationOptions();

    if (this.value) {
      const local = JSON.parse(this.value);

      this.isEnabled = local.isEnabled ?? false;
      this.conditions = local.conditions ?? [];
    }
  },
  methods: {
    initTaskDestinationOptions() {
      this.taskDestinationOptions = this.options.map(({ value, content }) => ({
        value,
        content: this.$t(content),
      }));

      this.taskDestination = this.taskDestinationOptions?.[0] ?? null;
    },
    updateConditionalRedirect(newValue) {
      const data =  JSON.stringify({
        isEnabled: this.isEnabled,
        conditions: this.conditions,
      });

      this.$emit('input', data);
    },
    addCondition() {
      if (this.conditions.length >= MAX_CONDITIONS) {
        return;
      }

      this.conditions.push({
        id: uuidv4(),
        condition: '',
        taskDestination: null,
      });
    },
    onSaveCondition(value) {
      const index = this.conditions.findIndex((condition) => condition.id === value.conditionId);

      if (index !== -1) {
        this.conditions[index] = {
          ...this.conditions[index],
          ...value.condition,
        };
      }

      this.updateConditionalRedirect();
    },
    onDuplicateCondition(conditionId) {
      const condition = this.conditions.find((condition) => condition.id === conditionId);

      this.conditions.push({
        ...condition,
        id: uuidv4(),
      });

      this.updateConditionalRedirect();
    },
    onRemoveCondition(conditionId) {
      this.conditions = this.conditions.filter((condition) => condition.id !== conditionId);

      this.updateConditionalRedirect();
    },
  },
};
</script>
