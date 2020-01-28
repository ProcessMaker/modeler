<script>
import EndEvent from '@/components/nodes/endEvent/endEvent';
import signalEndEventIcon from '@/assets/signal-end-event.svg';
import pull from 'lodash/pull';

export default {
  extends: EndEvent,
  props: ['rootElements'],
  mounted() {
    this.shape.attr({
      image: {
        'ref-y': 2,
        'xlink:href': signalEndEventIcon,
      },
    });
  },
  destroyed() {
    pull(this.rootElements, this.error);
  },
};
</script>
