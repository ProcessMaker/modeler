<template>
  <crown-config
    :highlighted="highlighted"
    :paper="paper"
    :graph="graph"
    :shape="shape"
    :node="node"
    :nodeRegistry="nodeRegistry"
    :moddle="moddle"
    :collaboration="collaboration"
    :process-node="processNode"
    :plane-elements="planeElements"
    :is-rendering="isRendering"
    :dropdownData="dropdownData"
    v-on="$listeners"
  />
</template>

<script>
import Task from '../task/task';
import userIcon from '@/assets/user-task.svg';

export default {
  extends: Task,
  mounted() {
    this.shape.attr('image/xlink:href', userIcon);
  },
  data() {
    return {
      dropdownData: [
        {
          label: 'Task',
          nodeType: 'processmaker-modeler-task',
        },
        {
          label: 'Manual Task',
          nodeType: 'processmaker-modeler-manual-task',
          dataTest: 'switch-to-manual-task',
        },
        {
          label: 'Script Task',
          nodeType: 'processmaker-modeler-script-task',
          dataTest: 'switch-to-script-task',
        },
      ],
    };
  },
};
</script>
