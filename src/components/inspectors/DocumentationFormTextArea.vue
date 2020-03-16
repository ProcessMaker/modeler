<template>
  <form-text-area
    v-bind="$attrs"
    :value="textValue"
    :richtext="renderAsRichtext"
    class="documentation-input"
    @input="$emit('input', $event)"
  />
</template>

<script>
import runningInCypressTest from '@/runningInCypressTest';
import isString from 'lodash/isString';
import get from 'lodash/get';

export default {
  data() {
    return {
      renderAsRichtext: !runningInCypressTest(),
    };
  },
  props: {
    value: {
      type: [String, Array],
      default: '',
    },
  },
  inheritAttrs: false,
  computed: {
    textValue() {
      // eslint-disable-next-line no-console
      console.log('textValue', this.value);
      return isString(this.value)
        ? this.value
        : get(this.value[0], 'text', '');
    },
  },
  methods: {
    emitValue(value) {
      // eslint-disable-next-line no-console
      console.log('emitting');
      // eslint-disable-next-line no-console
      console.log('rich text emit', value);
      this.$emit('input', value);
    },
  },
};
</script>

<style>
  .documentation-input .richtext {
    height: auto;
  }
</style>
