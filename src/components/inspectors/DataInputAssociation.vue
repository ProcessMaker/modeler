<template>
  <div class="data-input-association">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center">
        <i class="fa fa-database text-primary mr-2" />
        <h6 class="mb-0">{{ $t('Data Inputs') }}</h6>
        <span v-if="dataInputs.length > 0" class="badge badge-secondary ml-2">{{ dataInputs.length }}</span>
      </div>
      <button 
        type="button" 
        class="btn btn-sm btn-outline-primary"
        @click="showAddDataInput"
        data-cy="add-data-input"
      >
        <i class="fa fa-plus" /> {{ $t('Add Data Input') }}
      </button>
    </div>
    
    <div v-if="dataInputs.length === 0" class="text-muted text-center py-3">
      {{ $t('No data inputs configured') }}
    </div>
    
    <!-- Add/Edit Data Input Modal -->
    <div v-if="showNewDataInput || showEditDataInput" class="card">
      <div class="card-body p-2">
        <form-input 
          :label="$t('Data Input Name')" 
          v-model="dataInputName" 
          :error="getValidationErrorForName(dataInputName)" 
          data-cy="data-input-add-name" 
        />
        <form-input 
          :label="$t('Data Input ID')" 
          v-model="dataInputId" 
          :error="getValidationErrorForId(dataInputId)" 
          data-cy="data-input-add-id" 
        />
        <div class="form-group">
          <label>{{ $t('Assignment Expression') }}</label>
          <div class="input-group">
            <div class="input-group-prepend">
              <span class="input-group-text">
                <i class="fa fa-code" />
              </span>
            </div>
            <textarea 
              v-model="dataInputExpression"
              class="form-control form-control-sm"
              rows="2"
              :placeholder="assignmentPlaceholder"
            />
          </div>
          <small class="form-text text-muted">
            <i class="fa fa-info-circle mr-1" />
            {{ $t('Use FEEL expressions to map data to this input') }}
          </small>
        </div>
      </div>
      <div class="card-footer text-right p-2">
        <button type="button" class="btn-special-assignment-action btn-special-assignment-close btn btn-outline-secondary btn-sm" @click="cancelAddDataInput" data-cy="data-input-cancel">
          {{ $t('Cancel') }}
        </button>
        <button :disabled="!validDataInput" type="button" class="btn-special-assignment-action btn btn-secondary btn-sm" @click="saveDataInput" data-cy="data-input-save">
          {{ $t('Save') }}
        </button>
      </div>
    </div>
    
    <!-- Delete Confirmation Modal -->
    <div v-else-if="showConfirmDelete" class="card mb-3 bg-danger text-white">
      <div class="card-body p-2">
        {{ $t('Are you sure you want to delete this data input?') }}
        <br>
        <strong>{{ deleteDataInput.id }}</strong> - {{ deleteDataInput.name }}
      </div>
      <div class="card-footer text-right p-2">
        <button type="button" class="btn btn-sm btn-light mr-2 p-1 font-xs" @click="showConfirmDelete=false" data-cy="data-input-cancel">
          {{ $t('Cancel') }}
        </button>
        <button type="button" class="btn btn-sm btn-danger p-1 font-xs" @click="confirmDeleteDataInput" data-cy="data-input-delete">
          {{ $t('Delete') }}
        </button>
      </div>
    </div>
    
    <!-- Data Inputs List -->
    <div v-else-if="dataInputs.length > 0" class="data-inputs-list">
      <div 
        v-for="(dataInput, index) in dataInputs" 
        :key="dataInput.id || index"
        class="data-input-item mb-3 p-3 border rounded shadow-sm"
        :class="{ 'border-danger': getInputValidationErrors(dataInput).length > 0 }"
      >
        <div class="d-flex justify-content-between align-items-start mb-3">
          <div class="d-flex align-items-center">
            <i class="fa fa-cog text-muted mr-2" />
            <h6 class="mb-0">{{ dataInput.name || $t('Data Input') }}</h6>
            <span v-if="dataInput.id" class="badge badge-light ml-2 font-monospace">{{ dataInput.id }}</span>
          </div>
          <div class="btn-group" role="group">
            <button 
              type="button" 
              class="btn btn-sm btn-outline-secondary"
              @click="editDataInput(dataInput)"
              data-cy="edit-data-input"
              :title="$t('Edit this data input')"
            >
              <i class="fa fa-pen" />
            </button>
            <button 
              type="button" 
              class="btn btn-sm btn-outline-danger"
              @click="removeDataInput(dataInput)"
              data-cy="remove-data-input"
              :title="$t('Remove this data input')"
            >
              <i class="fa fa-trash" />
            </button>
          </div>
        </div>
        
        <div v-if="dataInput.assignmentExpression" class="mt-2">
          <label class="text-muted small">{{ $t('Assignment Expression') }}:</label>
          <div class="bg-light p-2 rounded">
            <code class="text-dark">{{ dataInput.assignmentExpression }}</code>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'DataInputAssociation',
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      dataInputs: [],
      showNewDataInput: false,
      showEditDataInput: false,
      showConfirmDelete: false,
      deleteDataInput: null,
      dataInputName: '',
      dataInputId: '',
      dataInputExpression: '',
    };
  },
  computed: {
    validDataInput() {
      return this.getValidationErrorForName(this.dataInputName) === '' &&
             this.getValidationErrorForId(this.dataInputId) === '';
    },
    assignmentPlaceholder() {
      return this.$t('Enter assignment expression (e.g., user.firstname + " " + user.lastname)');
    },
  },
  watch: {
    value: {
      handler(newValue) {
        this.dataInputs = newValue ? [...newValue] : [];
      },
      immediate: true,
    },
  },
  methods: {
    // Validation methods
    validateDataInput(input) {
      const errors = [];
      if (!input.name || !input.name.trim()) {
        errors.push(this.$t('Data input name is required'));
      }
      if (!input.id || !input.id.trim()) {
        errors.push(this.$t('Data input ID is required'));
      }
      if (input.id && !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(input.id)) {
        errors.push(this.$t('Data input ID must start with a letter or underscore and contain only letters, numbers, and underscores'));
      }
      return errors;
    },
    
    getValidationErrorForName(name) {
      if (!name || !name.trim()) {
        return this.$t('Data input name is required');
      }
      const exists = this.dataInputs.find(input => 
        input.name === name && input.id !== this.dataInputId,
      );
      if (exists) {
        return this.$t('Data input name is duplicated');
      }
      return '';
    },
    
    getValidationErrorForId(id) {
      if (!id || !id.trim()) {
        return this.$t('Data input ID is required');
      }
      const exists = this.dataInputs.find(input => 
        input.id === id && input.id !== this.dataInputId,
      );
      if (exists) {
        return this.$t('Data input ID is duplicated');
      }
      const validId = id.match(/^[_A-Za-z][-._A-Za-z0-9]*$/);
      if (!validId) {
        return this.$t('Data input ID is not a valid xsd:ID');
      }
      return '';
    },
    
    getInputValidationErrors(input) {
      return this.validateDataInput(input);
    },
    
    // UI State Management
    showAddDataInput() {
      this.showNewDataInput = true;
      this.dataInputName = '';
      this.dataInputId = `din_${Date.now()}`;
      this.dataInputExpression = '';
    },
    
    editDataInput(dataInput) {
      this.dataInputName = dataInput.name;
      this.dataInputId = dataInput.id;
      this.dataInputExpression = dataInput.assignmentExpression || '';
      this.showEditDataInput = true;
    },
    
    removeDataInput(dataInput) {
      this.showConfirmDelete = true;
      this.deleteDataInput = dataInput;
    },
    
    confirmDeleteDataInput() {
      this.showConfirmDelete = false;
      const index = this.dataInputs.findIndex(input => input.id === this.deleteDataInput.id);
      if (index > -1) {
        this.dataInputs.splice(index, 1);
        this.emitChange();
      }
    },
    
    cancelAddDataInput() {
      this.showNewDataInput = false;
      this.showEditDataInput = false;
      this.dataInputName = '';
      this.dataInputId = '';
      this.dataInputExpression = '';
    },
    
    saveDataInput() {
      const dataInput = {
        id: this.dataInputId,
        name: this.dataInputName,
        assignmentExpression: this.dataInputExpression,
      };
      
      if (this.showEditDataInput) {
        const index = this.dataInputs.findIndex(input => input.id === this.dataInputId);
        if (index > -1) {
          this.dataInputs.splice(index, 1, dataInput);
        }
      } else {
        this.dataInputs.push(dataInput);
      }
      
      this.emitChange();
      this.cancelAddDataInput();
    },
    
    
    emitChange() {
      this.$emit('input', [...this.dataInputs]);
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
  padding: 0px;
}

.btn-special-assignment-action {
  margin-left: 0.25rem;
}

.btn-special-assignment-close {
  margin-right: 0.25rem;
}

.data-input-item {
  transition: all 0.2s ease;
}

.data-input-item:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.data-input-item.border-danger {
  border-color: #dc3545 !important;
  box-shadow: 0 0 0 0.2rem rgba(220, 53, 69, 0.25);
}
</style>