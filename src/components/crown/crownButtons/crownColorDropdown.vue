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

    <ul class="element-list" v-if="dropdownOpen" role="list">
      <li class="element-list--item" role="listitem">
        COLOR!
      </li>
    </ul>
  </div>
</template>

<script>
import CrownButton from '@/components/crown/crownButtons/crownButton';

export default {
  props: {
    dropdownOpen: {
      type: Boolean,
      required: true,
    },
    node: Object,
  },
  components: { CrownButton },
  created() {
    this.$t = this.$t.bind(this);
  },
};
</script>
