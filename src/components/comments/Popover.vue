<template>
  <div
    id="popover"
    class="card shadow-sm"
  >
    <div
      class="card-body"
      style="padding-top: 10px; padding-bottom: 5px"
    >
      <p class="popover-data">{{ message }}</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      message: '',
    };
  },
  mounted() {
    this.message = this.$t('This element has comments');
  },
};
</script>
<style>
#popover {
  position: absolute;
  z-index: 3;
}
.popover-data {
  font-size: 14px;
  line-height: 21px;
  letter-spacing: -0.02em;
  padding-top: 0px;
  padding-bottom: 0px;
  margin-bottom: 5px;
}
</style>