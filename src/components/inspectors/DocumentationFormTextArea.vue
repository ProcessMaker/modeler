<template>
  <div>
    <div>
      <label>{{ $t('Documentation') }}</label>
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
