<template>
  <b-card class="mt-2 p-2 pb-0 task-destination" no-body>
    <form-input
      :label="$t('Condition')"
      v-model="condition"
      placeholder="e.g., score > 80 and segment == 'A'"
      data-test="condition"
    />

    <form-multi-select
      :label="$t('Task Destination')"
      v-model="taskDestination"
      :allow-empty="false"
      :options="taskDestinationOptions"
      :loading="loading"
      optionContent="content"
      optionValue="value"
      class="p-0 mb-2"
      :searchable="false"
      :internal-search="false"
      :preserve-search="false"
      :clear-on-select="true"
      data-test="element-destination-type"
    />

    <b-card-footer class="d-flex justify-content-end p-1 bg-white">
      <button
        type="button"
        class="btn btn-primary btn-sm text-capitalize"
        @click="onSaveCondition"
      >
        Save
      </button>
      <button
        type="button"
        class="btn btn-light btn-sm text-capitalize"
        @click="onDuplicateCondition"
      >
        Duplicate
      </button>
      <button
        type="button"
        class="btn btn-light btn-sm text-danger text-capitalize"
        @click="onRemoveCondition"
      >
        Remove
      </button>
    </b-card-footer>
  </b-card>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      required: true,
    },
    conditionId: {
      type: String,
      required: true,
    },
    taskDestinationOptions: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      condition: '',
      taskDestination: null,
    };
  },
  watch: {
    value: {
      handler(newValue) {
        this.condition = newValue.condition;
        this.taskDestination = newValue.taskDestination;
      },
      deep: true,
    },
  },
  mounted() {
    if (this.value) {
      this.condition = this.value.condition;
      this.taskDestination = this.value.taskDestination;
    }
  },
  methods: {
    onSaveCondition() {
      this.$emit('input', {
        conditionId: this.conditionId,
        condition: {
          condition: this.condition,
          taskDestination: this.taskDestination,
        },
      });
    },
    onDuplicateCondition() {
      this.$emit('duplicate', this.conditionId);
    },
    onRemoveCondition() {
      this.$emit('remove', this.conditionId);
    },
  },
};
</script>

<style lang="scss" scoped>
.task-destination {
  --label-font-weight: 500;
  --input-font-size: 14px;

  ::v-deep .form-group label {
    font-weight: var(--label-font-weight);
  }

  ::v-deep .form-control {
    font-size: var(--input-font-size);
  }
}
</style>
