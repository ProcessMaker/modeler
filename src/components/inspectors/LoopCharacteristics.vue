<template>
  <div>
    <b-form-group :label="$t('Loop Mode')">
      <b-form-select id="" v-model="loopType" @change="changeLoopType">
        <option v-for="option in loopOptions" :key="option.text" :value="option.value">{{ $t(option.text) }}</option>
      </b-form-select>
    </b-form-group>
    <template v-if="loopType === 'loop'">
      <b-form-group :label="$t('Maximum Iterations')">
        <b-form-input v-model="loopMaximum" type="number" min="0" step="1" @input="changeLoopMaximum" data-cy="loopMaximum" />
        <small class="form-text text-muted">{{ $t("Leave empty to continue until exit condition is satisfied") }}</small>
      </b-form-group>

      <b-form-group :label="$t('Exit Condition')">
        <textarea class="form-control special-assignment-input" ref="specialAssignmentsInput"  v-model="loopCondition" :aria-label="$t('FEEL Syntax')" placeholder="FEEL Syntax" @input="changeLoopCondition" data-cy="loopCondition"/>
        <small class="form-text text-muted">{{ $t("When FEEL expression evaluates to true then exit loop") }}</small>
      </b-form-group>
    </template>
    <template
      v-if="
        loopType === 'parallel_mi' ||
          loopType === 'sequential_mi'
      "
    >
      <b-form-group
        v-if="multiType === 'inputData'"
        id="group-inputData"
        :label="$t('Request Variable Array')"
        label-for="inputData"
        :description="
          $t(
            'Non-array data will result in an error.'
          )
        "
      >
        <b-form-input
          id="inputData"
          v-model.lazy="inputData"
          type="text"
          :placeholder="$t('Request Variable Name')"
          @input="changeInputData" 
        />
      </b-form-group>
      <b-form-group
        v-if="loopType === 'sequential_mi'"
        id="group-exit-condition"
        :label="$t('Exit Condition')"
        label-for="exit-condition"
        :description="$t('When the FEEL Expression evaluates to true then exit the loop')"
      >
        <b-form-textarea
          id="exit-condition"
          v-model.lazy="completionCondition"
          :placeholder="$t('FEEL Syntax')"
          @input="changeCompletionCondition"
        />
      </b-form-group>
      <b-form-group
        id="group-outputData"
        :label="$t('Output Data Variable')"
        label-for="outputData"
        :description="
          $t(
            'Specifies the output request data variable array, which will be produced as a result of the multi-instance.'
          )
        "
      >
        <b-form-input
          id="outputData"
          v-model.lazy="outputData"
          type="text"
          :placeholder="$t('Request Variable Name')"
          @input="changeOutputData"
        />
      </b-form-group>
    </template>
  </div>
</template>

