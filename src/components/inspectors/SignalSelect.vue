<template>
  <div>
    <label class="typo__label">{{ label }}</label>
    <div class="d-flex">
      <multiselect
        :value="selectedOption"
        @input="change"
        :placeholder="placeholder"
        :options="options"
        :multiple="multiple"
        :track-by="trackBy"
        :show-labels="false"
        :searchable="true"
        :internal-search="false"
        label="name"
        @search-change="loadOptionsDebounced"
        @open="loadOptions"
        :data-test="`${name}:select`"
      >
        <template slot="noResult">
          <slot name="noResult">{{ $t('Not found') }}</slot>
        </template>
        <template slot="noOptions">
          <slot name="noOptions">{{ $t('No Data Available') }}</slot>
        </template>
      </multiselect>
      <div class="btn-group ml-1" role="group">
        <button type="button" class="btn btn-secondary btn-sm" @click="toggleConfigSignal">
          <i class="fa fa-ellipsis-h" />
        </button>
      </div>
    </div>
    <small v-if="helper" class="form-text text-muted">{{ $t(helper) }}</small>
    <div v-if="showNewSignal" class="card">
      <div class="card-body p-2">
        <form-input :label="$t('ID')" v-model="signalId" :error="getValidationErrorForNewId(signalId)" />
        <form-input :label="$t('Name')" v-model="signalName" :error="getValidationErrorForNewName(signalName)" />
      </div>
      <div class="card-footer text-right p-2">
        <button type="button" class="btn-special-assignment-action btn-special-assignment-close btn btn-outline-secondary btn-sm" @click="cancelAddSignal">
          Cancel
        </button>
        <button :disabled="!validNew" type="button" class="btn-special-assignment-action btn btn-secondary btn-sm" @click="addSignal">
          Save
        </button>
      </div>
    </div>
    <div v-if="showEditSignal" class="card">
      <div class="card-body p-2">
        <form-input :label="$t('Name')" v-model="signalName" :error="getValidationErrorForNameUpdate(signalName)" />
      </div>
      <div class="card-footer text-right p-2">
        <button type="button" class="btn-special-assignment-action btn-special-assignment-close btn btn-outline-secondary btn-sm" @click="cancelAddSignal">
          Cancel
        </button>
        <button :disabled="!validUpdate" type="button" class="btn-special-assignment-action btn btn-secondary btn-sm" @click="updateSignal">
          Save
        </button>
      </div>
    </div>
    <div v-else-if="showConfirmDelete" class="card mb-3 bg-danger text-white">
      <div v-if="deleteSignalUsage(deleteSignal.id)" class="card-body p-2">
        {{ deleteSignalUsage(deleteSignal.id) }}
      </div>
      <div v-else class="card-body p-2">
        {{ $t('Are you sure you want to delete this item?') }}
        ({{ deleteSignal.id }}) {{ deleteSignal.name }}
      </div>
      <div class="card-footer text-right p-2">
        <button type="button" class="btn btn-sm btn-light mr-2 p-1 font-xs" @click="showConfirmDelete=false">
          Cancel
        </button>
        <button v-if="!deleteSignalUsage(deleteSignal.id)" type="button" class="btn btn-sm btn-danger p-1 font-xs" @click="confirmDeleteSignal">
          Delete
        </button>
      </div>
    </div>
    <template v-else-if="showListSignals && !showNewSignal && !showEditSignal">
      <table class="table table-sm table-striped" width="100%">
        <thead>
          <tr>
            <td colspan="2" align="right">
              <button type="button" class="btn btn-secondary btn-sm p-1 font-xs" @click="showAddSignal">
                <i class="fa fa-plus" /> Signal
              </button>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="signal in localSignals" :key="`signal-${signal.id}`">
            <td>
              <b-badge variant="secondary">{{ signal.id }}</b-badge>
              {{ signal.name }}
            </td>
            <td align="right">
              <button class="btn-link ml-2" @click="editSignal(signal)"><i class="fa fa-pen" /></button>
              <button class="btn-link ml-2" @click="removeSignal(signal)"><i class="fa fa-trash" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script>
import store from '@/store';
import Multiselect from 'vue-multiselect';
import {get,uniqBy} from 'lodash';

