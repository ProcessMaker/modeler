<template>
  <div class="cog-container" role="menuitem">
    <crown-button
      v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
      :title="$t('Open Color Palette')"
      :aria-label="$t('Open Color Palette')"
      role="menuitem"
      @click="$emit('toggle-dropdown-state', !dropdownOpen)"
    >
      <i class="fas fa-palette cog-container--button"/>
    </crown-button>

    <div class="element-list color-list" v-if="dropdownOpen">
      <button
        type="button"
        class="color-button"
        @click="unsetNodeColor"
      />
      <button
        type="button"
        class="color-button"
        v-for="color in colors" :key="color"
        :style="{ backgroundColor: color }"
        @click="setNodeColor(color)"
      />
    </div>
  </div>
</template>

<script>
import CrownButton from '@/components/crown/crownButtons/crownButton';
import store from '@/store';
import Vue from 'vue';

export default {
  props: {
    dropdownOpen: {
      type: Boolean,
      required: true,
    },
    node: Object,
  },
  components: { CrownButton },
  data() {
    return {
      colors: [
        '#357bf6',
        '#f6c243',
        '#6d747c',
        '#4ba0b5',
        '#53a451',
        '#cc444a',
      ],
    };
  },
  methods: {
    unsetNodeColor() {
      store.commit('updateNodeProp', { node: this.node, key: 'color', value: undefined });
      this.$emit('save-state');
    },
    setNodeColor(color) {
      Vue.set(this.node.definition, 'color', color);
      store.commit('updateNodeProp', { node: this.node, key: 'color', value: color });
      this.$emit('save-state');
    },
  },
  created() {
    this.$t = this.$t.bind(this);
  },
};
</script>

<style lang="scss" scoped>
  .color-list {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: 0.5rem;
    padding: 0.5rem;

    > .color-button {
      background: $primary-white;
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 50%;
      border: 2px solid white;
      position: relative;
    }
  }
</style>
