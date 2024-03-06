<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import conditionalIcon from '@/assets/conditional-icon.svg?raw';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: IntermediateEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: conditionalIcon,
    };
  },
  mounted() {
    const bounds = this.node.diagram.bounds;
    this.shape.attr({
      image: {
        'ref-x': 9,
        'ref-y': 9,
        'width': bounds.get('width') - 18,
        'height': bounds.get('height') - 18,
      },
    });
  },
};
</script>
