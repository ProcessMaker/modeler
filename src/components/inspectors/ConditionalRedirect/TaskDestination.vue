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

    <form-multi-select
      v-if="taskDestination?.value === 'customDashboard'"
      :label="$t('Dashboard')"
      name="Dashboard"
      :helper="$t('Select the dashboard to show the summary of this request when it completes')"
      v-model="customDashboard"
      :placeholder="$t('Type here to search')"
      :showLabels="false"
      :allow-empty="false"
      :options="dashboards"
      :loading="loading"
      optionContent="title"
      optionValue="url"
      class="p-0 mb-2"
      validation="required"
      :searchable="true"
      :internal-search="false"
      :preserve-search="false"
      :clear-on-select="true"
      @search-change="onDashboardSearchChange"
      data-test="dashboard"
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
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';

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
      customDashboard: null,
      dashboards: [],
      getCustomDashboardsDebounced: null,
      externalURL: '',
      urlPlaceholder: `${window.location.origin}/processes`,
    };
  },
  watch: {
    customDashboard: {
      handler(newValue, oldValue) {
        if (!isEqual(newValue, oldValue)) {
          this.onSaveCondition();
        }
      },
      deep: true,
    },
    externalURL() {
      this.onSaveCondition();
    },
  },
  created() {
    this.getCustomDashboardsDebounced = debounce((filter) => {
      this.getCustomDashboards(filter);
    }, 500);
  },
  mounted() {
    if (this.value) {
      this.condition = this.value.condition;
      this.taskDestination = this.value.taskDestination;
      this.customDashboard = this.value.customDashboard ?? null;
      this.externalURL = this.value.externalUrl ?? null;
    }

    if (this.dashboards.length === 0) {
      this.getCustomDashboards();
    }
  },
  methods: {
    onSaveCondition() {
      const conditionData = {
        conditionId: this.conditionId,
        condition: {
          condition: this.condition,
          taskDestination: this.taskDestination,
          customDashboard: this.customDashboard,
          externalUrl: this.externalURL,
        },
      };

      this.$emit('input', conditionData);
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
    getCustomDashboards(filter) {
      this.loading = true;

      const params = {
        order_direction: 'asc',
        per_page: 20,
        page: 1,
        fields: 'title,url',
      };

      if (filter) {
        params.filter = filter;
      }

      window.ProcessMaker.apiClient.get('dynamic-ui/dashboards', {
        params,
      })
        .then(response => {
          this.dashboards = response.data.data;
        })
        .catch(() => {
          this.dashboards = [];
        })
        .finally(() => {
          this.loading = false;
        });
    },
    onDashboardSearchChange(filter) {
      this.getCustomDashboardsDebounced(filter);
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
