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
      multiType: this.getMultiType(),
      loopCardinality: this.getLoopCardinality(),
      inputData: this.getLoopDataInputRef(),
      inputDataItem: this.getInputDataItem(),
      outputData: this.getLoopDataOutputRef(),
      outputDataItem: '',
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
  watch: {
    value: {
      deep: true,
      handler() {
        this.multiType = this.getMultiType();
        this.loopCardinality = this.getLoopCardinality();
        this.inputData = this.getLoopDataInputRef();
        this.inputDataItem = this.getInputDataItem();
        this.outputData = this.getLoopDataOutputRef();
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
  },
  methods: {
    getLoopDataOutputRef() {
      if (!this.value.loopCharacteristics || !this.value.loopCharacteristics.loopDataOutputRef) return null;
      return this.value.ioSpecification.dataOutputs[0].name;
    },
    setLoopDataOutputRef(value) {
      const dataDef = {
        $type: 'bpmn:DataOutput',
        id: `${this.value.id}_output_1`,
        isCollection: true,
        name: value,
      };
      if (!this.value.ioSpecification) {
        this.initIoSpecification();
      }
      this.value.ioSpecification.dataOutputs = [
        dataDef,
      ];
      this.value.loopCharacteristics.loopDataOutputRef = dataDef.id;
      this.$emit('input', cloneDeep(this.value));
    },
    getInputDataItem() {
      if (!this.value.loopCharacteristics || !this.value.loopCharacteristics.inputDataItem) return null;
      return this.value.loopCharacteristics.inputDataItem.name;
    },
    setInputDataItem(value) {
      this.value.loopCharacteristics.loopCardinality = {
        $type: 'bpmn:DataInput',
        isCollection: true,
        name: value,
      };
      this.$emit('input', cloneDeep(this.value));
    },
    getLoopDataInputRef() {
      if (!this.value.loopCharacteristics || !this.value.loopCharacteristics.loopDataInputRef) return null;
      return this.value.ioSpecification.dataInputs[0].name;
    },
    setLoopDataInputRef(value) {
      const dataDef = {
        $type: 'bpmn:DataInput',
        id: `${this.value.id}_input_1`,
        isCollection: true,
        name: value,
      };
      if (!this.value.ioSpecification) {
        this.initIoSpecification();
      }
      this.value.ioSpecification.dataInputs = [
        dataDef,
      ];
      this.value.loopCharacteristics.loopDataInputRef = dataDef.id;
      this.$emit('input', cloneDeep(this.value));
    },
    initIoSpecification() {
      this.value.ioSpecification = {
        $type: 'bpmn:InputOutputSpecification',
        dataInputs: [],
        dataOutputs: [],
      };
    },
    getLoopCardinality() {
      if (!this.value.loopCharacteristics || !this.value.loopCharacteristics.loopCardinality) return null;
      return this.value.loopCharacteristics.loopCardinality.body;
    },
    setLoopCardinality(value) {
      this.value.loopCharacteristics.loopCardinality = {
        $type: 'bpmn:Expression',
        body: value,
      };
      this.$emit('input', cloneDeep(this.value));
    },
    getMultiType() {
      if (!this.value.loopCharacteristics) return null;
      return this.value.loopCharacteristics.loopCardinality !== undefined ? 'loopCardinality' : 'inputData';
    },
    setMultiType(value) {
      if (value === 'loopCardinality') {
        this.value.loopCharacteristics.loopCardinality = {
          $type: 'bpmn:Expression',
          body: '',
        };
        delete this.value.loopCharacteristics.loopDataInputRef;
      } else {
        delete this.value.loopCharacteristics.loopCardinality;
        this.value.loopCharacteristics.loopDataInputRef = '';
      }
    },
    getLoopCharacteristics() {
      if (!this.value.loopCharacteristics) return 'no_loop';
      if (
        this.value.loopCharacteristics.$type ===
          'bpmn:StandardLoopCharacteristics'
      )
        return 'loop';
      if (
        this.value.loopCharacteristics.$type ===
          'bpmn:MultiInstanceLoopCharacteristics'
      ) {
        return this.value.loopCharacteristics.isSequential
          ? 'sequential_mi'
          : 'parallel_mi';
      }
      return 'no_loop';
    },
    setLoopCharacteristics(value) {
      switch (value) {
        case 'no_loop':
          this.value.loopCharacteristics = null;
          break;
        case 'loop':
          this.value.loopCharacteristics = { $type: 'bpmn:StandardLoopCharacteristics' };
          break;
        case 'parallel_mi':
          this.value.loopCharacteristics = { $type: 'bpmn:MultiInstanceLoopCharacteristics', isSequential: false };
          break;
        case 'sequential_mi':
          this.value.loopCharacteristics = { $type: 'bpmn:MultiInstanceLoopCharacteristics', isSequential: true };
          break;
      }
      this.$emit('input', cloneDeep(this.value));
    },
  },
};
</script>

<style scoped>
</style>
