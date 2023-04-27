<script>
import BoundaryEvent from '@/components/nodes/boundaryEvent/boundaryEvent';
import timerEventIcon from '@/assets/timer-event-icon.svg?raw';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: BoundaryEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: timerEventIcon,
    };
  },
};
</script>
