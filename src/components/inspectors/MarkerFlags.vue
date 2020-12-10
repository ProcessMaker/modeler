<template>
  <div>
    <b-form-group label="Loop Characteristics">
      <b-form-radio data-test="no_loop" v-model="loopCharacteristics" name="marker-flags-radios" value="no_loop">No loop characteristics</b-form-radio>
      <b-form-radio data-test="parallel_mi" v-model="loopCharacteristics" name="marker-flags-radios" value="parallel_mi">Parallel multi-instance</b-form-radio>
      <b-form-radio data-test="sequential_mi" v-model="loopCharacteristics" name="marker-flags-radios" value="sequential_mi">Sequential multi-instance</b-form-radio>
      <b-form-radio data-test="loop" v-model="loopCharacteristics" name="marker-flags-radios" value="loop">Loop</b-form-radio>
    </b-form-group>
    <b-form-group>
      <b-form-checkbox data-test="for-compensation" v-model="isForCompensation" name="for-compensation">For Compensation</b-form-checkbox>
    </b-form-group>
  </div>
</template>

<script>
export default {
  props: {
    value: {
      type: Object,
      default() {
        return {
          loopCharacteristics: 'no_loop',
          isForCompensation: false,
        };
      },
    },
  },
  name: 'MarkerFlags',
  data() {
    return {
      loopCharacteristics: this.value.loopCharacteristics,
      isForCompensation: this.value.isForCompensation,
    };
  },
  watch: {
    loopCharacteristics(newVal) {
      this.$emit('input', {loopCharacteristics: newVal});
    },
    isForCompensation(newVal) {
      this.$emit('input', {isForCompensation: newVal});
    },
  },
};
</script>

<style scoped>

</style>
