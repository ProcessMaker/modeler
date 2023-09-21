<template>
  <div class="message d-flex flex-column w-100">
    <div class="d-flex justify-content-center align-items-center">
      <div>
        {{
          $t("To start, click and drop objects to build the process you like.")
        }}
      </div>
      <div class="justify-content-center align-items-center">
        <div class="hyphen" />
        <div class="text-align-center">{{ $t("or") }}</div>
        <div class="hyphen"/>
      </div>
    </div>
    <b-button variant="outline-primary" class="text-primary" @click="onClick">
      <inline-svg :src="corneaIcon" />
      <div>{{ $t("Kick-start a new process with our generative AI") }}</div>
      <b-icon icon="chevron-right"/>
    </b-button>
  </div>
</template>
<script>
import InlineSvg from 'vue-inline-svg';

export default {
  name: 'WelcomeMessage',
  components: {
    InlineSvg,
  },
  data() {
    return {
      corneaIcon: require('@/assets/corneaIcon.svg'),
    };
  },
  methods: {},
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
  top: 50%;
  left: 0;
  border: 0 none;
  z-index: 2;
}

.hyphen {
  transform: rotate(180deg);
  transform-origin: 0 0;
  border: 1px #5f666d solid;
}
</style>