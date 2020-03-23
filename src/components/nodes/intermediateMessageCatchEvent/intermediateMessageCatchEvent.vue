<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import getIntermediateMailIconShapeAttributes from '@/mixins/intermediateMailIcon';
import intermediateMailSymbol from '@/assets/intermediate-mail.svg';
import { intermediateColor, intermediateColorStroke } from '@/components/nodeColors';

export default {
  extends: IntermediateEvent,
  mounted() {
    const shapeAttributes = getIntermediateMailIconShapeAttributes(
      intermediateMailSymbol,
      intermediateColorStroke,
      2,
      intermediateColor,
    );
    this.shape.attr(shapeAttributes);
  },
};
</script>
