<template>
  <div class="cog-container" v-if="showDropdown" role="menuitem">
    <crown-button
      id="dropdown-button"
      aria-label="Select a type"
      @click="dropdownOpen = !dropdownOpen"
    >
      <i class="fas fa-cog cog-container--button" />
    </crown-button>

    <ul class="element-list" v-if="dropdownOpen" role="list">
      <li class="element-list--item" role="listitem" v-for="{label, nodeType, dataTest} in dropdownData" :key="nodeType">
        <button
          :data-test="dataTest"
          class="element-list--item__button"
          type="button"
          @click="replaceNode({ node, typeToReplaceWith: nodeType })"
        >{{ $t(label) }}
        </button>
      </li>
    </ul>
  </div>
</template>
<script>
import CrownButton from '@/components/crown/crownButtons/crownButton';

export default {
  name: 'CrownDropdown',
  components: { CrownButton },
  props: {
    dropdownData: Array,
    node: Object,
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
  methods: {
    replaceNode(data) {
      if (data.node.type === data.typeToReplaceWith) {
        this.$emit('toggle-dropdown-state', false);
        return;
      }
      this.$emit('replace-node', data);
    },
  },
};
</script>
<style lang="scss" src="./crownDropdown.scss" scoped />
