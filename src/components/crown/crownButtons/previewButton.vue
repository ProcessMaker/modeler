<template>
  <crown-button
    v-if="displayIcon"
    :title="$t('Preview')"
    role="menuitem"
    id="preview-button"
    aria-label="Preview"
    data-test="preview-button"
    @click="preview()"
    v-b-tooltip.hover.viewport.d50="{ customClass: 'no-pointer-events' }"
  >
    <i class="fas fa-eye cog-container--button"/>
  </crown-button>
</template>

<script>
import trashIcon from '@/assets/trash-alt-solid.svg';
import CrownButton from '@/components/crown/crownButtons/crownButton';
import validPreviewElements from '@/components/crown/crownButtons/validPreviewElements';

export default {
  components: { CrownButton },
  props: { graph: Object, shape: Object, node: Object },
  data() {
    return {
      trashIcon,
      validPreviewElements,
      displayIcon: false,
    };
  },
  mounted() {
    const defaultDataTransform = (node) => Object.entries(node.definition).reduce((data, [key, value]) => {
      data[key] = value;
      return data;
    }, {});
    const nodeData = defaultDataTransform(this.node);

    const previewConfig = window.ProcessMaker.$modeler.previewConfigs.find(config => {
      return config.matcher(nodeData);
    });
    this.displayIcon =  !!previewConfig;
  },
  computed: {
    isPoolLane() {
      return this.node.type === 'processmaker-modeler-lane';
    },
  },
  methods: {
    preview() {
      this.$emit('previewNode', this.node);
    },
  },
};
</script>