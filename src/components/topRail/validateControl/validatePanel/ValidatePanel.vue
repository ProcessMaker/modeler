<template>
  <div class="validate-container">
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
  </div>
</template>

<script>
import VueInlineSvg from 'vue-inline-svg';

export default {
  components: {
    VueInlineSvg,
  },
  props: ['errorList'],
  data() {
    return {
      issueIcon: require('@/assets/topRail/issue-item.svg'),
    };
  },
};
</script>

<style scoped lang="scss" src="./validatePanel.scss"></style>
