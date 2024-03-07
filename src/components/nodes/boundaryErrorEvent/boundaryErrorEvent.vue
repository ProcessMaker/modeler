<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import errorBoltIcon from '@/assets/boundary-error-event-icon.svg?raw';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: BoundaryEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: errorBoltIcon,
    };
  },
};
</script>
