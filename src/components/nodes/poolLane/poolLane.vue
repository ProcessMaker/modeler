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
    v-on="$listeners"
  />
</template>

<script>
import { util } from 'jointjs';
import resizeConfig from '@/mixins/resizeConfig';
import { labelWidth } from '../pool/poolSizes';
import pull from 'lodash/pull';
import { poolColor } from '@/components/nodeColors';
import CrownConfig from '@/components/crown/crownConfig/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';
import { getPoolLine } from './poolLaneShape';
import documentingIcons from '@/mixins/documentingIcons';
import store from '@/store';


export default {
  components: {
    CrownConfig,
  },
  props: [
    'graph',
    'node',
    'nodes',
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
  mixins: [highlightConfig, resizeConfig, documentingIcons],
  data() {
    return {
      shape: null,
      definition: null,
    };
  },
  watch: {
    'node.definition.name'(name) {
      this.shape.attr('label/text', name);
    },
  },
  mounted() {
    const bounds = this.node.diagram.bounds;

    this.shape = getPoolLine(bounds, store.getters.isForDocumenting);
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);

    this.shape.set('elementMove', false);
    this.shape.attr('body/cursor', 'default');
    this.shape.attr('body', {
      fill: poolColor,
    });
    this.shape.attr('label', {
      text: util.breakText(this.node.definition.get('name'), { width: bounds.height }),
      fill: 'black',
      transform: 'rotate(-90)',
      refX: labelWidth / 2,
    });

    this.shape.component = this;
    this.shape.addTo(this.graph);

    this.initDocumentingIcons({ labelX: `${bounds.width + 7}px`, labelY: '-4px' });


    if (!this.planeElements.includes(this.node.diagram)) {
      this.planeElements.push(this.node.diagram);
    }
  },
  beforeDestroy() {
    /* Resize the parent pool to fill in the space where the lane was deleted.
     * If this was the 2nd last lane, remove all lanes and revert the pool back to normal. */

    const poolComponent = this.node.pool.component;
    const lanes = poolComponent.laneSet.get('lanes');

    pull(lanes, this.node.definition);

    if (lanes.length === 0) {
      /* Last lane being removed; remove laneSet */
      poolComponent.containingProcess.set('laneSets', []);
      poolComponent.laneSet = null;

      return;
    }
  },
};
</script>
