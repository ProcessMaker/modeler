<template>
  <div class="web-hook">
    <input
      class="web-book__input form-control"
      v-model="webHook"
      label="Web Hook"
    >
    <button class="web-hook__button">Copy to clipboard</button>
  </div>
</template>

<script>

export default {
  data() {
    return {
      webHook: 'You copied',
    };
  },
  computed: {
    calledElementLabel() {
      return 'Processes';
    },
  },
  methods: {
    onChange(key, value) {
      this.$emit('input', { [key]: value });
    },
  },
};
</script>

<style lang="scss">
.web-hook {
    &__input {
      margin-bottom: 0 !important;
    }

    &__button {
      cursor: pointer;
      margin: 0;
      background: none;
      border: 0;
      color: #3397e1;
      /* cursor: default; */
      font: inherit;
      line-height: normal;
      overflow: visible;
      padding-bottom: 1rem;
    }
}
</style>

