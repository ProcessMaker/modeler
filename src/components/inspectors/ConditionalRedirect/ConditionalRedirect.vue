<template>
  <div>
    <label>{{ $t(label) }}</label>
    <div class="d-flex justify-content-between align-items-center mb-2">
      <span
        class="text-muted small"
        v-html="conditionalRedirectDescription"
      />
      <b-form-checkbox
        id="conditionalRedirectEnabled"
        v-model="isEnabled"
        name="conditionalRedirectEnabled"
        :aria-checked="isEnabled"
        switch
        data-test="conditional-toggle"
      />
    </div>
    <div v-if="isEnabled">
      <button
        type="button"
        class="btn btn-light"
        @click="addCondition"
        :disabled="maxConditionsReached"
        data-test="conditional-add-button"
      >
        <i class="fas fa-plus-circle" />
      </button>

      <div
        v-for="condition in conditions"
        :key="condition.id"
        data-test="conditional-box"
      >
        <TaskDestination
          :value="condition"
          :taskDestinationOptions="taskDestinationOptions"
          :conditionId="condition.id"
          :maxConditionsReached="maxConditionsReached"
          @input="onSaveCondition"
          @duplicate="onDuplicateCondition"
          @remove="onRemoveCondition"
        />
      </div>

      <hr class="my-2">

      <div class="d-flex justify-content-end">
        <small class="text-muted text-right">
          {{ $t('Rules are evaluated top to bottom.') }}
        </small>
      </div>
    </div>
  </div>
</template>

<script>
import TaskDestination from './TaskDestination.vue';
import { v4 as uuidv4 } from 'uuid';

const MAX_CONDITIONS = 10;

export default {
  components: {
    TaskDestination,
  },
  props: {
    value: {
      type: String,
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
      taskDestination: null,
      isEnabled: false,
      conditions: [],
      taskDestinationOptions: [],
      MAX_CONDITIONS,
    };
  },
  computed: {
    conditionalRedirectDescription() {
      return this.$t('Enable to add rules that route users to different tasks. If none match, the <b>Task Destination</b> is used.');
    },
    maxConditionsReached() {
      return this.conditions.length >= MAX_CONDITIONS;
    },
  },
  watch: {
    isEnabled: {
      handler() {
        this.updateConditionalRedirect();
      },
    },
  },
  mounted() {
    this.initTaskDestinationOptions();

    if (this.value) {
      try {
        const local = JSON.parse(this.value);

        this.isEnabled = local.isEnabled ?? false;
        this.conditions = local.conditions ?? [];
      } catch (error) {
        console.warn(error, 'Error parsing conditional redirect', this.value);
      }
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
    updateConditionalRedirect() {
      const data =  JSON.stringify({
        isEnabled: this.isEnabled,
        conditions: this.conditions,
      });

      this.$emit('input', data);
    },
    addCondition() {
      if (this.maxConditionsReached) {
        return;
      }

      this.conditions.push({
        id: uuidv4(),
        condition: '',
        taskDestination: null,
      });

      this.updateConditionalRedirect();
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
      if (this.maxConditionsReached) {
        return;
      }

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