export default {
  components: { Multiselect },
  props: {
    value: null,
    name: String,
    placeholder: String,
    helper: String,
    trackBy: {
      type: String,
      default: 'id',
    },
    label: {
      type: String,
      default: 'name',
    },
    api: {
      type: String,
      default: 'signals',
    },
    multiple: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    localSignals() {
      return store.getters.rootElements
        .filter(element => element.$type === 'bpmn:Signal');
    },
    validNew() {
      return this.getValidationErrorForNewId(this.signalId) === ''
        && this.getValidationErrorForNewName(this.signalName) === '';
    },
    validUpdate() {
      return this.getValidationErrorForNameUpdate(this.signalName) === '';
    },
  },
  data() {
    return {
      options: [],
      selectedOption: null,
      pmql: 'id!=' + window.ProcessMaker.modeler.process.id,
      showListSignals: false,
      showNewSignal: false,
      showEditSignal: false,
      showConfirmDelete: false,
      deleteSignal: null,
      signalId: '',
      signalName: '',
    };
  },
  methods: {
    deleteSignalUsage(id) {
      const usage = this.signalUsage(id);
      const labels = [];
      usage.forEach(element => labels.push(element.name || element.id));
      return labels.length ? (this.$t('This signal cannot be removed, it is used by') + ': ' + labels.join(', ')) : '';
    },
    signalUsage(signalId) {
      const usage = [];
      store.getters.rootElements.forEach(node => {
        if (node.$type === 'bpmn:Process') {
          node.flowElements.forEach(element => {
            if (element.eventDefinitions) {
              element.eventDefinitions.forEach(event => {
                if (event.$type === 'bpmn:SignalEventDefinition'
                  && event.signalRef && event.signalRef.id === signalId) {
                  usage.push(element);
                }
              });
            }
          });
        }
      });
      return usage;
    },
    getValidationErrorForNewId(id) {
      if (!id) {
        return this.$t('Signal ID is required');
      }
      const exists = store.getters.rootElements.find((element) => {
        return element.id === id;
      });
      if (exists) {
        return this.$t('Signal ID is duplicated');
      }
      const validId = id.match(/^[_A-Za-z][-._A-Za-z0-9]*$/);
      if (!validId) {
        return this.$t('Signal ID is not a valid xsd:ID');
      }
      return '';
    },
    getValidationErrorForNewName(name) {
      if (!name) {
        return this.$t('Signal Name is required');
      }
      const exists = store.getters.rootElements.find((element) => {
        return element.$type === 'bpmn:Signal' && element.name === name;
      });
      if (exists) {
        return this.$t('Signal Name is duplicated');
      }
      return '';
    },
    getValidationErrorForNameUpdate(name) {
      if (!name) {
        return this.$t('Signal Name is required');
      }
      const exists = store.getters.rootElements.find((element) => {
        return element.$type === 'bpmn:Signal' && element.name === name && element.id !== this.signalId;
      });
      if (exists) {
        return this.$t('Signal Name is duplicated');
      }
      return '';
    },
    confirmDeleteSignal() {
      this.showConfirmDelete = false;
      const index = store.getters.rootElements.findIndex(element => element.id === this.deleteSignal.id);
      if (index > -1) {
        store.getters.rootElements.splice(index, 1);
      }
    },
    removeSignal(signal) {
      this.showConfirmDelete = true;
      this.deleteSignal = signal;
    },
    toggleConfigSignal() {
      this.showListSignals = !this.showListSignals;
    },
    editSignal(signal) {
      this.signalId = signal.id;
      this.signalName = signal.name;
      this.showEditSignal = true;
    },
    getSignalById(id) {
      return store.getters.rootElements.find(element => element.id === id);
    },
    change(value) {
      if (!value) {
        this.$emit('input', '');
        this.refreshVueMultiselectValue();
        return;
      }
      let signal = this.getSignalById(value.id);
      if (!signal) {
        signal = window.ProcessMaker.$modeler.moddle.create('bpmn:Signal', {
          id: value.id,
          name: value.name,
        });
        store.getters.rootElements.push(signal);
      }
      this.$emit('input', get(value, this.trackBy));
      this.refreshVueMultiselectValue();
    },
    // the vue-multiselect value does not refresh the form transientData
    // when selecting the initial value of the control.
    refreshVueMultiselectValue() {
      this.$nextTick(() => {
        let form = this;
        while (form && form.$options._componentTag !== 'vue-form-renderer') {
          form = form.$parent;
        }
        if (form) {
          form.$emit('update', form.transientData);
        }
      });
    },
    showAddSignal() {
      this.showNewSignal = true;
      this.signalId = '';
      this.signalName = '';
    },
    cancelAddSignal() {
      this.showNewSignal = false;
      this.showEditSignal = false;
    },
    updateSignal() {
      this.getSignalById(this.signalId).name = this.signalName;
      this.showEditSignal = false;
    },
    addSignal() {
      const signal = window.ProcessMaker.$modeler.moddle.create('bpmn:Signal', {
        id: this.signalId,
        name: this.signalName,
      });
      store.getters.rootElements.push(signal);
      this.showNewSignal = false;
    },
    updateOptions(globalSignals) {
      this.options = uniqBy([...this.localSignals, ...globalSignals], 'id');
    },
    loadOptions(filter) {
      const pmql = this.pmql;
      window.window.ProcessMaker.apiClient
        .get(this.api, { params: { filter, pmql } })
        .then(response => {
          this.updateOptions(response.data.data || []);
        });
    },
    loadSelected(value) {
      const signal = store.getters.rootElements.find(element => element.id === value);
      if (signal) {
        this.selectedOption = {
          id: signal.id,
          name: signal.name,
        };
      } else {
        this.$emit('input', '');
        this.refreshVueMultiselectValue();
      }
    },
    loadOptionsDebounced() {},
  },
  watch: {
    value: {
      immediate: true,
      handler(value) {
        this.selectedOption = this.options.find(option => get(option, this.trackBy) == value);
          
        if (value && !this.selectedOption) {
          this.loadSelected(value);
        }
      },
    },
  },
};
</script>

<style scoped>
  .font-xs {
    font-size: 0.75rem;
  }
  .btn-link {
    border-style: none !important;
    background: transparent;
    padding: 0px
  }
</style>
