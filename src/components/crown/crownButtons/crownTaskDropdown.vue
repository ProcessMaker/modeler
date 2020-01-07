<template>
  <div class="cog-container" v-if="dropdownData.length > 0" role="menuitem">
    <crown-button
      id="dropdown-button"
      aria-label="Select a type"
      v-on="$listeners"
      @click="$emit('toggle-dropdown-state', !dropdownOpen)"
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
  name: 'CrownTaskDropdown',
  components: { CrownButton },
  props: {
    dropdownData: Array,
    node: Object,
    dropdownOpen: {
      type: Boolean,
      required: true,
    },
  },
  methods: {
    replaceNode(data) {
      if (data.node.type === data.typeToReplaceWith) {
        this.$emit('toggle-dropdown-state', false);
        return;
      }
      this.$emit('confirm-replace', data);
    },
  },
};
</script>
<style lang="scss" src="./crownDropdown.scss" scoped />
