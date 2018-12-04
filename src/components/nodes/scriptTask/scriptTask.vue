<template>
  <div>
  </div>
</template>

<script>
import TaskComponent from '@/components/nodes/task/task';

export default {
  extends: TaskComponent,
  methods: {
    getMarker() {
      return { 'xlink:href': require('@/assets/script.svg') };
    },
  },
};
</script>
