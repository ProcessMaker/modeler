<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import conditionalIcon from '!!svg-inline-loader!@/assets/conditional-icon.svg';
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
        'ref-x': 8,
        'ref-y': 8,
        'width': bounds.get('width') - 16,
        'height': bounds.get('height') - 16,
      },
    });
  },
};
</script>
