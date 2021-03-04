<template>
  <div>
    <b-form-group>
      <b-form-checkbox data-test="for-compensation" v-model="isForCompensation" name="for-compensation">{{ $t('For Compensation') }}</b-form-checkbox>
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
          isForCompensation: false,
        };
      },
    },
  },
  name: 'MarkerFlags',
  data() {
    return {
      isForCompensation: this.value.isForCompensation,
    };
  },
  watch: {
    isForCompensation(newVal) {
      this.$emit('input', { isForCompensation: newVal });
    },
  },
};
</script>

<style scoped>

</style>
