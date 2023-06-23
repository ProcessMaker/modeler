<template>
  <div
    class="validate-container"
    data-cy="validate-panel"
  >
    <div v-for="(error, index) in errorList" :key="`${error.errorId}_${index}`" class="validate-item-box">
      <vue-inline-svg :src="issueIcon" />

      <div class="validate-item-info">
        <div class="validate-item-title">{{ error.errorKey }}</div>
        <div class="validate-item-description">{{ error.message }}.</div>
        <div class="validate-item-node" v-if="error.id">
          <span class="validate-item-node-title">{{ $t('Node ID') }}:</span> {{ error.id }}
        </div>
      </div>
    </div>

    <div v-for="(warning, index) in warnings" :key="warning.title + index" class="validate-item-box">
      <vue-inline-svg :src="issueIcon" />

      <div class="validate-item-info">
        <div class="validate-item-title">{{ warning.title }}</div>
        <div class="validate-item-description">{{ warning.text }}.</div>
      </div>
    </div>
  </div>
</template>

<script>
import VueInlineSvg from 'vue-inline-svg';

export default {
  components: {
    VueInlineSvg,
  },
  props: {
    errorList: {
      type: Array,
      required: true,
    },
    warnings: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      issueIcon: require('@/assets/topRail/issue-item.svg'),
    };
  },
};
</script>

<style scoped lang="scss" src="./validatePanel.scss"></style>
