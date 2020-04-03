<template>
  <div class="cog-container" role="menuitem">
    <crown-button
      v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
      :title="$t('Open Color Palette')"
      :aria-label="$t('Open Color Palette')"
      role="menuitem"
      @click="$emit('toggle-dropdown-state', !dropdownOpen)"
      data-test="picker-dropdown-button"
    >
      <i class="fas fa-palette cog-container--button"/>
    </crown-button>

    <div class="element-list color-list" v-if="dropdownOpen">
      <button
        type="button"
        class="color-button"
        :data-test="color"
        v-for="color in colors" :key="color"
        :style="{ backgroundColor: color }"
        @click="selectedColor = color"
      />

      <button
        type="button"
        class="color-button"
        data-test="clear-color"
        @click="selectedColor = null"
      />

      <button
        type="button"
        class="color-button toggle-picker"
        @click="colorPickerOpen = !colorPickerOpen"
      />

      <sketch-picker
        v-if="colorPickerOpen"
        :value="selectedColor || '#fff'"
        :presetColors="null"
        class="color-picker"
        @input="setColorFromPicker"
      />
    </div>
  </div>
</template>

<script>
import CrownButton from '@/components/crown/crownButtons/crownButton';
import store from '@/store';
import Vue from 'vue';
import { baseNodeColors } from '@/components/nodeColors';
import { Sketch } from 'vue-color';

export default {
  props: {
    dropdownOpen: {
      type: Boolean,
      required: true,
    },
    node: Object,
  },
  components: { CrownButton, 'sketch-picker': Sketch },
  data() {
    return {
      colors: baseNodeColors,
      selectedColor: this.node.definition.get('color'),
      colorPickerOpen: false,
    };
  },
  watch: {
    selectedColor(color) {
      if (!color) {
        this.unsetNodeColor();
        return;
      }

      this.setNodeColor(color);
    },
  },
  methods: {
    setColorFromPicker({ hex8 }) {
      this.selectedColor = hex8;
    },
    unsetNodeColor() {
      Vue.delete(this.node.definition, 'color');
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
    grid-template-rows: repeat(4, 1fr);
    grid-auto-flow: column;
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

  .color-picker {
    position: absolute;
    right: 40px;
    top: calc(100% - 36px);
  }

  .toggle-picker {
    background: center / cover no-repeat url('../../../assets/color-wheel.png') !important;
  }
</style>
