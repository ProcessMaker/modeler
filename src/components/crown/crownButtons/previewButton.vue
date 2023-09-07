<template>
  <crown-button
    :title="$t('Preview')"
    role="menuitem"
    id="delete-button"
    aria-label="Preview"
    @click="preview()"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
  >
    <i class="fas fa-eye cog-container--button"/>
  </crown-button>
</template>

<script>
import trashIcon from '@/assets/trash-alt-solid.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';
import { removeFlows } from '@/components/crown/utils.js';

export default {
  components: { CrownButton },
  props: { graph: Object, shape: Object, node: Object },
  data() {
    return {
      trashIcon,
    };
  },
  computed: {
    isPoolLane() {
      return this.node.type === 'processmaker-modeler-lane';
    },
  },
  methods: {
    preview() {
      console.log('preview...');
      this.$emit('preview-node', this.node);
    },
  },
};
</script>