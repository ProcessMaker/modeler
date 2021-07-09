<template>
  <div>
    <label class="typo__label">{{ label }}</label>
    <div class="d-flex" :class="{invalid}">
      <multiselect
        :value="selectedOption"
        @input="change"
        :placeholder="$t(placeholder)"
        :options="options"
        :multiple="multiple"
        :track-by="trackBy"
        :show-labels="false"
        :searchable="true"
        :internal-search="false"
        label="name"
        @search-change="loadOptions"
        @open="loadOptions()"
        :data-test="`${name}:select`"
        :disabled="!can('view-signals')"
      >
        <template slot="noResult">
          <slot name="noResult">{{ $t('Not found') }}</slot>
        </template>
        <template slot="noOptions">
          <slot name="noOptions">{{ $t('No Data Available') }}</slot>
        </template>
      </multiselect>
      <div class="btn-group ml-1" role="group" v-if="canEdit">
        <button type="button" class="btn btn-secondary btn-sm" @click="toggleConfigSignal" data-cy="events-list" :title="$t('Configure')">
          <i class="fa fa-ellipsis-h" />
        </button>
      </div>
    </div>
    <div v-if="!can('view-signals')" class="invalid-feedback d-block"><div>
      {{ $t('You do not have permission to view signals') }}
    </div></div>
    <div v-if="invalid" class="invalid-feedback d-block"><div>
      {{ $t('Signal reference is required') }}
    </div></div>
    <small v-if="helper" class="form-text text-muted">{{ $t(helper) }}</small>
    <div v-if="showNewSignal" class="card">
      <div class="card-body p-2">
        <form-input :label="$t('ID')" v-model="signalId" :error="getValidationErrorForNewId(signalId)"  data-cy="events-add-id" />
        <form-input :label="$t('Name')" v-model="signalName" :error="getValidationErrorForNewName(signalName)" data-cy="events-add-name" />
      </div>
      <div class="card-footer text-right p-2">
        <button type="button" class="btn-special-assignment-action btn-special-assignment-close btn btn-outline-secondary btn-sm" @click="cancelAddSignal" data-cy="events-cancel">
          {{ $t('Cancel') }}
        </button>
        <button :disabled="!validNew" type="button" class="btn-special-assignment-action btn btn-secondary btn-sm" @click="addSignal" data-cy="events-save">
          {{ $t('Save') }}
        </button>
      </div>
    </div>
    <div v-if="showEditSignal" class="card">
      <div class="card-body p-2">
        <form-input :label="$t('Name')" v-model="signalName" :error="getValidationErrorForNameUpdate(signalName)" data-cy="events-edit-name" />
      </div>
      <div class="card-footer text-right p-2">
        <button type="button" class="btn-special-assignment-action btn-special-assignment-close btn btn-outline-secondary btn-sm" @click="cancelAddSignal" data-cy="events-cancel">
          {{ $t('Cancel') }}
        </button>
        <button :disabled="!validUpdate" type="button" class="btn-special-assignment-action btn btn-secondary btn-sm" @click="updateSignal" data-cy="events-save">
          {{ $t('Save') }}
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
        <button type="button" class="btn btn-sm btn-light mr-2 p-1 font-xs" @click="showConfirmDelete=false" data-cy="events-cancel">
          {{ $t('Cancel') }}
        </button>
        <button v-if="!deleteSignalUsage(deleteSignal.id)" type="button" class="btn btn-sm btn-danger p-1 font-xs" @click="confirmDeleteSignal" data-cy="events-delete">
          {{ $t('Save') }}
        </button>
      </div>
    </div>
    <template v-else-if="showListSignals && !showNewSignal && !showEditSignal">
      <table class="table table-sm table-striped" width="100%">
        <thead>
          <tr>
            <td colspan="2" align="right">
              <button type="button" class="btn btn-secondary btn-sm p-1 font-xs" @click="showAddSignal" data-cy="events-add">
                <i class="fa fa-plus" /> {{ $t('Signal') }}
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
              <button :aria-label="$t('Edit')" class="btn-link ml-2" @click="editSignal(signal)" v-if="can('edit-signals')"><i class="fa fa-pen" data-cy="events-edit" /></button>
              <button :aria-label="$t('Remove')" class="btn-link ml-2" @click="removeSignal(signal)" v-if="can('delete-signals')"><i class="fa fa-trash" data-cy="events-remove" /></button>
            </td>
          </tr>
        </tbody>
      </table>
    </template>
  </div>
</template>

<script>
import store from '@/store';
import { get,uniqBy } from 'lodash';

export default {
  props: {
    value: null,
    name: String,
    placeholder: {
      type: String,
      default: 'Select option',
    },
    helper: String,
    canEdit: {
      type: Boolean,
      default: true,
    },
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
    invalid() {
      return !this.value;
    },
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
      if (!this.can('view-signals')) {
        window.ProcessMaker.alert(this.$t('You do not have permission to view signals'), 'danger');
        return;
      }
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
      if (!this.can('create-signals')) {
        window.ProcessMaker.alert(this.$t('You do not have permission to add new signals'), 'danger');
        return;
      }
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
      this.options = uniqBy([ ...globalSignals, ...this.localSignals], 'id');
    },
    loadOptions(filter) {
      if (!this.can('view-signals')) { return; }

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
    can(permission) {
      return get(window, `ProcessMaker.modeler.signalPermissions.${permission}`, false);
    },
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

<style>
  .invalid .multiselect__tags {
    border-color:#dc3545!important
  }
</style>
