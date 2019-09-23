<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import escalationIcon from '@/assets/boundary-escalation-icon.svg';

export default {
  extends: BoundaryEvent,
  mounted() {
    this.shape.attr('image/xlink:href', escalationIcon);
  },
};
</script>
