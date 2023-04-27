<script>
import baseStartEvent from '@/components/nodes/baseStartEvent/baseStartEvent';
import conditionalIcon from '@/assets/conditional-icon.svg?raw';

export default {
  extends: baseStartEvent,
  data() {
    return {
      nodeIcon: conditionalIcon,
    };
  },
  mounted() {
    const bounds = this.node.diagram.bounds;
    this.shape.attr({
      image: {
        'ref-x': 7,
        'ref-y': 7,
        'width': bounds.get('width') - 14,
        'height': bounds.get('height') - 14,
      },
    });
  },
};
</script>
