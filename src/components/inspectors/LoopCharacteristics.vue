<template>
  <div>
    <b-form-group :label="$t('Loop Characteristics')">
      <b-form-radio-group
        id="radio-group-loop-characteristics"
        v-model="loopType"
        :options="loopOptions"
        stacked
        name="radio-group-loop-characteristics"
      />
    </b-form-group>
    <template
      v-if="
        loopType === 'parallel_mi' ||
          loopType === 'sequential_mi'
      "
    >
      <b-form-group :label="$t('Type')">
        <b-form-radio
          v-model="multiType"
          name="multiType-radio"
          value="loopCardinality"
        >Loop Cardinality (Numeric)</b-form-radio>
        <b-form-radio
          v-model="multiType"
          name="multiType-radio"
          value="inputData"
        >Input Data (Array)</b-form-radio>
      </b-form-group>
      <b-form-group
        v-if="multiType === 'loopCardinality'"
        id="group-loopCardinality"
        :label="$t('Loop Cardinality')"
        label-for="loopCardinality"
        :description="
          $t(
            'A numeric Expression that controls the number of Activity instances that will be created'
          )
        "
      >
        <b-form-input
          id="loopCardinality"
          v-model="loopCardinality"
          type="text"
          placeholder="5, intVariable"
        />
      </b-form-group>
      <b-form-group
        v-if="multiType === 'inputData'"
        id="group-inputData"
        :label="$t('Input Data')"
        label-for="inputData"
        :description="
          $t(
            'Input used to determine the number of Activity instances, one per item in the Input Data.'
          )
        "
      >
        <b-form-input
          id="inputData"
          v-model="inputData"
          type="text"
          placeholder="arrayVariable"
        />
      </b-form-group>
      <b-form-group
        v-if="multiType === 'inputData'"
        id="group-inputDataItem"
        :label="$t('Input Data Item')"
        label-for="inputDataItem"
        :description="
          $t(
            'Represents a single item of the array received by each Activity instance'
          )
        "
      >
        <b-form-input
          id="inputDataItem"
          v-model="inputDataItem"
          type="text"
          placeholder="itemVariable"
        />
      </b-form-group>
      <b-form-group
        id="group-outputData"
        :label="$t('Output Data')"
        label-for="outputData"
        :description="
          $t(
            'Specifies the output array variable, which will be produced by the multi-instance.'
          )
        "
      >
        <b-form-input
          id="outputData"
          v-model="outputData"
          type="text"
          placeholder="arrayVariable"
        />
      </b-form-group>
      <b-form-group
        id="group-outputDataItem"
        :label="$t('Output Data Item')"
        label-for="outputDataItem"
        :description="
          $t(
            'Represents a single item of the array that will be produced by the multi-instance.'
          )
        "
      >
        <b-form-input
          id="outputDataItem"
          v-model="outputDataItem"
          type="text"
          placeholder="itemVariable"
        />
      </b-form-group>
    </template>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
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
        { text: 'No loop characteristics', value: 'no_loop' },
        { text: 'Parallel multi-instance', value: 'parallel_mi' },
        { text: 'Sequential multi-instance', value: 'sequential_mi' },
        { text: 'Loop', value: 'loop' },
      ],
      local: cloneDeep(this.value),
      multiType: null,
      loopCardinality: null,
      inputData: null,
      inputDataItem: null,
      outputData: null,
      outputDataItem: null,
    };
  },
  computed: {
    loopType: {
      get() {
        return this.getLoopCharacteristics();
      },
      set(value) {
        return this.setLoopCharacteristics(value);
      },
    },
  },
  mounted() {
    this.loadData();
  },
  watch: {
    value: {
      deep: true,
      handler() {
      },
    },
    multiType(value) {
      this.setMultiType(value);
    },
    loopCardinality(value) {
      this.setLoopCardinality(value);
    },
    inputData(value) {
      this.setLoopDataInputRef(value);
    },
    inputDataItem(value) {
      this.setInputDataItem(value);
    },
    outputData(value) {
      this.setLoopDataOutputRef(value);
    },
    outputDataItem(value) {
      this.setOutputDataItem(value);
    },
  },
  methods: {
    loadData() {
      this.local = cloneDeep(this.value);
      this.multiType = this.getMultiType();
      this.loopCardinality = this.getLoopCardinality();
      this.inputData = this.getLoopDataInputRef();
      this.inputDataItem = this.getInputDataItem();
      this.outputData = this.getLoopDataOutputRef();
      this.outputDataItem = this.getOutputDataItem();
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
      this.$emit('input', cloneDeep(this.local));
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
      this.local.loopCharacteristics.loopDataOutputRef = dataDef.id;
      this.$emit('input', cloneDeep(this.local));
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
      this.$emit('input', cloneDeep(this.local));
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
      this.local.loopCharacteristics.loopDataInputRef = dataDef.id;
      this.$emit('input', cloneDeep(this.local));
    },
    initIoSpecification() {
      this.local.ioSpecification = {
        $type: 'bpmn:InputOutputSpecification',
        dataInputs: [],
        dataOutputs: [],
      };
    },
    getLoopCardinality() {
      if (!this.local.loopCharacteristics || !this.local.loopCharacteristics.loopCardinality) return null;
      return this.local.loopCharacteristics.loopCardinality.body;
    },
    setLoopCardinality(value) {
      this.local.loopCharacteristics.loopCardinality = {
        $type: 'bpmn:Expression',
        body: value,
      };
      this.$emit('input', cloneDeep(this.local));
    },
    getMultiType() {
      if (!this.local.loopCharacteristics) return null;
      return this.local.loopCharacteristics.loopCardinality !== undefined ? 'loopCardinality' : 'inputData';
    },
    setMultiType(value) {
      if (value === 'loopCardinality') {
        this.local.loopCharacteristics.loopCardinality = {
          $type: 'bpmn:Expression',
          body: '',
        };
        delete this.local.loopCharacteristics.loopDataInputRef;
      } else {
        delete this.local.loopCharacteristics.loopCardinality;
        this.local.loopCharacteristics.loopDataInputRef = '';
      }
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
      switch (value) {
        case 'no_loop':
          this.local.loopCharacteristics = null;
          break;
        case 'loop':
          this.local.loopCharacteristics = { $type: 'bpmn:StandardLoopCharacteristics' };
          break;
        case 'parallel_mi':
          this.local.loopCharacteristics = { $type: 'bpmn:MultiInstanceLoopCharacteristics', isSequential: false };
          break;
        case 'sequential_mi':
          this.local.loopCharacteristics = { $type: 'bpmn:MultiInstanceLoopCharacteristics', isSequential: true };
          break;
      }
      this.$emit('input', cloneDeep(this.local));
    },
  },
};
</script>

<style scoped>
</style>
