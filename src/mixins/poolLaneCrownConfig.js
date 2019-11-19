export default {
  computed: {
    isLane() {
      return this.node.type === 'processmaker-modeler-lane';
    },
  },
  methods: {
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
    this.$nextTick(() => {
      /* Use nextTick to ensure this code runs after the component it is mixed into mounts.
       * This will ensure this.shape is defined. */

      this.configurePoolLane();
    });
  },
};
