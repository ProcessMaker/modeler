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

    <crown-color-dropdown
      :dropdown-open="colorDropdownOpen"
      :node="node"
      :showCustomIconPicker="showCustomIconPicker"
      :iconName="iconName"
      v-on="$listeners"
      @toggle-dropdown-state="colorDropdownToggle"
    />
  </div>
</template>
<script>
import CrownTaskDropdown from '@/components/crown/crownButtons/crownTaskDropdown';
import CrownBoundaryEventDropdown from '@/components/crown/crownButtons/crownBoundaryEventDropdown';
import CrownColorDropdown from '@/components/crown/crownButtons/crownColorDropdown';

export default {
  name: 'CrownDropdowns',
  components: { CrownTaskDropdown, CrownBoundaryEventDropdown, CrownColorDropdown },
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
    showCustomIconPicker: Boolean,
    iconName: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      taskDropdownOpen: this.taskDropdownInitiallyOpen,
      boundaryEventDropdownOpen: false,
      colorDropdownOpen: false,
    };
  },
  methods: {
    taskDropdownToggle(value) {
      this.taskDropdownOpen = value;
      this.boundaryEventDropdownOpen = false;
      this.colorDropdownOpen = false;
    },
    boundaryEventDropdownToggle(value) {
      this.taskDropdownOpen = false;
      this.boundaryEventDropdownOpen = value;
      this.colorDropdownOpen = false;
    },
    colorDropdownToggle(value) {
      this.taskDropdownOpen = false;
      this.boundaryEventDropdownOpen = false;
      this.colorDropdownOpen = value;
    },
  },
};
</script>

<style scoped>
#dropdown {
  display: contents;
}
</style>
