<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import conditionalIcon from '!!svg-inline-loader!@/assets/conditional-icon.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: BoundaryEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: conditionalIcon,
    };
  },
  mounted() {
    this.shape.attr({
      image: {
        'ref-x': 4,
        'ref-y': 4,
        width: 18,
        height: 18,
      },
    });
  },
};
</script>
