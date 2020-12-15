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
        v-for="color in colors.slice(0,4)" :key="color"
        :style="{ backgroundColor: color }"
        @click="selectedColor = color"
      />

      <button
        v-if="showCustomIconPicker"
        type="button"
        class="color-button p-0 fa fa-drafting-compass"
        data-test="set-custom-icon"
        @click="setCustomIcon"
      />

      <div
        v-else
      />

      <button
        type="button"
        class="color-button"
        :data-test="color"
        v-for="color in colors.slice(4,8)" :key="color"
        :style="{ backgroundColor: color }"
        @click="selectedColor = color"
      />

      <button
        type="button"
        class="color-button toggle-picker"
        @click="colorPickerOpen = !colorPickerOpen"
      />

      <button
        type="button"
        class="color-button p-0 fa fa-undo-alt"
        data-test="clear-color"
        @click="unsetNodeColor"
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
import manualIcon from '!!svg-inline-loader!@/assets/book.svg';

export default {
  props: {
    dropdownOpen: {
      type: Boolean,
      required: true,
    },
    node: Object,
    showCustomIconPicker: {
      type: Boolean,
      default: false,
    },
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
      store.commit('updateNodeProp', { node: this.node, key: 'color', value: undefined });
      store.commit('updateNodeProp', { node:this.node, key: 'customIcon', value: undefined });
      Vue.set(this.node.definition, 'color', undefined);
      Vue.set(this.node.definition, 'customIcon', undefined);
      this.$emit('save-state');
    },
    setNodeColor(color) {
      store.commit('updateNodeProp', { node: this.node, key: 'color', value: color });
      Vue.set(this.node.definition, 'color', color);
      this.$emit('save-state');
    },
    setCustomIcon() {
      store.commit('updateNodeProp', { node:this.node, key: 'customIcon', value: btoa(manualIcon) });
      Vue.set(this.node.definition, 'customIcon', btoa(manualIcon));
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
    grid-template-rows: repeat(5, 1fr);
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
