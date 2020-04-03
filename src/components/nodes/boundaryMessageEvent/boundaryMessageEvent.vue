<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import getIntermediateMailIconShapeAttributes from '@/mixins/intermediateMailIcon';
import boundaryMessageMailSymbol from '!!svg-inline-loader!@/assets/boundary-message-event.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: BoundaryEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: boundaryMessageMailSymbol,
    };
  },
  methods: {
    isValidBoundaryEventTarget(model) {
      const component = model.component;
      return component && component.node.isBpmnType('bpmn:CallActivity');
    },
  },
  mounted() {
    const shapeAttributes = getIntermediateMailIconShapeAttributes();
    this.shape.attr(shapeAttributes);
  },
};
</script>
