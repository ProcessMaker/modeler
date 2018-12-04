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
    handleClick() {
      this.$parent.loadInspector('processmaker-modeler-script-task', this.node.definition, this);
    },
  },
};

</script>
