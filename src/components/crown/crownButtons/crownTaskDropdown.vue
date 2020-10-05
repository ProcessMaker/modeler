<template>
  <div class="cog-container" v-if="dropdownData.length > 0" role="menuitem">
    <crown-button
      data-test="select-type-dropdown"
      id="dropdown-button"
      aria-label="Select a type"
      v-on="$listeners"
      @click="$emit('toggle-dropdown-state', !dropdownOpen)"
    >
      <i class="fas fa-cog cog-container--button" />
    </crown-button>

    <ul class="element-list" v-if="dropdownOpen" role="list">
      <li class="element-list--item" role="listitem" v-for="{label, nodeType, dataTest, disabled} in dropdownData" :key="nodeType" :id="nodeType">
        <button
          :data-test="dataTest"
          class="element-list--item__button"
          type="button"
          :disabled="isDisabled(disabled, node, nodeType)"
          @click="replaceNode({ node, typeToReplaceWith: nodeType })"
        >{{ $t(label) }}
        </button>
        <b-tooltip
          v-if="isDisabled(disabled, node, nodeType)"
          :target="nodeType"
          variant="warning"
          placement="right"
        >
          {{ $t(tooltip(disabled, node, nodeType)) }}
        </b-tooltip>
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
    isDisabled(disabled, node, target) {
      return disabled && (disabled instanceof Function ? disabled.apply(this, [node, target]): disabled);
    },
    tooltip(disabled, node, target) {
      return this.isDisabled(disabled, node, target) || '';
    },
    replaceNode(data) {
      if (data.node.type === data.typeToReplaceWith) {
        this.$emit('toggle-dropdown-state', false);
        return;
      }
      this.$emit('replace-node-type', data);
    },
  },
};
</script>
<style lang="scss" src="./crownDropdown.scss" scoped />
