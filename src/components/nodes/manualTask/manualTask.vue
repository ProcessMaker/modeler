<template>
  <div/>
</template>

<script>
import TaskComponent from '@/components/nodes/task/task';
import scriptIcon from '@/assets/script.svg';

export default {
  extends: TaskComponent,
  mounted() {
    this.shape.attr('image/xlink:href', scriptIcon);
  },
};
</script>
