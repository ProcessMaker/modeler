<template>
  <div
    class="crown-config crown-multiselect"
    :style="style"
    v-if="isMultiSelect"
    role="menu"
  >
    <slot />

    <button
      v-for="button in availableButtons"
      :key="button.label"
      :aria-label="button.label"
      class="crown-button"
      :title="button.label"
      :data-test="button.testId"
      :role="button.role"
      @click="button.action"
    >
      <font-awesome-icon v-if="button.iconPrefix === 'fpm'" :icon="[button.iconPrefix, `fa-${button.icon}`]"/>
      <i v-else :class="`${button.iconPrefix} fa-${button.icon} text-dark`" />
    </button>
    <crown-align v-show="showAlignmentButtons" :paper="paper" @save-state="$emit('save-state')" />
  </div>
</template>

<script>
import store from '@/store';
import runningInCypressTest from '@/runningInCypressTest';
import crownAlign from './crownAlign';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faCenterVertically } from '../crownButtons/icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';


export default {
  props: {
    paper: Object,
    hasPools: Boolean,
  },
  components:{ crownAlign, FontAwesomeIcon },
  data() {
    return {
      showAlignmentButtons: false,
      runningInCypressTest: runningInCypressTest(),
      showCrown: false,
      savePositionOnPointerupEventSet: false,
      style: null,
      taskDropdownInitiallyOpen: this.paperNotRendered(),
      showReplaceModal: false,
      nodeToReplace: null,
      buttons: [
        {
          label: 'Copy Selection',
          iconPrefix: 'fa',
          icon: 'clipboard',
          testId: 'copy-button',
          role: 'menuitem',
          action: this.copySelection,
        },
        {
          label: 'Clone Selection',
          iconPrefix: 'fa',
          icon: 'copy',
          testId: 'clone-button',
          role: 'menuitem',
          action: this.cloneSelection,
        },
        {
          label: 'Align',
          iconPrefix: 'fpm',
          icon: 'center-vertically',
          testId: 'align',
          role: 'menuitem',
          action: this.showAlign,
        },
        {
          label: 'Delete Element',
          iconPrefix: 'fa',
          icon: 'trash-alt',
          testId: 'delete-button',
          role: 'menuitem',
          action: this.deleteElement,
        },
        // add more buttons as necessary
      ],
    };
  },
  created() {
    this.$t = this.$t.bind(this);
    library.add(faCenterVertically);
  },
  computed: {
    isMultiSelect() {
      const countSelected = store.getters.highlightedShapes.length;
      return countSelected > 1;
    },
    highlightedShapes: () => store.getters.highlightedShapes,
    availableButtons() {
      const hasPoolsSelected = this.hasPools;
      return this.buttons.filter(button => {
        if (button.testId === 'copy-button') {
          return !hasPoolsSelected;
        }
        if (button.testId === 'clone-button') {
          return !hasPoolsSelected;
        }
        return true;
      });
    },
  },
  methods: {
    showAlign() {
      this.showAlignmentButtons = !this.showAlignmentButtons;
    },
    copySelection() {
      this.$emit('copy-selection');
    },
    cloneSelection() {
      this.$emit('clone-selection');
    },
    deleteElement() {
      this.$emit('remove-nodes');
    },
    paperNotRendered() {
      return !this.isRendering;
    },
    setNodePosition() {
      this.shape.stopListening(
        this.paper,
        'element:pointerup',
        this.setNodePosition
      );
      this.savePositionOnPointerupEventSet = false;

      if (!store.getters.allowSavingElementPosition) {
        return;
      }

      this.$emit('save-state');
    },
    paperDoneRendering() {
      if (!this.isRendering) {
        return;
      }

      return new Promise((resolve) => this.paper.once('render:done', resolve));
    },
    setUpCrownConfig() {
      this.paper.on(
        'render:done scale:changed translate:changed',
        this.repositionCrown
      );
    },
    setUpPositionHandling() {},
  },
  async mounted() {
    await this.$nextTick();
    await this.paperDoneRendering();
    this.setUpCrownConfig();
  },
};
</script>


<style lang="scss" scoped>
.crown-multiselect {
  top: -38px;
  left: 50%;
  pointer-events: auto;
}
.crown-button {
  border:none;
  display: flex;
  background-color: $primary-white;
  border-radius: 4px;
  color: $crown-icon-neutral;
  width: 35px;
  height: 35px;
  font-size: 20px;
  padding: 4px;
}
.crown-button:hover {
  background-color: $crown-icon-hover-bg;
  color: $crown-icon-neutral;
}
.crown-button:active {
  background-color: $cronw-icon-active-bg;
  color: $crown-icon-active;
}

.crown-button:focus {
  background-color: #DEEBFF;
  color: $crown-icon-active;
}

img {
  margin: 0px 5px;
  height: 20px;
  width: 20px;
  padding:2px;
  fill: #5faaee;
}
.crown-button svg {
  margin:auto;
}
.crown-button i {
  margin:auto;
}
</style>
