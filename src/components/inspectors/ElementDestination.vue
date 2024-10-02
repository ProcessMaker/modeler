<template>
  <div>
    <form-multi-select
      :label="$t(label)"
      name="ElementDestination"
      :helper="helper"
      v-model="elementDestination"
      :placeholder="$t('Select element destination')"
      :showLabels="false"
      :allow-empty="false"
      :options="optionsCopy"
      :loading="loading"
      optionContent="content"
      optionValue="value"
      class="p-0 mb-2"
      :validation="validation"
      :searchable="false"
      :internal-search="false"
      :preserve-search="false"
      :clear-on-select="true"
      data-test="element-destination-type"
    />

    <form-multi-select
      v-if="destinationType === 'customDashboard'"
      :label="$t('Dashboard')"
      name="Dashboard"
      :helper="$t('Select the dashboard to show the summary of this request when it completes')"
      v-model="customDashboard"
      :placeholder="$t('Type here to search')"
      :showLabels="false"
      :allow-empty="false"
      :options="dashboardList"
      :loading="loading"
      optionContent="title"
      optionValue="url"
      class="p-0 mb-2"
      validation="required"
      :searchable="true"
      :internal-search="false"
      :preserve-search="false"
      :clear-on-select="true"
      @search-change="searchChange"
      data-test="dashboard"
    />
    <form-input
      v-if="destinationType === 'externalURL'"
      :label="$t('URL')"
      v-model="externalURL"
      :error="getValidationErrorForURL(externalURL)"
      data-cy="events-add-id"
      :placeholder="urlPlaceholder"
      :helper="$t('Determine the URL where the request will end')"
      data-test="external-url"
    />
    <process-form-select
      v-if="destinationType === 'anotherProcess'"
      @input="onProcessInput"
      :value="anotherProcess"
    />
  </div>
</template>

<script>
import ProcessFormSelect from '@/components/inspectors/ProcessFormSelect';
import debounce from 'lodash/debounce';
import isEqual from 'lodash/isEqual';
export default {
  components: { ProcessFormSelect },
  props: {
    label: {
      type: String,
      default: 'Element Destination',
    },
    options: {
      type: Array,
    },
    value: {
      type: String,
      default: '',
    },
  },
  name: 'ElementDestination',

  data() {
    return {
      optionsCopy: [],
      loading: false,
      validation: '',
      destinationType: null,
      dashboards: [],
      customDashboard: null,
      elementDestination: null,
      anotherProcess: '{}',
      defaultValues: {
        summaryScreen: null,
        customDashboard: null,
        processLaunchpad: `process-browser/${window.ProcessMaker.modeler.process.id}?categorySelected=-1`,
        externalURL: null,
        homepageDashboard: '/process-browser',
        taskList: '/tasks',
        taskSource: null,
        anotherProcess: '{}',
      },
      urlModel: null,
      local: null,
      loadDashboardsDebounced: null,
      urlPlaceholder: `${window.location.origin}/processes`,
      externalURL: '',
    };
  },
  watch: {
    elementDestination: {
      handler(newValue, oldValue) {
        if (newValue && !isEqual(newValue, oldValue)) {
          this.destinationTypeChange(newValue.value);
        }
      },
      deep: true,
    },
    customDashboard: {
      handler(newValue, oldValue) {
        if (!isEqual(newValue, oldValue)) {
          this.setBpmnValues({
            title: newValue.title,
            url: newValue.url,
          });
        }
      },
      deep: true,
    },
    externalURL() {
      this.setBpmnValues(this.externalURL);
    },
    anotherProcess() {
      this.setBpmnValues(this.anotherProcess);
    },
  },
  computed: {
    dashboardList() {
      const list = this.filterValidDashboards(this.dashboards) || [];
      return list;
    },
    node() {
      return this.$root.$children[0].$refs.modeler.highlightedNode.definition;
    },
    helper() {
      if (this.node.$type === 'bpmn:EndEvent') {
        return this.$t('The user will go here after completing the process.');
      }

      return this.$t('Select where to send users after this task. Any Non-default destination will disable the “Display Next Assigned Task” function.');
    },
  },
  created() {
    this.loadDashboardsDebounced = debounce((filter) => {
      this.loadDashboards(filter);
    }, 500);
    if (this.dashboardList.length === 0) {
      this.loadDashboards();
    }
  },
  mounted() {
    this.urlModel = { ...this.defaultValues };
    this.loadData();
  },
  methods: {
    getValidationErrorForURL(url) {
      if (!this.isValidURL(url)) {
        return this.$t('Must be a valid URL');
      }
      return '';
    },
    isValidURL(string) {
      try {
        new URL(string);
        return true;
      } catch (_) {
        return false;
      }
    },
    loadData() {
      this.optionsCopy = this.options.map(option => ({
        value: option.value,
        content: this.$t(option.content),
      }));

      this.elementDestination = this.optionsCopy?.[0] ?? null;

      if (this.value) {
        this.local = JSON.parse(this.value);
        this.elementDestination = this.getElementDestination();
        this.destinationType = this.getDestinationType();
        if (this.destinationType  === 'customDashboard'){
          this.customDashboard = this.getDestinationValue();
        }
        if (this.destinationType  === 'externalURL'){
          this.externalURL = this.getDestinationValue();
        }
        if (this.destinationType  === 'anotherProcess'){
          this.anotherProcess = this.getDestinationValue();
        }
      }
    },
    getElementDestination() {
      if (!this.local?.type) return null;
      return this.optionsCopy.find(element => element.value === this.local.type);
    },
    getDestinationType() {
      if (!this.local?.type) return null;
      return this.local?.type;
    },
    getDestinationValue() {
      if (!this.local?.value) return null;
      return this.local?.value;
    },
    destinationTypeChange(newType) {
      this.destinationType = newType;
      this.resetProperties();
      const data =  JSON.stringify({
        type: this.destinationType,
        value: this.urlModel[this.destinationType],
      });
      this.$emit('input', data);

      this.$nextTick(() => {
        this.handleInterstitial(newType);
      });
    },

    resetProperties() {
      this.urlModel = {
        ...this.defaultValues,
        customDashboard: this.customDashboard,
        anotherProcess: this.anotherProcess,
      };
    },
    searchChange(filter) {
      this.loadDashboardsDebounced(filter);
    },
    loadDashboards(filter) {
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
      }).then(response => {
        this.loading = false;
        this.dashboards = response.data.data;
      })
        .catch(() => {
          this.loading = false;
        });
    },
    filterValidDashboards(dashboards) {
      return dashboards;
    },
    setBpmnValues(value) {
      const data =  JSON.stringify({
        type: this.destinationType,
        value,
      });
      this.$emit('input', data);
    },
    onProcessInput(event) {
      this.anotherProcess = event;
      this.setBpmnValues(event);
    },
    /**
     * Handle interstitial for task source
     *
     * @param {String} newValue
     */
    handleInterstitial(newValue) {
      const taskTypes = ['bpmn:Task', 'bpmn:ManualTask'];

      if (!taskTypes.includes(this.node.$type)) {
        return;
      }

      let isDisabled = false;

      if (newValue !== 'taskSource') {
        isDisabled = true;
      }

      this.$root.$emit('handle-interstitial', {
        nodeId: this.node.id,
        isDisabled,
      });
    },
  },
};
</script>
