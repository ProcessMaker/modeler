<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import getIntermediateMailIconShapeAttributes from '@/mixins/intermediateMailIcon';

export default {
  extends: BoundaryEvent,
  methods: {
    isValidBoundaryEventTarget(model) {
      const component = model.component;
      return component && component.node.definition.$type === 'bpmn:CallActivity';
    },
  },
  mounted() {
    const shapeAttributes = getIntermediateMailIconShapeAttributes();
    this.shape.attr(shapeAttributes);
  },
};
</script>
