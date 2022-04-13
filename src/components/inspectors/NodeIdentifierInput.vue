<template>
  <div>
    <FormInput
      name="id"
      v-model="localValue"
      :label="label"
      :helper="helper"
      @input="onInput"
      :error="error"
      :validation="validation"
    />
  </div>
</template>

<script>
import store from '@/store';

export default {
  props: {
    label: {
      type: String,
    },
    helper: {
      type: String,
    },
    value: {
      default: null,
    },
    validation: {
      type: String,
    },
  },
  data() {
    return {
      localValue: this.value,
      error: '',
    };
  },
  methods: {
    onInput(value) {
      if (this.value !== value) {
        if (!this.isUnique(value)) {
          this.error = this.$t('Must be unique');
        } else {
          this.error = '';
          this.$emit('input', value);
        }
      }
    },
    isUnique(value) {
      if (store.state.nodes.every(node => node.definition.id !== value)) {
        return true;
      } else {
        return false;
      }
    },
  },
};
</script>