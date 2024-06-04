<template>
  <div>
    <form-multi-select
      :label="$t('Element Destination')"
      name="ElementDestination"
      :helper="$t('Enter the destination...')"
      v-model="elementDestination"
      :placeholder="$t('Select element destination')"
      :showLabels="false"
      :allow-empty="false"
      :options="options"
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
      :validation="validation"
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
      :helper="$t('Determine de URL where the request will end')"
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
      urlPlaceholder: 'https://ci-ba427360a6.engk8s.processmaker.net/processes',
      externalURL: '',
    };  
  },
  watch: {
    elementDestination: {
      handler(newValue, oldValue) {
        if (!isEqual(newValue, oldValue)) {
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
      return this.options.find(element => element.value === this.local.type);
    },
    getDestinationType() {
      if (!this.local?.type) return null;
      return this.local?.type;
    },
    getDestinationValue() {
      if (!this.local?.value) return null;
      return this.local?.value;
    },
    destinationTypeChange(newType){
      this.destinationType = newType;
      this.resetProperties(); 
      const data =  JSON.stringify({
        type: this.destinationType,
        value: this.urlModel[this.destinationType],
      });
      this.$emit('input', data);
    },

    resetProperties() {
      this.urlModel = { ...this.defaultValues };
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
    }
  },
};
</script>
