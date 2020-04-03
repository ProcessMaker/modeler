<script>
import StartEvent from '@/components/nodes/startEvent/startEvent';
import clockIcon from '!!svg-inline-loader!@/assets/clock.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: StartEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: clockIcon,
    };
  },
};
</script>
