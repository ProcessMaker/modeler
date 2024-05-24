<template>
  <div>
    <b-form-group :label="$t('Element Destination')">
      <b-form-select id="" v-model="destinationType" @change="destinationTypeChange">
        <b-form-select-option :value="null" disabled>{{ $t('Select element destination') }}</b-form-select-option>
        <option v-for="option in options" :key="option.value" :value="option.value">{{ $t(option.content) }}</option>
      </b-form-select>
      <small class="form-text text-muted">{{ $t("Enter the destination...") }}</small>
    </b-form-group>

    <form-multi-select
      v-if="destinationType === 'customDashboard'"
      :label="$t('Dashboard')"
      name="Dashboard"
      :helper="$t('Select the dashboard to show the summary of this request when it completes')"
      v-model="customDashboad"
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
      :clear-on-select="false"
      @search-change="searchChange"
    />
    <!-- <multiselect
      v-if="destinationType === 'customDashboard'"
      id="search-dashboard-text"
      :value="urlModel['customDashboard']"
      :placeholder="$t('Dashboard')"
      :options="dashboardOptions"
      :multiple="false"
      :show-labels="false"
      :searchable="false"
      :allow-empty="false"
      track-by="value"
      label="title"
      class="assignable-input"
      @change="change"
    >
      <template slot="noResult">
        <slot name="noResult">
          {{ $t('No elements found. Consider changing the search query.') }}
        </slot>
      </template>
      <template slot="noOptions">
        <slot name="noOptions">
          {{ $t('No Data Available') }}
        </slot>
      </template>
    </multiselect> -->
    <!-- <small class="form-text text-muted">{{ $t("Select the dashboard to show the summary of this request when it completes") }}</small> -->
    <!-- </b-form-group> -->

    <b-form-group v-if="destinationType === 'externalURL'" :label="$t('URL')">
      <b-form-input v-model="urlModel['externalURL']" id="externalURL" :placeholder="urlPlaceholder" @change="destinationValueChange"/>
      <small class="form-text text-muted">{{ $t("Determine de URL where the request will end") }}</small>
    </b-form-group>
  </div>
</template>

<script>
import { isEqual } from 'lodash';
import debounce from 'lodash/debounce';
export default {
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
      loading: false ,
      validation: '',
      destinationType: null,
      dashboards: [],
      customDashboad: null,
      defaultValues: {
        summaryScreen: null,
        customDashboard: null,
        processLaunchpad: `process-browser/${window.ProcessMaker.modeler.process.id}?categorySelected=-1`,
        externalURL: null,
        homepageDashboard: '/process-browser',
        taskList: '/tasks',
        taskSource: null,
      },
      urlModel: null,
      local: null,
      loadDashboardsDebounced: null,
      urlPlaceholder: 'https://ci-ba427360a6.engk8s.processmaker.net/processes',
      dashboardOptions: [
        { value: 'first', title: 'Dashboard 1' },
        { value: 'second', title: 'Dashboard 2' },
      ],
    };  
  },
  watch: {
    value: {
      deep: true,
      handler(value) {
        if (!isEqual(this.local, value)) {
          this.loadData();
        }
      },
    },
    customDashboad() {
      this.setBpmnValues();
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
    loadData() {
      try {
        if (typeof this.value !== 'string') {
          throw new Error('Value is not a string');
        } 

        this.local = JSON.parse(this.value);

        this.destinationType = this.getDestinationType();
        this.customDashboad = this.getDestinationValue();
        
      } catch (error) {
        console.error('Error loading data:', error.message);
        // You might want to handle or report the error further depending on your application's needs
      }
    },
    getDestinationType() {
      if (!this.local?.type) return null;
      return this.local?.type;
    },
    getDestinationValue() {
      if (!this.local?.value) return null;
      return this.local?.value;
    },
    destinationTypeChange(){
      this.resetProperties(this.destinationType); 
      const data =  JSON.stringify({
        type: this.destinationType,
        value: this.urlModel[this.destinationType],
      });
      this.$emit('input', data);
      
    },
    destinationValueChange(value) {
      const data =  JSON.stringify({
        type: this.destinationType,
        value,
      });
      // Reset all properties except 'destinationType' to a default value (e.g., null)
     
      this.urlModel[this.destinationType] = value,
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
    setBpmnValues() { 
      const data =  JSON.stringify({
        type: this.destinationType,
        value: {
          title: this.customDashboad.title,
          url: this.customDashboad.url,
        },
      });
      this.$emit('input', data);
    },
  },
};
</script>
