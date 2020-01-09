<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import getIntermediateMailIconShapeAttributes from '@/mixins/intermediateMailIcon';
import boundaryMessageMailSymbol from '@/assets/boundary-message-event.svg';

export default {
  extends: BoundaryEvent,
  methods: {
    isValidBoundaryEventTarget(model) {
      const component = model.component;
      return component && component.node.isBpmnType('bpmn:CallActivity');
    },
  },
  mounted() {
    const shapeAttributes = getIntermediateMailIconShapeAttributes(boundaryMessageMailSymbol);
    this.shape.attr(shapeAttributes);
  },
};
</script>
