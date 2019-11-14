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
    @remove-node="$emit('remove-node', $event)"
    @add-node="$emit('add-node', $event)"
    @save-state="$emit('save-state', $event)"
  />
</template>

<script>
import { shapes, util } from 'jointjs';
import resizeConfig from '@/mixins/resizeConfig';
import { labelWidth } from '../pool/poolSizes';
import pull from 'lodash/pull';
import { poolColor } from '@/components/nodeColors';
import CrownConfig from '@/components/crownConfig';
import highlightConfig from '@/mixins/highlightConfig';

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
  mixins: [highlightConfig, resizeConfig],
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
  computed: {
    isLane() {
      return this.node.type === 'processmaker-modeler-lane';
    },
  },
  methods: {
    removeShape() {
      this.$emit('remove-node', this.node);

      const poolComponent = this.node.pool.component;
      const sortedLanes = poolComponent.sortedLanes();

      if (sortedLanes.length === 2) {
      /* Do not allow pool with only one lane;
       * if removing 2nd last lane, remove the other lane as well */
        this.$emit('remove-node', sortedLanes.filter(lane => lane !== this.shape)[0].component.node);
        return;
      }

      if (this.shape === sortedLanes[sortedLanes.length - 1]) {
        poolComponent.fillLanes(this.shape, 'top-right', true);
        return;
      }

      poolComponent.fillLanes(this.shape, 'bottom-right', true);
    },
    // @todo check this
    configurePoolLane() {
      if ([
        'processmaker-modeler-pool',
        'processmaker-modeler-sequence-flow',
        'processmaker-modeler-association',
        'processmaker-modeler-message-flow',
      ].includes(this.node.type)) {
        return;
      }

      if (this.node.pool) {
        if (!this.graph.getCell(this.node.pool)) {
          this.node.pool = this.graph.getElements().find(element => {
            return element.component && element.component.node === this.node.pool.component.node;
          });
        }

        this.node.pool.component.addToPool(this.shape);

        if (this.isLane) {
          this.configureLaneInParentPool();
        }

        return;
      }

      /* If we are over a pool or lane, add the shape to the pool or lane */
      const pool = this.graph.findModelsInArea(this.shape.getBBox()).filter(model => {
        return model.component && model.component.node.type === 'processmaker-modeler-pool';
      })[0];

      if (pool) {
        this.node.pool = pool;
        this.node.pool.component.addToPool(this.shape);

        if (this.isLane) {
          this.configureLaneInParentPool();
        }
      }
    },
    configureLaneInParentPool() {
      const poolComponent = this.node.pool.component;
      if (!poolComponent.laneSet) {
        poolComponent.createLaneSet();
      }

      const lanes = poolComponent.laneSet.get('lanes');
      if (!lanes.includes(this.node.definition)) {
        lanes.push(this.node.definition);
      }
    },
  },
  mounted() {
    this.shape = new shapes.standard.Rectangle();
    this.shape.set('type', 'PoolLane');
    const bounds = this.node.diagram.bounds;
    this.shape.position(bounds.x, bounds.y);
    this.shape.resize(bounds.width, bounds.height);

    this.shape.set('elementMove', false);
    this.shape.attr('body/cursor', 'default');
    this.shape.attr('body', {
      fill: poolColor,
      originalFill: poolColor,
    });
    this.shape.attr('label', {
      text: util.breakText(this.node.definition.get('name'), { width: bounds.height }),
      fill: 'black',
      transform: 'rotate(-90)',
      refX: labelWidth / 2,
    });

    this.shape.component = this;
    this.shape.addTo(this.graph);

    this.configurePoolLane();
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
