<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import getIntermediateMailIconShapeAttributes from '@/mixins/intermediateMailIcon';
import intermediateMailSymbol from '@/assets/intermediate-mail.svg';

export default {
  extends: IntermediateEvent,
  mounted() {
    const shapeAttributes = getIntermediateMailIconShapeAttributes(intermediateMailSymbol, '#fbbe02', 2, '#fff4d1');
    this.shape.attr(shapeAttributes);
  },
};
</script>
