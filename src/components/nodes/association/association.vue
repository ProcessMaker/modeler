<template>
  <div>
  </div>
</template>

<script>
import joint from 'jointjs';
import crownConfig from '@/mixins/crownConfig';
import get from 'lodash/get';
import debounce from 'lodash/debounce';

export default {
  props: ['graph', 'node', 'id'],
  mixins: [crownConfig],
  data() {
    return {
      shape: null,
      definition: null,
      sourceShape: null,
      validConnections: {
        'processmaker-modeler-text-annotation': [
          'processmaker-modeler-task',
          'processmaker-modeler-start-event',
          'processmaker-modeler-end-event',
          'processmaker-modeler-exclusive-gateway',
          'processmaker-modeler-inclusive-gateway',
          'processmaker-modeler-parallel-gateway',
        ],
      },
    };
  },
  computed: {
    targetType() {
      return this.targetShape && this.targetShape.component.node.type;
    },
  },
  methods: {
    handleClick() {
      this.$parent.setInspector(this.node.definition, this.inspectorConfig);
    },
    updateShape() {},
    completeLink() {
      this.shape.stopListening(this.paper, 'cell:mouseleave');
      this.shape.stopListening(this.paper, 'blank:pointerclick link:pointerclick', this.removeLink);
      this.shape.attr({ wrapper: { cursor: 'default' } });

      this.resetPaper();

      const sourceShape = this.shape.getTargetElement();

      this.node.definition.sourceRef = sourceShape.component.node.definition;

      this.updateWaypoints();

      sourceShape.attr({
        body: { fill: '#fff', cursor: 'move' },
        label: { cursor: 'move' },
      });

      this.shape.listenTo(this.targetShape, 'change:position', this.updateWaypoints);
      this.shape.listenTo(sourceShape, 'change:position', this.updateWaypoints);
    },
    updateWaypoints() {
      const connections = this.shape.findView(this.paper).getConnection();
      const points = connections.segments.map(segment => segment.end);

      this.node.diagram.waypoint = points.map(point => moddle.create('dc:Point', point));
      this.updateCrownPosition();
    },
    updateLinkTarget({ clientX, clientY }) {
      const localMousePosition = this.paper.clientToLocalPoint({ x: clientX, y: clientY });
      const [target] = this.graph.findModelsFromPoint(localMousePosition);
      const sourceType = get(target, 'component.node.type');

      if (!sourceType || !this.validConnections[this.targetType].includes(sourceType)) {
        this.shape.target({
          x: localMousePosition.x,
          y: localMousePosition.y,
        });
        return;
      }

      this.shape.target(target);
      target.attr({
        body: { fill: '#dffdd0', cursor: 'default' },
        label: { cursor: 'default' },
      });

      this.paper.el.removeEventListener('mousemove', this.updateLinkTarget);
      this.shape.listenToOnce(this.paper, 'cell:pointerclick', this.completeLink);

      this.shape.listenToOnce(this.paper, 'cell:mouseleave', () => {
        this.paper.el.addEventListener('mousemove', this.updateLinkTarget);
        this.shape.stopListening(this.paper, 'cell:pointerclick', this.completeLink);

        target.attr({
          body: { fill: '#fff', cursor: 'move' },
          label: { cursor: 'move' },
        });
      });
    },
    removeLink() {
      this.removeShape();
      this.resetPaper();
    },
    resetPaper() {
      this.paper.el.style.cursor = 'default';
      this.paper.el.removeEventListener('mousemove', this.updateLinkTarget);
      this.paper.setInteractivity(this.graph.get('interactiveFunc'));
    },
  },
  created() {
    this.updateWaypoints = debounce(this.updateWaypoints, 100);
  },
  mounted() {
    this.targetShape = this.$parent.nodes[this.node.definition.get('targetRef').get('id')].component.shape;
    const sourcePoint = this.node.definition.get('sourceRef');

    this.paper.setInteractivity(false);
    this.shape = new joint.shapes.standard.Link({ router: { name: 'normal' } });
    this.shape.attr({
      wrapper: {
        cursor: 'not-allowed',
      },
      line: {
        stroke: 'black',
        strokeWidth: '4',
        strokeLinecap: 'round',
        strokeDasharray: '1, 8',
        strokeDashoffset: '5',
        targetMarker: {
          'type': 'rect',
          'width': 1,
          'height': 1,
          'stroke': 'none',
        },
      },
    });
    this.shape.source(this.targetShape);
    this.shape.target(sourcePoint);
    this.shape.addTo(this.graph);

    this.paper.el.addEventListener('mousemove', this.updateLinkTarget);
    this.paper.el.style.cursor = 'not-allowed';
    this.shape.listenToOnce(this.paper, 'blank:pointerclick link:pointerclick', this.removeLink);

    this.shape.component = this;
    this.$parent.nodes[this.id].component = this;
  },
  destroyed() {
    this.updateWaypoints.cancel();
  },
};
</script>

<style lang="scss" scoped>
</style>

