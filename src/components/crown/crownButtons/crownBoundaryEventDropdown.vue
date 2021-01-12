<template>
  <div class="cog-container" role="menuitem" v-if="dropdownData.length > 0">
    <crown-button
      id="dropdown-button"
      aria-label="Select a boundary event"
      v-on="$listeners"
      :src="boundaryEventIcon"
      @click="$emit('toggle-dropdown-state', !dropdownOpen)"
      data-test="boundary-event-dropdown"
      v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
      :title="$t('Boundary Events')"
    />

    <ul class="element-list" v-if="dropdownOpen" role="list">
      <li
        class="element-list--item"
        role="listitem"
        v-for="{label, nodeType, dataTest, disabledLabel} in dropdownData"
        :key="nodeType"
        :id="nodeType"
      >
        <button
          :data-test="dataTest"
          class="element-list--item__button"
          type="button"
          :disabled="!canAddBoundaryEventToTarget(nodeType, shape)"
          @click="addBoundaryEvent(nodeType)"
        >{{ $t(label) }}
        </button>
        <b-tooltip v-if="!canAddBoundaryEventToTarget(nodeType, shape)" :target="nodeType" variant="warning" placement="right">
          {{ getErrorTooltipText(disabledLabel) }}
        </b-tooltip>
      </li>
    </ul>
  </div>
</template>
<script>
import CrownButton from '@/components/crown/crownButtons/crownButton';
import boundaryEventIcon from '@/assets/boundary-event.svg';
import { getEmptyBoundaryEventPositionsForShape } from '@/portsUtils';
import { canAddBoundaryEventToTarget } from '@/boundaryEventValidation';
import store from '@/store';
import Node from '@/components/nodes/node';

export default {
  name: 'CrownBoundaryEventDropdown',
  components: { CrownButton },
  props: {
    dropdownOpen: {
      type: Boolean,
      required: true,
    },
    dropdownData: Array,
    nodeRegistry: Object,
    moddle: Object,
    node: Object,
    shape: Object,
  },
  data() {
    return {
      boundaryEventIcon,
    };
  },
  methods: {
    getErrorTooltipText(disabledLabel) {
      return this.getEmptyBoundaryEventPositionsForShape(this.shape).length === 0
        ? 'No available space'
        : disabledLabel;
    },
    canAddBoundaryEventToTarget,
    getEmptyBoundaryEventPositionsForShape,
    addBoundaryEvent(nodeType) {
      this.$emit('toggle-dropdown-state', false);

      if (!this.canAddBoundaryEventToTarget(nodeType, this.shape)) {
        return;
      }

      const definition = this.nodeRegistry[nodeType].definition(this.moddle, this.$t);
      const diagram = this.nodeRegistry[nodeType].diagram(this.moddle);
      const emptyPort = getEmptyBoundaryEventPositionsForShape(this.shape)[0];

      diagram.bounds.x = emptyPort.x - (diagram.bounds.width / 2);
      diagram.bounds.y = emptyPort.y - (diagram.bounds.height / 2);

      const node = new Node(nodeType, definition, diagram);
      node.pool = this.node.pool;

      store.commit('highlightNode', node);

      this.$emit('add-node', node);
    },
  },
  created() {
    this.$t = this.$t.bind(this);
  },
};
</script>

<style lang="scss" src="./crownDropdown.scss" />
