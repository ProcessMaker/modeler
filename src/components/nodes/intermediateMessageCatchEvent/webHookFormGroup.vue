<template>
  <div class="web-hook">
    <label for="webHook">Web Hook</label>
    <input
      v-model="webHook"
      class="web-hook__input form-control"
      name="webHook"
      readonly
    >
    <button class="web-hook__button" @click="copyToClipboard">Copy to clipboard</button>
  </div>
</template>

<script>

export default {
  data() {
    return {
      webHook: 'https://www.google.com/',
    };
  },
  methods: {
    copyToClipboard() {
      document.querySelector('.web-hook__input').select();
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

