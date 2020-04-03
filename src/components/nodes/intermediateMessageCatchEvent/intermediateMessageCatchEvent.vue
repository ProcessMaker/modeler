<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import getIntermediateMailIconShapeAttributes from '@/mixins/intermediateMailIcon';
import intermediateMailSymbol from '!!svg-inline-loader!@/assets/intermediate-mail.svg';
import { intermediateColor, intermediateColorStroke } from '@/components/nodeColors';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: IntermediateEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: intermediateMailSymbol,
    };
  },
  mounted() {
    const shapeAttributes = getIntermediateMailIconShapeAttributes(
      intermediateColorStroke,
      2,
      intermediateColor,
    );
    this.shape.attr(shapeAttributes);
  },
};
</script>
