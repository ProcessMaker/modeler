<template>
  <b-card class="mt-2 p-2 pb-0 task-destination" no-body>
    <form-input
      :label="$t('Condition')"
      v-model="condition"
      placeholder="e.g., score > 80 and segment == 'A'"
      data-test="conditional-task-condition"
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
      data-test="conditional-task-redirect"
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
      data-test="conditional-task-dashboard"
    />

    <form-input
      v-if="taskDestination?.value === 'externalURL'"
      :label="$t('URL')"
      v-model="externalURL"
      :error="getValidationErrorForURL(externalURL)"
      :placeholder="urlPlaceholder"
      :helper="externalUrlHelperText"
      data-test="conditional-task-external-url"
    />

    <b-card-footer class="d-flex justify-content-end p-1 bg-white">
      <button
        type="button"
        class="btn btn-light btn-sm text-capitalize"
        @click="onDuplicateCondition"
        :disabled="maxConditionsReached"
        data-test="conditional-duplicate-button"
      >
        Duplicate
      </button>
      <button
        type="button"
        class="btn btn-light btn-sm text-danger text-capitalize"
        @click="onRemoveCondition"
        data-test="conditional-remove-button"
      >
        Remove
      </button>
    </b-card-footer>
  </b-card>
</template>

<script>
import { isValidElementDestinationURL } from '@/utils/elementDestinationUrl';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
import cloneDeep from 'lodash/cloneDeep';

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
    maxConditionsReached: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      loading: false,
      condition: '',
      taskDestination: null,
      dashboards: [],
      customDashboard: null,
      externalURL: '',
      urlPlaceholder: `${window.location.origin}/processes`,
      getCustomDashboardsDebounced: null,
      saveConditionDebounced: null,
    };
  },
  computed: {
    node() {
      return this.$root.$children[0].$refs.modeler.highlightedNode.definition;
    },
    externalUrlHelperText() {
      return this.$t('URL where the request will redirect. Supports Mustache:') + ' {{APP_URL}}, {{_request.id}}, {{_user.id}}, ' + this.$t('process variables.');
    },
  },
  watch: {
    condition: {
      handler(newValue, oldValue) {
        if (!isEqual(newValue, oldValue)) {
          this.saveConditionDebounced();
        }
      },
    },
    taskDestination: {
      handler(newValue, oldValue) {
        if (!isEqual(newValue, oldValue)) {
          this.onSaveCondition();
        }

        this.$nextTick(() => {
          this.handleInterstitial(newValue.value);
        });
      },
      deep: true,
    },
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

    this.saveConditionDebounced = debounce(() => {
      this.onSaveCondition();
    }, 300);
  },
  mounted() {
    if (this.value) {
      this.condition = cloneDeep(this.value.condition);
      this.taskDestination = cloneDeep(this.value.taskDestination);
      this.customDashboard = cloneDeep(this.value.customDashboard) ?? null;
      this.externalURL = cloneDeep(this.value.externalUrl) ?? null;
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
    getValidationErrorForURL(url) {
      const isEmpty = typeof url !== 'string' || !url || !url.trim();
      if (isEmpty) {
        if (this.taskDestination?.value === 'externalURL') {
          return this.$t('URL is required when External URL is selected.');
        }
        return '';
      }
      if (!this.isValidURL(url)) {
        return this.$t('Must be a valid URL or Mustache expressions') + ' ({{APP_URL}}, {{_request.id}}, {{_user.id}}, ' + this.$t('process variables') + ').';
      }
      return '';
    },
    isValidURL(string) {
      return isValidElementDestinationURL(string);
    },
    getCustomDashboards(filter) {
      this.loading = true;

      const params = {
        order_direction: 'asc',
        per_page: 20,
        page: 1,
        simplified_data_for_selector: true,
        fields: 'id,title,token',
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
    /**
     * Handles interstitial logic for supported task node types.
     * @param {string} newValue - The new destination type value selected.
     */
    handleInterstitial(newValue) {
      const { $type: nodeType, id: nodeId } = this.node;
      const supportedTypes = ['bpmn:Task', 'bpmn:ManualTask'];

      if (supportedTypes.includes(nodeType)) {
        this.handleTaskInterstitial(newValue, nodeId);
      }
    },
    /**
     * Handle interstitial for task elements
     *
     * @param {String} newValue - The new destination type value selected
     * @param {String} nodeId - The ID of the task node being modified
     */
    handleTaskInterstitial(newValue, nodeId) {
      this.$root.$emit('handle-task-interstitial', {
        nodeId,
        show: newValue === 'displayNextAssignedTask',
        isConditionalRedirect: true,
      });
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
