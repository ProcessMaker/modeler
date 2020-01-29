<script>
import startEvent from '../startEvent/startEvent';
import signalStartEventIcon from '@/assets/signal-start-event.svg';

export default {
  extends: startEvent,
  mounted() {
    this.shape.attr({
      image: {
        'ref-x': 5,
        'ref-y': 3,
        'xlink:href': signalStartEventIcon,
      },
    });
  },
};
</script>
