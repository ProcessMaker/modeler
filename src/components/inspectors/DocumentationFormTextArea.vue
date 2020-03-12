<template>
  <form-text-area
    v-bind="$attrs"
    :value="textValue"
    :richtext="renderAsRichtext"
    class="documentation-input"
    @input="updateDoc"
  />
</template>

<script>
import runningInCypressTest from '@/runningInCypressTest';

export default {
  data() {
    return {
      renderAsRichtext: !runningInCypressTest(),
    };
  },
  props: {
    value: {
      type: Array,
      default: () => [],
    },
  },
  inheritAttrs: false,
  computed: {
    textValue() {
      return this.value[0].text;
    },
  },
  methods: {
    updateDoc(text) {
      this.value[0].text = text;
      this.$emit('input', this.value);
    },
  },
};
</script>

<style>
  .documentation-input .richtext {
    height: auto;
  }
</style>
