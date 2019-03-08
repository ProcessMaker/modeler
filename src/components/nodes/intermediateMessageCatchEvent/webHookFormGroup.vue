<template>
  <div class="web-hook">
    <label for="webHook">Web Hook</label>
    <input
      v-model="webHook"
      class="form-control"
      name="webHook"
      ref="text"
      readonly
    >
    <button class="web-hook__button" @click="copyToClipboard">Copy to clipboard</button>
  </div>
</template>

<script>

export default {
  data() {
    return {
      webHook: 'https://processmaker.com/events/253223535435',
    };
  },
  methods: {
    copyToClipboard() {
      this.$refs.text.select();
      document.execCommand('copy');
    },
  },
};
</script>

<style lang="scss">
.web-hook {
  &__button {
    cursor: pointer;
    margin: 0;
    background: none;
    border: 0;
    color: #3397e1;
    line-height: normal;
    overflow: visible;
    padding-bottom: 1rem;
  }
}
</style>
