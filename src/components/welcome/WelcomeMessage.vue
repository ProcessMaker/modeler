<template>
  <div
    v-if="!session || Object.keys(session).length === 0"
    class="message d-flex flex-column w-100 align-items-center"
  >
    <div class="d-flex justify-content-center align-items-center flex-column justify-content-center">
      <div class="w-100">
        {{
          $t("To start, click and drop objects to build the process you like.")
        }}
      </div>
      <div class="justify-content-center align-items-center w-100 text-center my-4">
        <div class="text-align-center d-flex text-center justify-content-center align-items-center">
          <div class="hyphen" />
          {{ $t("or") }}
          <div class="hyphen" />
        </div>
      </div>
    </div>
    <b-button
      class="new-process-btn d-flex flex-row p-2 align-items-center"
      @click="redirectToAiProcess()"
    >
      <inline-svg :src="proceC2Icon" class="mx-2 ai-icon" />
      <div class="mr-3">{{ $t("Kick-start a new process with our generative AI") }}</div>
      <span class="fa fa-chevron-right" />
    </b-button>
  </div>
  <div
    v-else
    class="message d-flex flex-column w-100 align-items-center"
  >
    <b-button
      class="new-process-btn d-flex flex-row px-2 py-4 align-items-center text-capitalize"
      @click="redirectToAiProcess()"
    >
      <div class="d-flex justify-content-between">
        <inline-svg :src="proceC2Icon" class="mx-3 my-auto ai-icon" />
        <div class="mr-4 text-left">
          <div class="h5 m-0">{{ $t("Continue your AI session") }}</div>
          <div class="text-secondary font-weight-light">
            {{ $t("Last session") + " " + session.time + " at " + session.date }}
          </div>
        </div>
      </div>
      <span class="fa fa-chevron-right" />
    </b-button>
    <div class="d-flex justify-content-center align-items-center flex-column justify-content-center">
      <div class="justify-content-center align-items-center w-100 text-center my-4">
        <div class="text-align-center d-flex text-center justify-content-center align-items-center">
          <div class="hyphen" />
          {{ $t("or") }}
          <div class="hyphen" />
        </div>
      </div>
      <div class="w-100">
        {{ $t("Click and drop objects to build the process you like.") }}
      </div>
    </div>
  </div>
</template>
<script>
import InlineSvg from 'vue-inline-svg';

export default {
  name: 'WelcomeMessage',
  components: {
    InlineSvg,
  },
  props: ['session'],
  data() {
    return {
      proceC2Icon: require('@/assets/proceC2.svg'),
    };
  },
  methods: {
    redirectToAiProcess() {
      const processId = window.ProcessMaker.modeler.process.id ?? null;
      if (processId) {
        const url = `/package-ai/processes/create/${processId}/${processId}`;
        window.location = url;
      }
    },
  },
};
</script>
<style>
.message {
  color: #5f666d;
  font-style: italic;
  line-height: 27px;
  word-wrap: break-word;
  position: absolute;
  display: flex;
  justify-content: center;
  align-items: center;
  left: 0;
  border: 0 none;
  z-index: 1;
  font-size: 110%;
  font-weight: 100;
  height: calc(100% - 130px);
}

.hyphen {
  transform: rotate(0deg);
  transform-origin: 0 0;
  border: 1px #5f666d solid;
  width: 30px;
  margin: 5px 13px 0px 13px;
}
.new-process-btn {
  color: #0872c2;
  border-color: #0872c2;
  background-color: #ffffff;
  box-shadow: 0 3px 9px -3px #c2c2c2;
}

.new-process-btn:hover {
  background-color: #edf7ff;
  color: #0872C2;
  border-color: #0872C2;
}

.ai-icon {
  width: 22px;
  height: 22px;
}

.ai-icon {
  width: 22px;
  height: 22px;
}
</style>