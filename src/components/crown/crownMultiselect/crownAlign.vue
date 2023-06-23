<template>
  <div
    class="crown-config crown-align"
    :style="style"
    v-if="isMultiSelect" role="menu"
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
      :disabled="button.disabled"
      @mousedown.stop.prevent
      @click.stop.prevent="button.action"
    >
      <font-awesome-icon :icon="['fpm', `fa-${button.icon}`]"/>
    </button>
  </div>
</template>

<script>
import store from '@/store';
import runningInCypressTest from '@/runningInCypressTest';
import { getShapesOptions } from '@/components/nodes/utilities/shapeGroup';
import { library } from '@fortawesome/fontawesome-svg-core';
import {
  faAlignBottom,
  faAlignTop,
  faAlignRight,
  faAlignLeft,
  faCenterHorizontally,
  faCenterVertically,
  faDistributeVertically,
  faDistributeHorizontally,
} from '../crownButtons/icons';
import { get } from 'lodash';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';


export default {
  components: {FontAwesomeIcon},
  props: {
    paper: Object,
    hasPools: Boolean,
  },
  data() {
    return {
      runningInCypressTest: runningInCypressTest(),
      showCrown: false,
      savePositionOnPointerupEventSet: false,
      style: null,
      taskDropdownInitiallyOpen: this.paperNotRendered(),
      showReplaceModal: false,
      nodeToReplace: null,
      buttons: [
        {
          label: this.$t('Align Left'),
          icon: 'align-left',
          testId: 'align-left',
          role: 'menuitem',
          action: this.alignLeft,
          condition: 'align.left',
          disabled: false,
        },
        {
          label: this.$t('Center Horizontally'),
          icon: 'center-horizontally',
          testId: 'align-horizontally',
          role: 'menuitem',
          action: this.centerHorizontally,
          condition: 'align.horizontalCenter',
          disabled: false,
        },
        {
          label: this.$t('Align Right'),
          icon: 'align-right',
          testId: 'align-right',
          role: 'menuitem',
          action: this.alignRight,
          condition: 'align.right',
          disabled: false,
        },
        {
          label: this.$t('Align Bottom'),
          icon: 'align-bottom',
          testId: 'align-bottom',
          role: 'menuitem',
          action: this.alignBottom,
          condition: 'align.bottom',
          disabled: false,
        },
        {
          label: this.$t('Center Vertically'),
          icon: 'center-vertically',
          testId: 'center-vertically',
          role: 'menuitem',
          action: this.centerVertically,
          condition: 'align.verticalCenter',
          disabled: false,
        },
        {
          label: this.$t('Align Top'),
          icon: 'align-top',
          testId: 'align-top',
          role: 'menuitem',
          action: this.alignTop,
          condition: 'align.top',
          disabled: false,
        },
        {
          label: this.$t('Distribute Horizontally'),
          icon: 'distribute-horizontally',
          testId: 'distribute-horizontally',
          role: 'menuitem',
          action: this.distributeHorizontally,
          condition: 'distribute.horizontally',
          disabled: false,
        },
        {
          label: this.$t('Distribute Vertically'),
          icon: 'distribute-vertically',
          testId: 'distribute-vertically',
          role: 'menuitem',
          action: this.distributeVertically,
          condition: 'distribute.vertically',
          disabled: false,
        },
        // add more buttons as necessary
      ],
    };
  },
  created() {
    this.$t = this.$t.bind(this);
    library.add(faAlignRight);
    library.add(faAlignLeft);
    library.add(faAlignBottom);
    library.add(faAlignTop);
    library.add(faCenterVertically);
    library.add(faCenterHorizontally);
    library.add(faDistributeVertically);
    library.add(faDistributeHorizontally);
  },
  watch: {
    selectedShapes() {
      this.$root.$emit('bv::hide::tooltip');
    },
  },
  computed: {
    selectedShapes() {
      this.disableButtons();
      return getShapesOptions(store.getters.highlightedShapes);
    },
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
    disableButtons() {
      let shapes = getShapesOptions(store.getters.highlightedShapes);
      this.buttons.forEach(button => {
        button.disabled = !get(shapes.can, button.condition, true);
      });
    },
    alignLeft() {
      this.undoableAction(this.selectedShapes.align.left);
    },
    centerHorizontally() {
      this.undoableAction(this.selectedShapes.align.horizontalCenter);
    },
    alignRight() {
      this.undoableAction(this.selectedShapes.align.right);
    },
    alignBottom() {
      this.undoableAction(this.selectedShapes.align.bottom);
    },
    centerVertically() {
      this.undoableAction(this.selectedShapes.align.verticalCenter);
    },
    alignTop() {
      this.undoableAction(this.selectedShapes.align.top);
    },
    distributeHorizontally() {
      this.undoableAction(this.selectedShapes.distribute.horizontally);
    },
    distributeVertically() {
      this.undoableAction(this.selectedShapes.distribute.vertically);
    },

    undoableAction(actionFn) {
      actionFn();
      this.$emit('save-state');
      this.disableButtons();
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
.crown-align {
  top: -58px;
  left: -35%;
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

.crown-button:disabled {
  background-color: #eaeaea;
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

<style lang="scss" src="./crownAlign.scss" />
