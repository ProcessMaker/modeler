<template>
  <div class="cog-container" role="menuitem">
    <crown-button
      id="dropdown-button"
      aria-label="Select a boundary event"
      v-on="$listeners"
      :src="boundaryEventIcon"
      @click="dropdownOpen = !dropdownOpen"
      data-test="boundary-event-dropdown"
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
          {{
            getEmptyBoundaryEventPositionsForShape(shape).length === 0
              ? 'No available space'
              : disabledLabel
          }}
        </b-tooltip>
      </li>
    </ul>
  </div>
</template>
<script>
import CrownButton from '@/components/crownButton';
import boundaryEventIcon from '@/assets/boundary-event.svg';
import { getEmptyBoundaryEventPositionsForShape } from '@/portsUtils';
import { canAddBoundaryEventToTarget } from '@/boundaryEventValidation';
import store from '@/store';

export default {
  name: 'CrownDropdown',
  components: { CrownButton },
  props: {
    dropdownData: Array,
    nodeRegistry: Object,
    moddle: Object,
    node: Object,
    shape: Object,
  },
  data() {
    return {
      dropdownOpen: false,
      boundaryEventIcon,
    };
  },
  methods: {
    canAddBoundaryEventToTarget,
    getEmptyBoundaryEventPositionsForShape,
    addBoundaryEvent(nodeType) {
      this.dropdownOpen = false;

      if (!canAddBoundaryEventToTarget(nodeType, this.shape)) {
        return;
      }

      const definition = this.nodeRegistry[nodeType].definition(this.moddle, this.$t);
      const diagram = this.nodeRegistry[nodeType].diagram(this.moddle);
      const emptyPort = getEmptyBoundaryEventPositionsForShape(this.shape)[0];

      diagram.bounds.x = emptyPort.x - (diagram.bounds.width / 2);
      diagram.bounds.y = emptyPort.y - (diagram.bounds.height / 2);

      const node = {
        definition,
        diagram,
        type: nodeType,
      };

      store.commit('highlightNode', node);

      this.$emit('add-boundary-event', node);
    },
  },
  created() {
    this.$t = this.$t.bind(this);
  },
};
</script>
