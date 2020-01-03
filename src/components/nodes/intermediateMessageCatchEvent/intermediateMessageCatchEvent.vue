<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import getIntermediateMailIconShapeAttributes from '@/mixins/intermediateMailIcon';

export default {
  extends: IntermediateEvent,
  mounted() {
    const shapeAttributes = getIntermediateMailIconShapeAttributes('#fbbe02', 2, '#fff4d1');
    this.shape.attr(shapeAttributes);
  },
};
</script>
