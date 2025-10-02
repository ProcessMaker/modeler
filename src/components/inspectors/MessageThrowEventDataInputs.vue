<template>
  <div class="message-throw-event-data-inputs">
    <!-- Header Section -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div class="d-flex align-items-center">
        <h6 class="mb-0">{{ $t('Data Inputs & Assignments') }}</h6>
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
          :placeholder="$t('e.g., user, account, order')"
          data-cy="data-input-add-name" 
        />
        <form-input 
          :label="$t('Data Input ID')" 
          v-model="dataInputId" 
          :error="getValidationErrorForId(dataInputId)" 
          :placeholder="$t('e.g., din_user, din_account')"
          data-cy="data-input-add-id" 
        />
        
        <div class="form-group">
          <label class="font-weight-bold">{{ $t('Assignment Expressions') }}</label>
          <small class="form-text text-muted mb-3">
            <i class="fa fa-info-circle mr-1" />
            {{ $t('Define how data from the process will be mapped to this input using FEEL expressions') }}
          </small>
          
          <!-- Assignment List -->
          <div v-if="assignmentExpressions.length > 0" class="mb-3">
            <div 
              v-for="(assignment, index) in assignmentExpressions" 
              :key="index"
              class="assignment-item p-3 border rounded mb-3 bg-white shadow-sm"
            >
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h6 class="mb-0">{{ $t('Assignment') }} {{ index + 1 }}</h6>
              <button 
                type="button"
                class="btn btn-sm btn-outline-danger"
                @click="removeAssignment(index)"
                :title="$t('Remove assignment')"
              >
                <i class="fa fa-trash" />
              </button>
            </div>
            
            <div class="mb-3">
              <label class="small font-weight-bold text-dark mb-2 d-flex align-items-center">
                <i class="fa fa-code mr-2 text-primary" />
                {{ $t('From') }}
              </label>
              <textarea 
                v-model="assignment.from"
                class="form-control"
                rows="3"
                :placeholder="$t('e.g., {$data[\'user\'][\'firstname\']} {$data[\'user\'][\'lastname\']}')"
              />
            </div>
            
            <div>
              <label class="small font-weight-bold text-dark mb-2 d-flex align-items-center">
                <i class="fa fa-arrow-right mr-2 text-success" />
                {{ $t('To') }}
              </label>
              <textarea 
                v-model="assignment.to"
                class="form-control"
                rows="3"
                :placeholder="$t('e.g., user.firstname')"
              />
            </div>
            </div>
          </div>
          
          <!-- Add Assignment Button -->
          <div class="text-center">
            <button 
              type="button"
              class="btn btn-sm btn-outline-primary"
              @click="addAssignment"
              data-cy="add-assignment"
            >
              <i class="fa fa-plus mr-1" />
              {{ $t('Add Assignment') }}
            </button>
          </div>
        </div>
      </div>
      <div class="card-footer text-right p-2">
        <button 
          type="button" 
          class="btn-special-assignment-action btn-special-assignment-close btn btn-outline-secondary btn-sm" 
          @click="cancelAddDataInput"
          data-cy="data-input-cancel"
        >
          {{ $t('Cancel') }}
        </button>
        <button 
          :disabled="!validDataInput" 
          type="button" 
          class="btn-special-assignment-action btn btn-secondary btn-sm" 
          @click="saveDataInput"
          data-cy="data-input-save"
        >
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
        <button 
          type="button" 
          class="btn btn-sm btn-light mr-2 p-1 font-xs" 
          @click="showConfirmDelete=false"
          data-cy="data-input-cancel"
        >
          {{ $t('Cancel') }}
        </button>
        <button 
          type="button" 
          class="btn btn-sm btn-danger p-1 font-xs" 
          @click="confirmDeleteDataInput"
          data-cy="data-input-delete"
        >
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
        <div class="d-flex align-items-center mb-2">
          <i class="fa fa-cog text-muted mr-2" />
          <h6 class="mb-0 mr-2">{{ dataInput.name || $t('Data Input') }}</h6>
          <span v-if="dataInput.id" class="badge badge-light font-monospace">{{ dataInput.id }}</span>
        </div>
        
        <div class="d-flex justify-content-end">
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
        
        <div v-if="dataInput.assignments && dataInput.assignments.length > 0" class="mt-2">
          <label class="text-muted small">{{ $t('Assignment Expressions') }}:</label>
          <div v-for="(assignment, index) in dataInput.assignments" :key="index" class="bg-light p-2 rounded mb-2">
            <div class="row">
              <div class="col-md-6">
                <small class="text-muted">{{ $t('From') }}:</small>
                <code class="text-dark d-block">{{ assignment.from }}</code>
              </div>
              <div class="col-md-6">
                <small class="text-muted">{{ $t('To') }}:</small>
                <code class="text-dark d-block">{{ assignment.to }}</code>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Validation Errors -->
        <div v-if="getInputValidationErrors(dataInput).length > 0" class="mt-2">
          <div 
            v-for="error in getInputValidationErrors(dataInput)" 
            :key="error"
            class="alert alert-danger alert-sm py-1 px-2 mb-1"
          >
            <i class="fa fa-exclamation-circle mr-1" />
            {{ error }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageThrowEventDataInputs',
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
      originalDataInputId: '', // Store original ID for editing
      assignmentExpressions: [],
    };
  },
  computed: {
    validDataInput() {
      return this.getValidationErrorForName(this.dataInputName) === '' &&
             this.getValidationErrorForId(this.dataInputId) === '';
    },
  },
  watch: {
    value: {
      handler(newValue) {
        // compatibility review with previous version
        if (Array.isArray(newValue)) {
          this.dataInputs = newValue.map(item => ({
            id: item.id || '',
            name: item.name || '',
            assignments: Array.isArray(item.assignments) ? [...item.assignments] : []
          }));
        } else {
          this.dataInputs = [];
        }
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
        input.name === name && input.id !== this.dataInputId
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
        input.id === id && input.id !== this.dataInputId
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
    
    // Assignment management
    addAssignment() {
      this.assignmentExpressions.push({
        from: '',
        to: '',
      });
    },
    
    removeAssignment(index) {
      this.assignmentExpressions.splice(index, 1);
    },
    
    // UI State Management
    showAddDataInput() {
      this.showNewDataInput = true;
      this.dataInputName = '';
      this.dataInputId = `din_${Date.now()}`;
      this.assignmentExpressions = []; // Start with no assignments
    },
    
    editDataInput(dataInput) {
      this.dataInputName = dataInput.name;
      this.dataInputId = dataInput.id;
      this.originalDataInputId = dataInput.id; // Store original ID
      this.assignmentExpressions = dataInput.assignments ? [...dataInput.assignments] : [];
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
      this.originalDataInputId = '';
      this.assignmentExpressions = [];
    },
    
    saveDataInput() {
      // Filter out empty assignments
      const validAssignments = this.assignmentExpressions.filter(assignment => 
        assignment.from && assignment.from.trim() !== '' && 
        assignment.to && assignment.to.trim() !== ''
      );
      
      const dataInput = {
        id: this.dataInputId,
        name: this.dataInputName,
        assignments: validAssignments,
      };
      
      if (this.showEditDataInput) {
        const index = this.dataInputs.findIndex(input => input.id === this.originalDataInputId);
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

/* Assignment Items Styling */
.assignment-item {
  transition: all 0.3s ease;
  border: 1px solid #e9ecef;
  border-left: 4px solid #007bff;
}

.assignment-item:hover {
  box-shadow: 0 4px 12px rgba(0,123,255,0.15);
  border-color: #007bff;
  transform: translateY(-1px);
}

.assignment-item .form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

.assignment-item label {
  font-size: 0.8125rem;
  letter-spacing: 0.025em;
  line-height: 1.2;
}

.assignment-item label i {
  font-size: 0.75rem;
  width: 14px;
  text-align: center;
}

.assignment-item .btn {
  transition: all 0.2s ease;
}

.assignment-item .btn:hover {
  transform: translateY(-1px);
}

/* Form Group Enhancements */
.form-group label {
  font-size: 0.875rem;
  color: #495057;
}

.form-text {
  font-size: 0.8125rem;
  line-height: 1.4;
}

/* Button Enhancements */
.btn {
  font-weight: 500;
  transition: all 0.2s ease;
}

.btn:hover {
  transform: translateY(-1px);
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .assignment-item .row > div {
    margin-bottom: 1rem;
  }
  
  .assignment-item .col-md-2 {
    margin-top: 0.5rem;
  }
}
</style>
