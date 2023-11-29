<template>
  <div class="mr-2">
    <button
      id="aiAssetButton"
      :class="['btn px-2 ai-btn', showPopover ? 'ai-btn-open' : 'ai-btn-closed']"
      @click="showPopover = !showPopover"
    >
      <inline-svg :src="proceC2Icon" class="my-auto ai-icon" />
    </button>
    <b-popover
      target="aiAssetButton"
      triggers="click"
      :show.sync="showPopover"
      :title="$t('Create your assets with AI')"
      placement="auto"
    >
      <div class="p-3 d-flex flex-column">
        <div class="m-2">
          {{ $t('Create any missing assets for the process, including screens and scripts.') }}
        </div>
        <div class="m-2">
          <span class="text-primary">
            {{ $t('Optimal results need propper task naming and connections.') }}
          </span>
        </div>
        <button class="m-2 btn btn-primary" @click="onGenerateAssets()">
          {{ $t("Create Assets with AI") }}
        </button>
      </div>
    </b-popover>
  </div>
</template>
<script>
import InlineSvg from 'vue-inline-svg';

export default {
  name: 'CreateAssetsButton',
  components: {
    InlineSvg,
  },
  data() {
    return {
      proceC2Icon: require('@/assets/proceC2.svg'),
      showPopover: false,
    };
  },
  methods: {
    onGenerateAssets() {
      this.$emit('onGenerateAssets');
    },
  },
};
</script>
<style scoped>
.ai-icon {
  width: 22px;
  height: 22px;
}

.ai-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 32px;
  height: 32px;
}

.ai-btn-closed {
  color: #000000;
  background-color: #ebeef2;
}

.ai-btn-open {
  color: #FFFFFF;
  background-color: #6A7888;
}
</style>