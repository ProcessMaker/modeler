<template>
  <form-text-area
    v-bind="$attrs"
    :value="textValue"
    @input="updateDoc"
  />
</template>

<script>
export default {
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
