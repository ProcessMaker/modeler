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
        <button type="button" class="btn btn-secondary btn-sm" @click="toggleConfigMessage" data-cy="events-list" :title="$t('Configure')">
          <i class="fa fa-ellipsis-h" />
        </button>
      </div>
    </div>
    <div v-if="invalid" class="invalid-feedback d-block"><div>
      {{ $t('Message reference is required') }}
    </div></div>
    <small v-if="helper" class="form-text text-muted">{{ $t(helper) }}</small>
    <div v-if="showNewMessage" class="card">
      <div class="card-body p-2">
        <form-input :label="$t('ID')" v-model="messageId" :error="getValidationErrorForNewId(messageId)" data-cy="events-add-id" />
        <form-input :label="$t('Name')" v-model="messageName" :error="getValidationErrorForNewName(messageName)" data-cy="events-add-name" />
      </div>
      <div class="card-footer text-right p-2">
        <button type="button" class="btn-special-assignment-action btn-special-assignment-close btn btn-outline-secondary btn-sm" @click="cancelAddMessage" data-cy="events-cancel">
          {{ $t('Cancel') }}
        </button>
        <button :disabled="!validNew" type="button" class="btn-special-assignment-action btn btn-secondary btn-sm" @click="addMessage" data-cy="events-save">
          {{ $t('Save') }}
        </button>
      </div>
    </div>
    <div v-if="showEditMessage" class="card">
      <div class="card-body p-2">
        <form-input :label="$t('Name')" v-model="messageName" :error="getValidationErrorForNameUpdate(messageName)" data-cy="events-edit-name" />
      </div>
      <div class="card-footer text-right p-2">
        <button type="button" class="btn-special-assignment-action btn-special-assignment-close btn btn-outline-secondary btn-sm" @click="cancelAddMessage" data-cy="events-cancel">
          {{ $t('Cancel') }}
        </button>
        <button :disabled="!validUpdate" type="button" class="btn-special-assignment-action btn btn-secondary btn-sm" @click="updateMessage" data-cy="events-save">
          {{ $t('Save') }}
        </button>
      </div>
    </div>
    <div v-else-if="showConfirmDelete" class="card mb-3 bg-danger text-white">
      <div v-if="deleteMessageUsage(deleteMessage.id)" class="card-body p-2">
        {{ deleteMessageUsage(deleteMessage.id) }}
      </div>
      <div v-else class="card-body p-2">
        {{ $t('Are you sure you want to delete this item?') }}
        ({{ deleteMessage.id }}) {{ deleteMessage.name }}
      </div>
      <div class="card-footer text-right p-2">
        <button type="button" class="btn btn-sm btn-light mr-2 p-1 font-xs" @click="showConfirmDelete=false" data-cy="events-cancel">
          {{ $t('Cancel') }}
        </button>
        <button v-if="!deleteMessageUsage(deleteMessage.id)" type="button" class="btn btn-sm btn-danger p-1 font-xs" @click="confirmDeleteMessage" data-cy="events-delete">
          {{ $t('Delete') }}
        </button>
      </div>
    </div>
    <template v-else-if="showListMessages && !showNewMessage && !showEditMessage">
      <table class="table table-sm table-striped" width="100%">
        <thead>
          <tr>
            <td colspan="2" align="right">
              <button type="button" class="btn btn-secondary btn-sm p-1 font-xs" @click="showAddMessage" data-cy="events-add">
                <i class="fa fa-plus" /> {{ $t('Message') }}
              </button>
            </td>
          </tr>
        </thead>
        <tbody>
          <tr v-for="message in localMessages" :key="`message-${message.id}`">
            <td>
              <b-badge variant="secondary">{{ message.id }}</b-badge>
              {{ message.name }}
            </td>
            <td align="right">
              <button :aria-label="$t('Edit')" class="btn-link ml-2" @click="editMessage(message)"><i class="fa fa-pen" data-cy="events-edit" /></button>
              <button :aria-label="$t('Remove')" class="btn-link ml-2" @click="removeMessage(message)"><i class="fa fa-trash" data-cy="events-remove" /></button>
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
      default: 'messages',
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
    localMessages() {
      return store.getters.rootElements
        .filter(element => element.$type === 'bpmn:Message');
    },
    validNew() {
      return this.getValidationErrorForNewId(this.messageId) === ''
        && this.getValidationErrorForNewName(this.messageName) === '';
    },
    validUpdate() {
      return this.getValidationErrorForNameUpdate(this.messageName) === '';
    },
  },
  data() {
    return {
      options: [],
      selectedOption: null,
      pmql: 'id!=' + window.ProcessMaker.modeler.process.id,
      showListMessages: false,
      showNewMessage: false,
      showEditMessage: false,
      showConfirmDelete: false,
      deleteMessage: null,
      messageId: '',
      messageName: '',
    };
  },
  methods: {
    deleteMessageUsage(id) {
      const usage = this.messageUsage(id);
      const labels = [];
      usage.forEach(element => labels.push(element.name || element.id));
      return labels.length ? (this.$t('This message cannot be removed, it is used by') + ': ' + labels.join(', ')) : '';
    },
    messageUsage(messageId) {
      const usage = [];
      store.getters.rootElements.forEach(node => {
        if (node.$type === 'bpmn:Process') {
          node.flowElements.forEach(element => {
            if (element.eventDefinitions) {
              element.eventDefinitions.forEach(event => {
                if (event.$type === 'bpmn:MessageEventDefinition'
                  && event.messageRef && event.messageRef.id === messageId) {
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
        return this.$t('Message ID is required');
      }
      const exists = store.getters.rootElements.find((element) => {
        return element.id === id;
      });
      if (exists) {
        return this.$t('Message ID is duplicated');
      }
      const validId = id.match(/^[_A-Za-z][-._A-Za-z0-9]*$/);
      if (!validId) {
        return this.$t('Message ID is not a valid xsd:ID');
      }
      return '';
    },
    getValidationErrorForNewName(name) {
      if (!name) {
        return this.$t('Message Name is required');
      }
      const exists = store.getters.rootElements.find((element) => {
        return element.$type === 'bpmn:Message' && element.name === name;
      });
      if (exists) {
        return this.$t('Message Name is duplicated');
      }
      return '';
    },
    getValidationErrorForNameUpdate(name) {
      if (!name) {
        return this.$t('Message Name is required');
      }
      const exists = store.getters.rootElements.find((element) => {
        return element.$type === 'bpmn:Message' && element.name === name && element.id !== this.messageId;
      });
      if (exists) {
        return this.$t('Message Name is duplicated');
      }
      return '';
    },
    confirmDeleteMessage() {
      this.showConfirmDelete = false;
      const index = store.getters.rootElements.findIndex(element => element.id === this.deleteMessage.id);
      if (index > -1) {
        store.getters.rootElements.splice(index, 1);
      }
    },
    removeMessage(message) {
      this.showConfirmDelete = true;
      this.deleteMessage = message;
    },
    toggleConfigMessage() {
      this.showListMessages = !this.showListMessages;
    },
    editMessage(message) {
      this.messageId = message.id;
      this.messageName = message.name;
      this.showEditMessage = true;
    },
    getMessageById(id) {
      return store.getters.rootElements.find(element => element.id === id);
    },
    change(value) {
      if (!value) {
        this.$emit('input', '');
        this.refreshVueMultiselectValue();
        return;
      }
      let message = this.getMessageById(value.id);
      if (!message) {
        message = window.ProcessMaker.$modeler.moddle.create('bpmn:Message', {
          id: value.id,
          name: value.name,
        });
        store.getters.rootElements.push(message);
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
    showAddMessage() {
      this.showNewMessage = true;
      this.messageId = '';
      this.messageName = '';
    },
    cancelAddMessage() {
      this.showNewMessage = false;
      this.showEditMessage = false;
    },
    updateMessage() {
      this.getMessageById(this.messageId).name = this.messageName;
      this.showEditMessage = false;
    },
    addMessage() {
      const message = window.ProcessMaker.$modeler.moddle.create('bpmn:Message', {
        id: this.messageId,
        name: this.messageName,
      });
      store.getters.rootElements.push(message);
      this.showNewMessage = false;
    },
    updateOptions(globalMessages) {
      this.options = uniqBy([...this.localMessages, ...globalMessages], 'id');
    },
    loadOptions() {
      this.updateOptions([]);
    },
    loadSelected(value) {
      const message = store.getters.rootElements.find(element => element.id === value);
      if (message) {
        this.selectedOption = {
          id: message.id,
          name: message.name,
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

<style>
  .invalid .multiselect__tags {
    border-color:#dc3545!important
  }
</style>