<script>
import { cloneDeep, isEqual } from 'lodash';
export default {
  props: {
    value: {
      type: Object,
      default() {
        return {
          loopCharacteristics: null,
          ioSpecification: null,
        };
      },
    },
  },
  name: 'LoopCharacteristics',
  data() {
    return {
      loopOptions: [
        { text: this.$t('No Loop Mode'), value: 'no_loop' },
        { text: this.$t('Loop'), value: 'loop' },
        { text: this.$t('Multi-Instance (Parallel)'), value: 'parallel_mi' },
        { text: this.$t('Multi-Instance (Sequential)'), value: 'sequential_mi' },
      ],
      showAdvanced: false,
      previous: {
        loopCardinality: '3',
        completionCondition: null,
        inputData: null,
        outputData: null,
        inputDataItem: null,
      },
      local: {
        loopCharacteristics: {
          $type: null,
          isSequential: false,
        },
        loopMaximum: 0,
        loopCondition: null,
      },
      loopType: null,
      multiType: null,
      loopCardinality: null,
      completionCondition: null,
      inputData: null,
      inputDataItem: null,
      outputData: null,
      outputDataItem: null,
      loopMaximum: 0,
      loopCondition: null,
    };
  },
  mounted() {
    this.loadData();
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
  },
  methods: {
    changeLoopMaximum(value) {
      this.setLoopMaximum(value);
      this.saveData();
    },
    changeLoopCondition() {
      this.setLoopCondition(this.loopCondition);
      this.saveData();
    },
    changeLoopType(value) {
      this.setLoopCharacteristics(value);
      this.saveData();
    },
    changeMultiType(value) {
      this.setMultiType(value);
      this.saveData();
    },
    changeLoopCardinality(value) {
      this.setLoopCardinality(value);
      this.saveData();
    },
    changeCompletionCondition(value) {
      this.setCompletionCondition(value);
      this.saveData();
    },
    changeInputData(value) {
      this.setLoopDataInputRef(value);
      this.saveData();
    },
    changeInputDataItem(value) {
      this.setInputDataItem(value);
      this.saveData();
    },
    changeOutputData(value) {
      this.setLoopDataOutputRef(value);
      this.saveData();
    },
    changeOutputDataItem(value) {
      this.setOutputDataItem(value);
      this.saveData();
    },
    loadData() {
      this.$set(this, 'local', cloneDeep(this.value));
      this.loopType = this.getLoopCharacteristics();
      this.multiType = this.getMultiType();
      this.loopCardinality = this.getLoopCardinality();
      this.completionCondition = this.getCompletionCondition();
      this.inputData = this.getLoopDataInputRef();
      this.inputDataItem = this.getInputDataItem();
      this.outputData = this.getLoopDataOutputRef();
      this.outputDataItem = this.getOutputDataItem();
      this.previous.inputData = this.inputData;
      this.previous.outputData = this.outputData;
      this.previous.loopCardinality = this.loopCardinality;
      this.completionCondition = this.completionCondition;
      this.loopMaximum = this.getLoopMaximum();
      this.loopCondition = this.getLoopCondition();
    },
    saveData() {
      if (!isEqual(this.local, this.value)) {
        this.$emit('input', cloneDeep(this.local));
      }
    },
    getOutputDataItem() {
      if (!this.local.loopCharacteristics || !this.local.loopCharacteristics.outputDataItem) return null;
      return this.local.loopCharacteristics.outputDataItem.name;
    },
    setOutputDataItem(value) {
      this.local.loopCharacteristics.outputDataItem = {
        $type: 'bpmn:DataInput',
        isCollection: true,
        name: value,
      };
      
    },
    getLoopDataOutputRef() {
      if (!this.local.loopCharacteristics || !this.local.loopCharacteristics.loopDataOutputRef) return null;
      return this.local.ioSpecification.dataOutputs[0].name;
    },
    setLoopDataOutputRef(value) {
      if (!this.local.ioSpecification) {
        this.initIoSpecification();
      }
      const dataDef = this.local.ioSpecification.dataOutputs[0] || {
        $type: 'bpmn:DataOutput',
        id: `${this.local.id}_output_1`,
        isCollection: true,
        name: value,
      };
      dataDef.name = value;
      this.local.ioSpecification.dataOutputs = [
        dataDef,
      ];
      this.local.ioSpecification.outputSets[0].dataOutputRefs = [
        dataDef.id,
      ];
      this.local.loopCharacteristics.loopDataOutputRef = dataDef.id;
    },
    getInputDataItem() {
      if (!this.local.loopCharacteristics || !this.local.loopCharacteristics.inputDataItem) return null;
      return this.local.loopCharacteristics.inputDataItem.name;
    },
    setInputDataItem(value) {
      this.local.loopCharacteristics.inputDataItem = {
        $type: 'bpmn:DataInput',
        isCollection: true,
        name: value,
      };
    },
    getLoopDataInputRef() {
      if (!this.local.loopCharacteristics || !this.local.loopCharacteristics.loopDataInputRef) return null;
      return this.local.ioSpecification.dataInputs[0].name;
    },
    setLoopDataInputRef(value) {
      const dataDef = {
        $type: 'bpmn:DataInput',
        id: `${this.local.id}_input_1`,
        isCollection: true,
        name: value,
      };
      if (!this.local.ioSpecification) {
        this.initIoSpecification();
      }
      this.local.ioSpecification.dataInputs = [
        dataDef,
      ];
      this.local.ioSpecification.inputSets[0].dataInputRefs = [
        dataDef.id,
      ];
      this.local.loopCharacteristics.loopDataInputRef = dataDef.id;
    },
    initIoSpecification() {
      this.local.ioSpecification = {
        $type: 'bpmn:InputOutputSpecification',
        dataInputs: [],
        dataOutputs: [],
        inputSets: [{ $type: 'bpmn:InputSet', dataInputRefs: []}],
        outputSets: [{ $type: 'bpmn:OutputSet', dataOutputRefs: []}],
      };
    },
    getLoopCardinality() {
      if (!this.local.loopCharacteristics || !this.local.loopCharacteristics.loopCardinality) return null;
      return this.local.loopCharacteristics.loopCardinality.body;
    },
    getCompletionCondition() {
      if (!this.local.loopCharacteristics || !this.local.loopCharacteristics.completionCondition) return null;
      return this.local.loopCharacteristics.completionCondition.body;
    },
    setLoopCardinality(value) {
      this.local.loopCharacteristics.loopCardinality = {
        $type: 'bpmn:Expression',
        body: value,
      };
    },
    setCompletionCondition(value) {
      this.local.loopCharacteristics.completionCondition = {
        $type: 'bpmn:Expression',
        body: value,
      };
    },
    getMultiType() {
      if (!this.local.loopCharacteristics) return null;
      return this.local.loopCharacteristics.loopCardinality !== undefined ? 'loopCardinality' : 'inputData';
    },
    setMultiType(value) {
      if (value === 'loopCardinality') {
        this.local.loopCharacteristics.loopCardinality = {
          $type: 'bpmn:Expression',
          body: this.previous.loopCardinality || '3',
        };
        this.local.loopCharacteristics.completionCondition = {
          $type: 'bpmn:Expression',
          body: this.previous.completionCondition || '',
        };
        this.previous.inputData = this.inputData;
        this.previous.outputData = this.outputData;
        this.previous.inputDataItem = this.inputDataItem;
        delete this.local.loopCharacteristics.loopDataInputRef;
        delete this.local.loopCharacteristics.inputDataItem;
        this.setLoopDataOutputRef(this.previous.outputData || `output_array_${this.local.id}`);
      } else {
        this.previous.loopCardinality = this.loopCardinality;
        this.previous.completionCondition = this.completionCondition;
        this.previous.outputData = this.outputData;
        delete this.local.loopCharacteristics.loopCardinality;
        delete this.local.loopCharacteristics.completionCondition;
        this.local.loopCharacteristics.loopDataInputRef = '';
        this.setLoopDataInputRef(this.previous.inputData || 'source_array');
        this.setLoopDataOutputRef(this.previous.outputData || `output_array_${this.local.id}`);
        this.setInputDataItem(this.previous.inputDataItem || '');
      }
      this.loopCardinality = this.getLoopCardinality();
      this.completionCondition = this.getCompletionCondition();
      this.inputData = this.getLoopDataInputRef();
      this.outputData = this.getLoopDataOutputRef();
    },
    getLoopCharacteristics() {
      if (!this.local.loopCharacteristics) return 'no_loop';
      if (
        this.local.loopCharacteristics.$type ===
          'bpmn:StandardLoopCharacteristics'
      )
        return 'loop';
      if (
        this.local.loopCharacteristics.$type ===
          'bpmn:MultiInstanceLoopCharacteristics'
      ) {
        return this.local.loopCharacteristics.isSequential
          ? 'sequential_mi'
          : 'parallel_mi';
      }
      return 'no_loop';
    },
    setLoopCharacteristics(value) {
      if (!this.local.loopCharacteristics) {
        this.local.loopCharacteristics = {};
      }
      switch (value) {
        case 'no_loop':
          this.local.loopCharacteristics = undefined;
          break;
        case 'loop':
          this.local.loopCharacteristics.$type = 'bpmn:StandardLoopCharacteristics';
          break;
        case 'parallel_mi':
          this.local.loopCharacteristics.$type = 'bpmn:MultiInstanceLoopCharacteristics';
          this.local.loopCharacteristics.isSequential = false;
          if (!this.multiType) {
            this.multiType = 'inputData';
          }
          break;
        case 'sequential_mi':
          this.local.loopCharacteristics.$type = 'bpmn:MultiInstanceLoopCharacteristics';
          this.local.loopCharacteristics.isSequential = true;
          if (!this.multiType) {
            this.multiType = 'inputData';
          }
          break;
      }
    },
    setLoopMaximum(value) {
      if (!value) {
        value = null;
      }
      this.local.loopCharacteristics.loopMaximum = value;
    },
    getLoopMaximum() {
      if (!this.local.loopCharacteristics) return null;
      return this.local.loopCharacteristics.loopMaximum;
    },
    setLoopCondition(value) {
      this.local.loopCharacteristics.loopCondition = {
        $type: 'bpmn:Expression',
        body: value,
      };
    },
    getLoopCondition() {
      if (!this.local.loopCharacteristics || !this.local.loopCharacteristics.loopCondition) return null;
      return this.local.loopCharacteristics.loopCondition.body;
    },
  },
};
</script>
