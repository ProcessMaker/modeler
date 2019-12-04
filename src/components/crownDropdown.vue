<template>
  <div class="cog-container" v-if="showDropdown" role="menuitem">
    <button class="cog-container--button" @click="dropdownOpen = !dropdownOpen">
      <i class="fas fa-cog" />
    </button>

    <ul class="element-list" v-if="dropdownOpen" role="list">
      <li class="element-list--item" role="listitem" v-for="{label, nodeType, dataTest} in dropdownData" :key="nodeType">
        <button
          :data-test="dataTest"
          class="element-list--item__button"
          type="button"
          @click="$emit('replace-node', { node, typeToReplaceWith: nodeType })"
        >{{ $t(label) }}
        </button>
      </li>
    </ul>
  </div>
</template>
<script>
export default {
  name: 'CrownDropdown',
  props: {
    dropdownData: {},
    node: {},
    showDropdown: {
      type: Boolean,
      required: true,
    },
  },
  data() {
    return {
      dropdownOpen: true,
    };
  },
};
</script>
<style lang="scss">
$primary-color: #5096db;
$primary-light: #fff;

$element-list-top: 2.5rem;
$element-list-left: -0.65rem;
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
    padding: 0;
    position: relative;
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
