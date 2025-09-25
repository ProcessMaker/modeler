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

    <form-input
      v-if="taskDestination?.value === 'externalURL'"
      :label="$t('URL')"
      v-model="externalURL"
      :error="getValidationErrorForCustomURL(externalURL)"
      :placeholder="urlPlaceholder"
      :helper="$t('Determine the URL where the request will end')"
      data-test="external-url"
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
      externalURL: '',
      urlPlaceholder: `${window.location.origin}/processes`,
    };
  },
  watch: {
    externalURL() {
      this.onSaveCondition();
    },
  },
  mounted() {
    if (this.value) {
      this.condition = this.value.condition;
      this.taskDestination = this.value.taskDestination;
      this.externalURL = this.value.externalUrl;
    }
  },
  methods: {
    onSaveCondition() {
      this.$emit('input', {
        conditionId: this.conditionId,
        condition: {
          condition: this.condition,
          taskDestination: this.taskDestination,
          externalUrl: this.externalURL,
        },
      });
    },
    onDuplicateCondition() {
      this.$emit('duplicate', this.conditionId);
    },
    onRemoveCondition() {
      this.$emit('remove', this.conditionId);
    },
    getValidationErrorForCustomURL(url) {
      if (!url) return this.$t('URL is required');
      if (!this.isValidCustomURL(url)) return this.$t('Must be a valid URL');
      return '';
    },
    isValidCustomURL(url) {
      try {
        const parsed = new URL(url);
        return ['http:', 'https:'].includes(parsed.protocol);
      } catch {
        return false;
      }
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
