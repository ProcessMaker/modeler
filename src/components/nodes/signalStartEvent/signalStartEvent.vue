<script>
import baseStartEvent from '@/components/nodes/baseStartEvent/baseStartEvent';
import signalStartEventIcon from '!!svg-inline-loader!@/assets/signal-start-event.svg';

export default {
  extends: baseStartEvent,
  data() {
    return {
      nodeIcon: signalStartEventIcon,
    };
  },
  mounted() {
    this.shape.attr({
      image: {
        'ref-x': 5,
        'ref-y': 3,
      },
    });
  },
};
</script>
