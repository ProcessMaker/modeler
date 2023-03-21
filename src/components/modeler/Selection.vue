<template>
  <div class="selector" />
</template>

<script>

export default {
  name: 'Selection',
 
  data() {
    return {
      selection: 'selection',
    };
  },
  methods: {
  },
  created() {
  },
  mounted() {

  },
};
</script>

<style lang="scss">
.selector {
  position: absolute;
  left: 248px;
  top: 300px;
  height: 100px;
  width: 100px;
  border-style: groove;
}
</style>
