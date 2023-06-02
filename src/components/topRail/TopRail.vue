<template>
  <div class="top-rail-container">
    <ValidateIssue
      v-show="isOpenValidate"
      :handle-open-panel="handleOpenPanel"
    />

    <ValidateButton
      :is-open="isOpenValidate"
      :handle-open="handleOpenValidate"
    />

    <ValidatePanel v-show="isOpenValidate && isOpenPanel" />
  </div>
</template>

<script>
import { ValidateButton, ValidateIssue, ValidatePanel } from '@/components/topRail/validateControl';

export default {
  components: {
    ValidateButton,
    ValidateIssue,
    ValidatePanel,
  },
  data() {
    return {
      isOpenValidate: false,
      isOpenPanel: false,
    };
  },
  methods: {
    handleOpenValidate() {
      this.isOpenValidate = !this.isOpenValidate;
    },
    handleOpenPanel() {
      this.isOpenPanel = !this.isOpenPanel;
    },
  },
};
</script>

<style scoped lang="scss" src="./topRail.scss"></style>
