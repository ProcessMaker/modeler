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
      return isString(this.value)
        ? this.value
        : this.value[0].text;
    },
  },
};
</script>

<style>
  .documentation-input .richtext {
    height: auto;
  }
</style>
