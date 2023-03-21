<template>
  
  <div class="box" :style="{ left: boxLeft + 'px', top: boxTop + 'px', height: height + 'px', width: width + 'px' }" />
</template>

<script>
export default {
  name: 'Selection',
  props: {
    options: Object,
  },
  data() {
    return {
      test: 'test',
    };
  },
  computed: {
    boxLeft(){
      return this.options.left;
    },
    boxTop(){
      return this.options.top;
    },
    height(){
      return this.options.height;
    },
    width(){
      return this.options.width;
    },
  },
  methods: {
    // moveBox(event) {
    //   this.boxLeft = event.clientX;
    //   this.boxTop = event.clientY;
    // },
  },
};
</script>

<style>


.box {
  position: absolute;
  border-style: groove;
}
</style>