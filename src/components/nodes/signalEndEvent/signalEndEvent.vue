<script>
import EndEvent from '@/components/nodes/endEvent/endEvent';
import signalEndEventIcon from '!!svg-inline-loader!@/assets/signal-end-event.svg';
import updateIconColor from '@/mixins/updateIconColor';

export default {
  extends: EndEvent,
  mixins: [updateIconColor],
  data() {
    return {
      nodeIcon: signalEndEventIcon,
    };
  },
  mounted() {
    this.shape.attr({
      image: {
        'ref-y': 3,
      },
    });
  },
};
</script>
