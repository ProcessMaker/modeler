<template>
  <div class="cog-container" role="menuitem">
    <crown-button
      id="dropdown-button"
      aria-label="Select a type"
      v-on="$listeners"
      @click="dropdownOpen = !dropdownOpen"
    >
      <i class="fas fa-cog cog-container--button"/>
    </crown-button>

    <ul class="element-list" v-if="dropdownOpen" role="list">
      <li
        class="element-list--item"
        role="listitem"
        v-for="{label, nodeType, dataTest} in dropdownData"
        :key="nodeType"
      >
        <button
          :data-test="dataTest"
          class="element-list--item__button"
          type="button"
          @click="addBoundaryEvent(nodeType)"
        >{{ $t(label) }}
        </button>
      </li>
    </ul>
  </div>
</template>
<script>
import CrownButton from '@/components/crownButton';

export default {
  name: 'CrownDropdown',
  components: { CrownButton },
  props: {
    dropdownData: Array,
    nodeRegistry: Object,
    moddle: Object,
    node: Object,
  },
  data() {
    return {
      dropdownOpen: false,
    };
  },
  methods: {
    addBoundaryEvent(nodeType) {
      const definition = this.nodeRegistry[nodeType].definition(this.moddle, this.$t);
      const diagram = this.nodeRegistry[nodeType].diagram(this.moddle);

      diagram.bounds.x = this.node.diagram.bounds.x;
      diagram.bounds.y = this.node.diagram.bounds.y;

      const node = {
        definition,
        diagram,
        type: nodeType,
      };

      this.$emit('add-boundary-event', node);
    },
  },
  created() {
    this.$t = this.$t.bind(this);
  },
};
</script>
<style lang="scss">
  $primary-color: #5096db;
  $primary-light: #fff;

  $element-list-top: 2.5rem;
  $element-list-left: 0;
  $element-list-top-chevron: -0.2rem;
  $element-list-left-chevron: 0.5rem;
  $crown-top-chevron: 0.8rem;
  $crown-left-chevron: 0.3rem;

  $chevron-width: 1.25rem;
  $chevron-height: 1.25rem;

  @mixin chevron($top, $left) {
    content: '';
    background-color: $primary-color;
    width: $chevron-width;
    height: $chevron-height;
    position: absolute;
    top: $top;
    left: $left;
    z-index: -1;
    transform: rotate(45deg);
    border-radius: 1px;
  }

  .cog-container {
    position: relative;
    display: flex;

    &--button {
      background: none;
      border: none;
      color: $primary-light;
    }
  }

  .element-list {
    position: absolute;
    white-space: nowrap;
    top: $element-list-top;
    left: $element-list-left;
    border-radius: 5px;
    background-color: $primary-color;
    padding: 0;

    &::after {
      @include chevron($element-list-top-chevron, $element-list-left-chevron);
    }

    &--item {
      list-style: none;

      &__button {
        background: none;
        padding: 0.25rem 0.85rem;
        border: none;
        color: $primary-light;
        font-size: 0.85rem;
      }
    }
  }
</style>
