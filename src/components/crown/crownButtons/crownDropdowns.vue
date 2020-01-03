<template>
  <div id="dropdown">
    <crown-task-dropdown
      :dropdown-data="dropdownData"
      :dropdown-open="taskDropdownOpen"
      :node="node"
      v-on="$listeners"
      @toggle-dropdown-state="taskDropdownToggle"
    />

    <crown-boundary-event-dropdown
      :dropdown-data="boundaryEventDropdownData"
      :dropdown-open="boundaryEventDropdownOpen"
      :nodeRegistry="nodeRegistry"
      :moddle="moddle"
      :node="node"
      :shape="shape"
      v-on="$listeners"
      @toggle-dropdown-state="boundaryEventDropdownToggle"
    />
  </div>
</template>
<script>
import CrownTaskDropdown from '@/components/crown/crownButtons/crownTaskDropdown';
import CrownBoundaryEventDropdown from '@/components/crown/crownButtons/crownBoundaryEventDropdown';

export default {
  name: 'CrownDropdowns',
  components: { CrownTaskDropdown, CrownBoundaryEventDropdown },
  props: {
    dropdownData: Array,
    boundaryEventDropdownData: Array,
    node: Object,
    nodeRegistry: Object,
    moddle: Object,
    shape: Object,
    taskDropdownInitiallyOpen: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      taskDropdownOpen: this.taskDropdownInitiallyOpen,
      boundaryEventDropdownOpen: false,
    };
  },
  methods: {
    taskDropdownToggle(value) {
      this.taskDropdownOpen = value;
      this.boundaryEventDropdownOpen = false;
    },
    boundaryEventDropdownToggle(value) {
      this.taskDropdownOpen = false;
      this.boundaryEventDropdownOpen = value;
    },
  },
};
</script>

<style scoped>
#dropdown {
  display: contents;
}
</style>
