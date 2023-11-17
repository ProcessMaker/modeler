<template>
  <div class="message mt-3">
    <b-card no-body class="h-100" style="border-radius: 8px;">
      <div class="h-100 d-flex pl-2 justify-content-between align-items-center">
        <div class="col-9">
          <div class="text-left">
            <inline-svg :src="proceC2Icon" class="ml-0 mr-2 my-auto ai-icon" />
            <span style="color: #556271; font-weight: 600;">{{ $t("Create your missing assets with AI") }}</span>
          </div>
          <div style="color: #556271; font-weight: 400;">
            {{ $t("Use AI to easily produce the necessary screens and scripts to complete the process.") }}
          </div>
        </div>
        <div class="col-3 h-100 p-0 d-flex flex-column justify-content-center">
          <button
            class="h-100 createBtn btn btn-primary btn-block"
            @click="onCreateAssets()"
          >
            {{ $t("Create now") }}
          </button>
          <button
            class="h-100 m-0 cancelBtn btn btn-light btn-block"
            @click="onCancel()"
          >
            {{ $t("Close") }}
          </button>
        </div>
      </div>
    </b-card>
  </div>
</template>
<script>
import InlineSvg from 'vue-inline-svg';

export default {
  name: 'CreateAssetsCard',
  components: {
    InlineSvg,
  },
  data() {
    return {
      proceC2Icon: require('@/assets/proceC2.svg'),
    };
  },
  methods: {
    onCreateAssets(){

    },
    onCancel() {
      this.$emit('closeCreateAssets');
    },
  },
};
</script>
<style>
.message {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0px 6px 12px rgba(0, 0, 0, 0.10);
  line-height: 27px;
  word-wrap: break-word;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  right: 10%;
  z-index: 1;
  font-size: 100%;
  height: 120px;
  width: 520px;
}

.ai-icon {
  width: 22px;
  height: 22px;
}

.createBtn {
  border-radius: 0px 8px 0px 0px;
  font-weight: 600;
  text-transform: capitalize;
}

.cancelBtn {
  border-radius: 0px 0px 8px 0px;
  border-left: 1px solid #CDDDEE;
  font-weight: 600;
  text-transform: capitalize;
}


</style>