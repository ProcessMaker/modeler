<script>
import EndEvent from '@/components/nodes/endEvent/endEvent';
import signalEndEventIcon from '@/assets/signal-end-event.svg';

export default {
  extends: EndEvent,
  mounted() {
    this.shape.attr({
      image: {
        'ref-y': 3,
        'xlink:href': signalEndEventIcon,
      },
    });
  },
};
</script>
