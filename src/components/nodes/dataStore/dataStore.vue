<template>
  <crown-config
    :highlighted="highlighted"
    :paper="paper"
    :graph="graph"
    :shape="shape"
    :node="node"
    :nodeRegistry="nodeRegistry"
    :moddle="moddle"
    :collaboration="collaboration"
    :process-node="processNode"
    :plane-elements="planeElements"
    :is-rendering="isRendering"
    :dropdown-data="dropdownData"
    v-on="$listeners"
  />
</template>

<script>
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';
import hideLabelOnDrag from '@/mixins/hideLabelOnDrag';
import { getDataStoreShape } from './shape';
import portsConfig from '@/mixins/portsConfig';
import documentingIcons from '@/mixins/documentingIcons';
import store from '@/store';

export default {
  components: {
    CrownConfig,
  },
  props: [
    'graph',
    'node',
    'id',
    'highlighted',
    'nodeRegistry',
    'moddle',
    'paper',
    'collaboration',
    'processNode',
    'planeElements',
    'isRendering',
  ],
  mixins: [highlightConfig, hideLabelOnDrag, portsConfig, documentingIcons],
  data() {
    return {
      shape: null,
      definition: null,
      dropdownData: [],
    };
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('label/text', name);
    },
  },
  mounted() {
    this.shape = getDataStoreShape(store.getters.isForDocumenting);
    this.shape.attr('label/text', this.node.definition.get('name'));

    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);
    this.shape.addTo(this.graph);
    this.shape.component = this;

    this.initDocumentingIcons({ labelX: '39px', labelY: '-4px' });
  },
};
</script>
