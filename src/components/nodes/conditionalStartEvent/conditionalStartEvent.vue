<script>
import startEvent from '../startEvent/startEvent';
import conditionalIcon from '!!svg-inline-loader!@/assets/conditional-icon.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: startEvent,
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
        'ref-x': 6,
        'ref-y': 6,
        'width': bounds.get('width') - 12,
        'height': bounds.get('height') - 12,
      },
    });
  },
};
</script>
