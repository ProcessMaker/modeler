<script>
import clockIcon from '@/assets/clock.svg';
import baseStartEvent from '@/components/nodes/baseStartEvent/baseStartEvent';

export default {
  extends: baseStartEvent,
  data() {
    return {
      nodeIcon: clockIcon,
    };
  },
};
</script>
