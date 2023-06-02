<template>
  <div class="top-rail-container">
    <ValidateIssue
      v-show="isOpenValidate"
      :handle-open-panel="handleOpenPanel"
      :error-list="errorList"
      :warnings="warnings"
    />

    <ValidateButton
      :is-open="isOpenValidate"
      :handle-open="handleOpenValidate"
    />

    <ValidatePanel
      v-show="isOpenValidate && isOpenPanel"
      :error-list="errorList"
    />
  </div>
</template>

<script>
import store from '@/store';
import { ValidateButton, ValidateIssue, ValidatePanel } from '@/components/topRail/validateControl';

export default {
  components: {
    ValidateButton,
    ValidateIssue,
    ValidatePanel,
  },
  props: ['validationErrors', 'warnings', 'xmlManager'],
  data() {
    return {
      isOpenValidate: false,
      isOpenPanel: false,
    };
  },
  computed: {
    errorList() {
      return Object.entries(this.validationErrors).flatMap(([errorKey, errors]) => {
        return errors.flatMap(error => {
          return {
            ...error,
            errorKey,
            ...{ 'errorId': `${error.id}_${error.message.split(' ').join('_')}` },
          };
        });
      });
    },
  },
  methods: {
    handleOpenValidate() {
      this.isOpenValidate = !this.isOpenValidate;

      store.commit('setAutoValidate', this.isOpenValidate);
    },
    handleOpenPanel() {
      this.isOpenPanel = !this.isOpenPanel;
    },
  },
};
</script>

<style scoped lang="scss" src="./topRail.scss"></style>
