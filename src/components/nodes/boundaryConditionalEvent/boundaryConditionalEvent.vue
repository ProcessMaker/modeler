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
        'ref-x': 3,
        'ref-y': 3,
        width: 20,
        height: 20,
      },
    });
  },
};
</script>
