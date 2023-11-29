<template>
  <div class="message mt-3">
    <b-card no-body class="h-100 w-100" style="border-radius: 8px;">
      <div class="h-100 d-flex p-3 justify-content-between align-items-center">
        <div>
          <div class="text-left">
            <inline-svg :src="proceC2Icon" class="ml-0 mr-2 my-auto ai-icon" />
            <span class="card-text">{{ $t("Generating...") }}</span>
          </div>
        </div>
        <div class="p-0">
          <button
            class="h-100 px-3 cancel-btn btn btn-secondary"
            @click="onClose()"
          >
            {{ $t("STOP") }}
          </button>
        </div>
      </div>
    </b-card>
  </div>
</template>
<script>
import InlineSvg from 'vue-inline-svg';

export default {
  name: 'GeneratingAssetsCard',
  components: {
    InlineSvg,
  },
  data() {
    return {
      proceC2Icon: require('@/assets/proceC2.svg'),
    };
  },
  methods: {
    onClose() {
      this.$emit('stopAssetGeneration');
    },
  },
};
</script>
<style scoped>
.message {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.10);
  line-height: 27px;
  word-wrap: break-word;
  position: absolute;
  display: flex;
  align-items: center;
  bottom: 35px; 
  left: 35%;
  z-index: 1;
  font-size: 100%;
  height: 60px;
  width: 450px;
}

.card-text {
  color: #556271;
  font-weight: 400;
}

.ai-icon {
  width: 22px;
  height: 22px;
}

.cancel-btn {
  font-weight: 600;
  text-transform: capitalize;
}


</style>