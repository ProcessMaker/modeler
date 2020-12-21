
<template>
  <div>
    <div class="d-flex justify-content-between align-items-center">
      <label class="m-0">{{ $t(label) }}</label>
      <button type="button" @click="expandEditor" class="btn-sm float-right"><i class="fas fa-expand"/></button>
    </div>

    <form-text-area
      v-bind="$attrs"
      :value="textValue"
      :richtext="renderAsRichtext"
      class="documentation-input"
      @input="$emit('input', $event)"
    />
  </div>
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
    label: {
      type: String,
      default: 'Description',
    },
  },
  inheritAttrs: false,
  computed: {
    textValue() {
      return isString(this.value)
        ? this.value
        : get(this.value[0], 'text', '');
    },
  },
  methods: {
    expandEditor() {

    },
    emitValue(value) {
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
