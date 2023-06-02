<template>
  <div class="validate-container">
    <div class="validate-item-box">
      <vue-inline-svg :src="issueIcon" />

      <div class="validate-item-info">
        <div class="validate-item-title">No-Gateway-Join-Fork</div>
        <div class="validate-item-description">Gateway forks and joins</div>
        <div class="validate-item-node">
          <span class="validate-item-node-title">Node ID:</span> node_14
        </div>
      </div>
    </div>

    <div class="validate-item-box">
      <vue-inline-svg :src="issueIcon" />

      <div class="validate-item-info">
        <div class="validate-item-title">No-Gateway-Join-Fork</div>
        <div class="validate-item-description">Gateway forks and joins</div>
        <div class="validate-item-node">
          <span class="validate-item-node-title">Node ID:</span> node_14
        </div>
      </div>
    </div>

    <div class="validate-item-box">
      <vue-inline-svg :src="issueIcon" />

      <div class="validate-item-info">
        <div class="validate-item-title">No-Gateway-Join-Fork</div>
        <div class="validate-item-description">Gateway forks and joins</div>
        <div class="validate-item-node">
          <span class="validate-item-node-title">Node ID:</span> node_14
        </div>
      </div>
    </div>

    <div class="validate-item-box">
      <vue-inline-svg :src="issueIcon" />

      <div class="validate-item-info">
        <div class="validate-item-title">No-Gateway-Join-Fork</div>
        <div class="validate-item-description">Gateway forks and joins</div>
        <div class="validate-item-node">
          <span class="validate-item-node-title">Node ID:</span> node_14
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
  data() {
    return {
      issueIcon: require('@/assets/topRail/issue-item.svg'),
    };
  },
};
</script>

<style scoped lang="scss" src="./validatePanel.scss"></style>
