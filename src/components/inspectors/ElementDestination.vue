<template>
  <div>
    <b-form-group :label="$t('Element Destination')">
      <b-form-select id="" v-model="destinationType" @change="destinationTypeChange" placeholder="$t('Select the element destination')">
        <b-form-select-option :value="null" disabled>{{ $t('Select element destination') }}</b-form-select-option>
        <option v-for="option in options" :key="option.value" :value="option.value">{{ $t(option.content) }}</option>
      </b-form-select>
      <small class="form-text text-muted">{{ $t("Enter the destination...") }}</small>
    </b-form-group>


    <b-form-group v-if="destinationType === 'customDashboard'" :label="$t('Dashboard')">
      <b-form-select id="" v-model="dashboardValue" @change="destinationTypeChange" placeholder="$t('Dashboard')">
        <b-form-select-option :value="null" disabled>{{ $t('Select a dashboard') }}</b-form-select-option>
        <option v-for="option in dashboardOptions" :key="option.value" :value="option.value">{{ $t(option.content) }}</option>
      </b-form-select>
      <small class="form-text text-muted">{{ $t("Select the dashboard to show the summary of this request when it completes") }}</small>
    </b-form-group>

    
    <b-form-group v-if="destinationType === 'processLaunchpad'" :label="$t('Process')">
      <b-form-select id="" v-model="launchpadValue" @change="destinationTypeChange">
        <b-form-select-option :value="null" disabled>{{ $t('Select the process') }}</b-form-select-option>
        <option v-for="option in launchpadOptions" :key="option.value" :value="option.value">{{ $t(option.content) }}</option>
      </b-form-select>
      <small class="form-text text-muted">{{ $t("Select the process launchpad to show the summary of this request when it completes") }}</small>
    </b-form-group>

    <b-form-group v-if="destinationType === 'externalURL'" :label="$t('URL')">
      <b-form-input id="input-default" placeholder="https://ci-ba427360a6.engk8s.processmaker.net/processes"></b-form-input>
      <small class="form-text text-muted">{{ $t("Determine de URL where the request will end") }}</small>
    </b-form-group>



   

  </div>
</template>

<script>
export default {
  props: {
    options: {
      type: Array,
    },
  },
  name: 'ElementDestination',
  data() {
    return {
      destinationType: null,
      dashboardValue: null,
      launchpadValue: null,
      dashboardOptions: [
        { value: 'first', content: 'Dashboard 1' },
        { value: 'second', content: 'Dashboard 2' },
      ],
      launchpadOptions:[
        { value: 'first', content: 'Launchpad 1' },
        { value: 'second', content: 'Launchpad 2' },
      ]
    };  
  },
  methods: {
    destinationTypeChange(value){
      console.log('destinationTypeChange-value', value);
    },
  },

};
</script>
