<script>
import IntermediateEvent from '@/components/nodes/intermediateEvent/intermediateEvent';
import clockIcon from '@/assets/intermediate-clock.svg?raw';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: IntermediateEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: clockIcon,
    };
  },
};
</script>
