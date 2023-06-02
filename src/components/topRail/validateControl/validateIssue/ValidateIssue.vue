<template>
  <div class="issue-box">
    <span class="issue-title">Issues</span>

    <span class="issue-badge">2</span>

    <button type="button" @click.prevent="handleOpen" class="issue-button">
      <inline-svg :src="isOpen ? issueOpenIcon : issueCloseIcon" />
    </button>
  </div>
</template>

<script>
import InlineSvg from 'vue-inline-svg';

export default {
  components: {
    InlineSvg,
  },
  props: ['handleOpenPanel'],
  data() {
    return {
      isOpen: false,
      issueCloseIcon: require('@/assets/topRail/issue-close.svg'),
      issueOpenIcon: require('@/assets/topRail/issue-open.svg'),
    };
  },
  methods: {
    handleOpen() {
      this.isOpen = !this.isOpen;

      this.$props.handleOpenPanel();
    },
  },
};
</script>

<style scoped lang="scss" src="./validateIssue.scss"></style>
